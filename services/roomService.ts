import type { ChatRoom, User } from '../types';
import { db } from './firebase';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';

const ROOMS_KEY = 'chatsphere_rooms';
const OFFICIAL_ROOMS_MESSAGES_KEY = 'chatsphere_official_rooms_messages';
const KICKED_USERS_KEY = 'chatsphere_kicked_users'; // 被踢用户黑名单
const ROOM_EXPIRY_HOURS = 6; // 房间6小时后过期
const MESSAGE_EXPIRY_DAYS = 7; // 消息7天后过期
const ROOM_CREATION_LIMIT = 2; // 一小时内最多创建2个房间
const ROOM_CREATION_WINDOW_HOURS = 1; // 限制时间窗口：1小时
const ROOMS_COLLECTION = 'rooms';

// 获取所有房间
export const getRooms = (): ChatRoom[] => {
  const rooms = localStorage.getItem(ROOMS_KEY);
  return rooms ? JSON.parse(rooms) : [];
};

// 保存房间
const saveRooms = (rooms: ChatRoom[]): void => {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
};

// 检查用户是否可以创建房间
export const canUserCreateRoom = (userId: string): { canCreate: boolean; message?: string; remainingTime?: number } => {
  const rooms = getRooms();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - ROOM_CREATION_WINDOW_HOURS * 60 * 60 * 1000);
  
  // 获取用户在过去一小时内创建的房间
  const recentRooms = rooms.filter(room => 
    room.hostId === userId && 
    room.createdAt && 
    new Date(room.createdAt) > oneHourAgo
  );
  
  if (recentRooms.length >= ROOM_CREATION_LIMIT) {
    // 计算还需要等待多长时间
    const oldestRecentRoom = recentRooms.reduce((oldest, room) => {
      const roomTime = new Date(room.createdAt!);
      return roomTime < oldest ? roomTime : oldest;
    }, new Date());
    
    const nextAllowedTime = new Date(oldestRecentRoom.getTime() + ROOM_CREATION_WINDOW_HOURS * 60 * 60 * 1000);
    const remainingMinutes = Math.ceil((nextAllowedTime.getTime() - now.getTime()) / (1000 * 60));
    
    return {
      canCreate: false,
      message: `You can only create ${ROOM_CREATION_LIMIT} rooms per hour. Please wait ${remainingMinutes} minutes.`,
      remainingTime: remainingMinutes
    };
  }
  
  return { canCreate: true };
};

// 创建新房间
export const createRoom = async (name: string, host: User, roomType: 'public' | 'private' = 'public', icon: string = 'chat'): Promise<ChatRoom> => {
  const rooms = getRooms();
  const newRoom: ChatRoom = {
    id: `room-${Date.now()}`,
    name,
    host,
    hostId: host.id,
    participants: [host],
    messages: [{
      id: `initial-${Date.now()}`,
      text: `${host.nickname} created the ${roomType} room "${name}"!`,
      sender: host,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }],
    isOfficial: false,
    createdAt: new Date().toISOString(),
    roomType,
    invitedUsers: roomType === 'private' ? [] : undefined,
    icon
  };
  
  // 保存到 Firestore（跨设备同步）
  try {
    // 只保存非 undefined 的字段
    const firestoreRoom: any = {
      id: newRoom.id,
      name: newRoom.name,
      host: newRoom.host,
      hostId: newRoom.hostId,
      participants: newRoom.participants,
      messages: newRoom.messages,
      isOfficial: newRoom.isOfficial,
      createdAt: Timestamp.now(),
      roomType: newRoom.roomType,
      icon: newRoom.icon
    };
    
    // 只有私有房间才添加 invitedUsers
    if (roomType === 'private' && newRoom.invitedUsers) {
      firestoreRoom.invitedUsers = newRoom.invitedUsers;
    }
    
    await setDoc(doc(db, ROOMS_COLLECTION, newRoom.id), firestoreRoom);
    console.log('Room saved to Firestore:', newRoom.id);
  } catch (error) {
    console.error('Error saving room to Firestore:', error);
  }
  
  // 同时保存到 localStorage（兼容性）
  rooms.push(newRoom);
  saveRooms(rooms);
  
  return newRoom;
};

// 更新房间
export const updateRoom = (roomId: string, updates: Partial<ChatRoom>): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) return false;
  
  rooms[roomIndex] = { ...rooms[roomIndex], ...updates };
  saveRooms(rooms);
  return true;
};

// 添加消息到房间
export const addMessageToRoom = async (roomId: string, message: any): Promise<boolean> => {
  console.log('🔵 addMessageToRoom called:', { roomId, message });
  
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) {
    console.log('❌ Room not found:', roomId);
    return false;
  }
  
  rooms[roomIndex].messages.push(message);
  saveRooms(rooms);
  
  // 同步到 Firebase Firestore
  try {
    const roomRef = doc(db, 'rooms', roomId);
    console.log('📝 Updating Firestore doc:', roomId, 'with', rooms[roomIndex].messages.length, 'messages');
    await updateDoc(roomRef, {
      messages: rooms[roomIndex].messages,
      lastUpdated: Date.now()
    });
    console.log('✅ Message synced to Firestore:', roomId);
  } catch (error) {
    console.error('❌ Failed to sync message to Firestore:', error);
    // 尝试创建文档
    try {
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        ...rooms[roomIndex],
        lastUpdated: Date.now()
      }, { merge: true });
      console.log('✅ Created room in Firestore:', roomId);
    } catch (createError) {
      console.error('❌ Failed to create room in Firestore:', createError);
    }
  }
  
  return true;
};

// 用户加入房间
export const joinRoom = (roomId: string, user: User): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) return false;
  
  const room = rooms[roomIndex];
  
  // 检查用户是否被踢出
  if (isUserKickedFromRoom(roomId, user.id)) {
    return false;
  }
  
  // 检查用户是否已经在房间中
  if (!room.participants.some(p => p.id === user.id || (p.nickname === user.nickname && !p.id && !user.id))) {
    room.participants.push(user);
    // 添加加入消息
    room.messages.push({
      id: `join-${Date.now()}`,
      text: `${user.nickname} joined the room`,
      sender: user,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveRooms(rooms);
  }
  
  return true;
};

// 用户离开房间
export const leaveRoom = (roomId: string, userId: string): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) return false;
  
  const room = rooms[roomIndex];
  const userIndex = room.participants.findIndex(p => p.id === userId);
  
  if (userIndex === -1) return false;
  
  const user = room.participants[userIndex];
  room.participants.splice(userIndex, 1);
  
  // 添加离开消息
  room.messages.push({
    id: `leave-${Date.now()}`,
    text: `${user.nickname} left the room`,
    sender: user,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  
  saveRooms(rooms);
  return true;
};

// 检查房间是否过期
export const isRoomExpired = (room: ChatRoom): boolean => {
  if (!room.createdAt || room.isOfficial) return false;
  
  const createdAt = new Date(room.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // 如果房间超过6小时，检查房主是否还在线
  if (hoursDiff >= ROOM_EXPIRY_HOURS) {
    // 检查房主是否还在任何房间中
    const allRooms = getRooms();
    const hostId = room.participants[0]?.id; // 假设第一个参与者是房主
    
    if (hostId) {
      const isHostOnline = allRooms.some(r => 
        r.participants.some(p => p.id === hostId)
      );
      
      // 如果房主不在线，房间过期
      return !isHostOnline;
    }
    
    // 如果没有房主ID，房间过期
    return true;
  }
  
  return false;
};

// 清理过期房间
export const cleanupExpiredRooms = (): ChatRoom[] => {
  const rooms = getRooms();
  const activeRooms = rooms.filter(room => !isRoomExpired(room));
  
  if (activeRooms.length !== rooms.length) {
    saveRooms(activeRooms);
  }
  
  return activeRooms;
};

// 获取所有用户创建的房间（非官方房间）
export const getUserCreatedRooms = (userId: string): ChatRoom[] => {
  const rooms = getRooms();
  return rooms.filter(room => 
    !room.isOfficial && 
    !isRoomExpired(room)
  );
};

// 获取所有活跃房间（包括官方房间）
export const getAllActiveRooms = (officialRooms: ChatRoom[]): ChatRoom[] => {
  const userRooms = cleanupExpiredRooms();
  return [...officialRooms, ...userRooms];
};

// 检查用户是否在房间中
export const isUserInRoom = (roomId: string, userId: string): boolean => {
  const rooms = getRooms();
  const room = rooms.find(r => r.id === roomId);
  return room ? room.participants.some(p => p.id === userId) : false;
};

// 获取房间信息
export const getRoomById = (roomId: string): ChatRoom | null => {
  const rooms = getRooms();
  return rooms.find(r => r.id === roomId) || null;
};

// 官方房间消息管理
export const getOfficialRoomMessages = (roomId: string): any[] => {
  const messages = localStorage.getItem(OFFICIAL_ROOMS_MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : {};
  return allMessages[roomId] || [];
};

export const addOfficialRoomMessage = async (roomId: string, message: any): Promise<void> => {
  console.log('🔵 addOfficialRoomMessage called:', { roomId, message });
  
  const messages = localStorage.getItem(OFFICIAL_ROOMS_MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : {};
  
  if (!allMessages[roomId]) {
    allMessages[roomId] = [];
  }
  
  allMessages[roomId].push(message);
  localStorage.setItem(OFFICIAL_ROOMS_MESSAGES_KEY, JSON.stringify(allMessages));
  
  // 同步到 Firestore
  try {
    // 尝试更新现有的room document
    const roomsSnapshot = await getDocs(collection(db, ROOMS_COLLECTION));
    let firestoreRoomDoc = null;
    
    roomsSnapshot.forEach((doc) => {
      if (doc.id === roomId) {
        firestoreRoomDoc = doc;
      }
    });
    
    if (firestoreRoomDoc) {
      const existingMessages = firestoreRoomDoc.data().messages || [];
      console.log('📝 Updating existing room in Firestore:', roomId);
      await updateDoc(firestoreRoomDoc.ref, {
        messages: [...existingMessages, message],
        lastUpdated: Date.now()
      });
      console.log('✅ Official room message synced to Firestore:', roomId);
    } else {
      // 创建新的官方房间文档
      const officialRoom = OFFICIAL_ROOMS.find(r => r.id === roomId);
      console.log('📝 Creating new official room in Firestore:', roomId);
      await setDoc(doc(db, ROOMS_COLLECTION, roomId), {
        id: roomId,
        name: officialRoom?.name || roomId,
        isOfficial: true,
        messages: allMessages[roomId],
        hostId: 'system',
        host: { nickname: 'System', id: 'system' },
        participants: [],
        createdAt: new Date().toISOString(),
        roomType: 'public',
        lastUpdated: Date.now()
      }, { merge: true });
      console.log('✅ Created/updated official room in Firestore:', roomId);
    }
  } catch (error) {
    console.error('❌ Failed to sync official room message to Firestore:', error);
  }
};

// 检查消息是否过期
export const isMessageExpired = (message: any): boolean => {
  if (!message.timestamp) return false;
  
  // 尝试解析时间戳
  let messageTime: Date;
  try {
    // 如果是ISO字符串格式
    if (message.timestamp.includes('T') || message.timestamp.includes('-')) {
      messageTime = new Date(message.timestamp);
    } else {
      // 如果是时间格式 (如 "2:30 PM" 或 "14:30")
      const now = new Date();
      let hour24: number;
      let minutes: number;
      
      if (message.timestamp.includes(' ')) {
        // 12小时制格式 "2:30 PM"
        const [time, period] = message.timestamp.split(' ');
        const [hours, mins] = time.split(':');
        hour24 = parseInt(hours);
        minutes = parseInt(mins);
        
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
      } else {
        // 24小时制格式 "14:30"
        const [hours, mins] = message.timestamp.split(':');
        hour24 = parseInt(hours);
        minutes = parseInt(mins);
      }
      
      messageTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour24, minutes);
      
      // 如果解析的时间比现在晚，说明是昨天的时间
      if (messageTime > now) {
        messageTime.setDate(messageTime.getDate() - 1);
      }
    }
    
    // 验证解析的时间是否合理
    if (isNaN(messageTime.getTime())) {
      return true; // 无效时间，认为已过期
    }
    
  } catch (error) {
    // 如果解析失败，假设消息是旧的
    return true;
  }
  
  const now = new Date();
  const daysDiff = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysDiff > MESSAGE_EXPIRY_DAYS;
};

// 清理过期的官方房间消息
export const cleanupExpiredOfficialMessages = (): void => {
  const messages = localStorage.getItem(OFFICIAL_ROOMS_MESSAGES_KEY);
  if (!messages) return;
  
  const allMessages = JSON.parse(messages);
  let hasChanges = false;
  
  Object.keys(allMessages).forEach(roomId => {
    const roomMessages = allMessages[roomId];
    const validMessages = roomMessages.filter((msg: any) => !isMessageExpired(msg));
    
    if (validMessages.length !== roomMessages.length) {
      allMessages[roomId] = validMessages;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    localStorage.setItem(OFFICIAL_ROOMS_MESSAGES_KEY, JSON.stringify(allMessages));
  }
};

// 获取存储使用情况
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  let used = 0;
  
  // 计算localStorage使用量
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length;
    }
  }
  
  // 大多数浏览器的localStorage限制是5-10MB
  const total = 5 * 1024 * 1024; // 5MB
  const percentage = (used / total) * 100;
  
  return { used, total, percentage };
};

// 强制清理所有过期数据
export const forceCleanupAllExpiredData = (): void => {
  // 清理过期房间
  cleanupExpiredRooms();
  
  // 清理过期官方房间消息
  cleanupExpiredOfficialMessages();
  
  console.log('Storage cleanup completed. Current usage:', getStorageUsage());
};

export const getOfficialRoomWithMessages = (officialRoom: ChatRoom): ChatRoom => {
  // 先清理过期消息
  cleanupExpiredOfficialMessages();
  
  const additionalMessages = getOfficialRoomMessages(officialRoom.id);
  return {
    ...officialRoom,
    messages: [...officialRoom.messages, ...additionalMessages]
  };
};

// 检查用户是否可以加入房间
export const canUserJoinRoom = (room: ChatRoom, userId: string): boolean => {
  // 官方房间所有人都可以加入
  if (room.isOfficial) {
    return true;
  }
  
  // 公开房间所有人都可以加入
  if (room.roomType === 'public') {
    return true;
  }
  
  // 私有房间只有被邀请的用户可以加入
  if (room.roomType === 'private') {
    return room.invitedUsers?.includes(userId) || false;
  }
  
  // 默认情况下不允许加入
  return false;
};

// 邀请用户到私有房间
export const inviteUserToRoom = (roomId: string, userId: string): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1 || rooms[roomIndex].roomType !== 'private') {
    return false;
  }
  
  const room = rooms[roomIndex];
  if (!room.invitedUsers) {
    room.invitedUsers = [];
  }
  
  if (!room.invitedUsers.includes(userId)) {
    room.invitedUsers.push(userId);
    saveRooms(rooms);
    return true;
  }
  
  return false;
};

// 获取被踢用户黑名单
const getKickedUsers = (): { [roomId: string]: string[] } => {
  const kickedUsers = localStorage.getItem(KICKED_USERS_KEY);
  return kickedUsers ? JSON.parse(kickedUsers) : {};
};

// 保存被踢用户黑名单
const saveKickedUsers = (kickedUsers: { [roomId: string]: string[] }): void => {
  localStorage.setItem(KICKED_USERS_KEY, JSON.stringify(kickedUsers));
};

// 检查用户是否被踢出房间
export const isUserKickedFromRoom = (roomId: string, userId: string): boolean => {
  const kickedUsers = getKickedUsers();
  return kickedUsers[roomId]?.includes(userId) || false;
};

// 踢出用户
export const kickUserFromRoom = (roomId: string, userId: string, kickedBy: string): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) {
    return false;
  }
  
  const room = rooms[roomIndex];
  
  // 检查操作者是否是房主
  if (room.hostId !== kickedBy) {
    return false;
  }
  
  // 不能踢出房主自己
  if (room.hostId === userId) {
    return false;
  }
  
  // 从房间参与者中移除用户
  room.participants = room.participants.filter(p => p.id !== userId);
  
  // 添加到被踢用户黑名单
  const kickedUsers = getKickedUsers();
  if (!kickedUsers[roomId]) {
    kickedUsers[roomId] = [];
  }
  if (!kickedUsers[roomId].includes(userId)) {
    kickedUsers[roomId].push(userId);
  }
  
  // 保存更改
  saveRooms(rooms);
  saveKickedUsers(kickedUsers);
  
  return true;
};

// 取消踢出用户（房主可以取消踢出）
export const unkickUserFromRoom = (roomId: string, userId: string, unkickedBy: string): boolean => {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  
  if (roomIndex === -1) {
    return false;
  }
  
  const room = rooms[roomIndex];
  
  // 检查操作者是否是房主
  if (room.hostId !== unkickedBy) {
    return false;
  }
  
  // 从被踢用户黑名单中移除
  const kickedUsers = getKickedUsers();
  if (kickedUsers[roomId]) {
    kickedUsers[roomId] = kickedUsers[roomId].filter(id => id !== userId);
    saveKickedUsers(kickedUsers);
  }
  
  return true;
};

// 检查用户是否可以加入房间（包括被踢检查）
export const canUserJoinRoomWithKickCheck = (roomId: string, userId: string): boolean => {
  // 首先检查基本权限
  if (!canUserJoinRoom(roomId, userId)) {
    return false;
  }
  
  // 检查是否被踢出
  if (isUserKickedFromRoom(roomId, userId)) {
    return false;
  }
  
  return true;
};

// 从 Firestore 加载所有房间（跨设备同步）
export const syncRoomsFromFirestore = async (): Promise<ChatRoom[]> => {
  try {
    const roomsSnapshot = await getDocs(collection(db, ROOMS_COLLECTION));
    const firestoreRooms: ChatRoom[] = [];
    
    roomsSnapshot.forEach((doc) => {
      const data = doc.data();
      firestoreRooms.push({
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      } as ChatRoom);
    });
    
    // 更新本地 localStorage
    if (firestoreRooms.length > 0) {
      const existingRooms = getRooms();
      const mergedRooms = [...existingRooms, ...firestoreRooms];
      const uniqueRooms = mergedRooms.filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      );
      saveRooms(uniqueRooms);
      return uniqueRooms;
    }
    
    return getRooms();
  } catch (error) {
    console.error('Error syncing rooms from Firestore:', error);
    return getRooms(); // 失败时返回本地数据
  }
};

// 实时监听房间变化
export const subscribeToRoomsChanges = (callback: (rooms: ChatRoom[]) => void): (() => void) => {
  try {
    console.log('🔵 Subscribing to Firestore rooms changes...');
    const unsubscribe = onSnapshot(collection(db, ROOMS_COLLECTION), (snapshot) => {
      console.log('📊 Firestore snapshot changed:', snapshot.docs.length, 'docs');
      const rooms: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Room from Firestore:', doc.id, 'has', data.messages?.length || 0, 'messages');
        rooms.push({
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        } as ChatRoom);
      });
      
      // 更新本地存储
      saveRooms(rooms);
      console.log('✅ Updated rooms from Firestore:', rooms.length, 'rooms');
      callback(rooms);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error subscribing to rooms changes:', error);
    return () => {}; // 返回空的取消订阅函数
  }
};

// 更新房间到 Firestore
export const updateRoomInFirestore = async (room: ChatRoom): Promise<void> => {
  try {
    await updateDoc(doc(db, ROOMS_COLLECTION, room.id), {
      ...room,
      createdAt: Timestamp.fromDate(new Date(room.createdAt || new Date()))
    });
  } catch (error) {
    console.error('Error updating room in Firestore:', error);
  }
};
