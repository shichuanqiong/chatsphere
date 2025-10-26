import type { User, ChatRoom, Message, PrivateMessage } from '../types';

// 用户统计数据
export interface UserStats {
  totalUsers: number;
  registeredUsers: number;
  guestUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

// 房间统计数据
export interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  expiredRooms: number;
  publicRooms: number;
  privateRooms: number;
  roomsCreatedToday: number;
  roomsCreatedThisWeek: number;
  roomsCreatedThisMonth: number;
}

// 消息统计数据
export interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  averageMessagesPerUser: number;
  averageMessagesPerRoom: number;
}

// 系统统计数据
export interface SystemStats {
  storageUsage: {
    total: number;
    users: number;
    rooms: number;
    messages: number;
    percentage: number;
  };
  performance: {
    averageLoadTime: number;
    uptime: number;
    errorRate: number;
  };
}

// 获取用户统计数据
export const getUserStats = (): UserStats => {
  // 直接从 localStorage 读取最新数据（不使用缓存）
  const rawUsers = JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
  
  // 使用 rawUsers 而不是再处理
  const users = rawUsers;
  
  // 如果没有任何用户，返回空统计数据
  if (!users || users.length === 0) {
    return {
      totalUsers: 0,
      registeredUsers: 0,
      guestUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0
    };
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 兼容两种判断方式：1) id 前缀 "guest-", 2) isGuest 字段
  const registeredUsers = users.filter((u: User) => {
    if (!u.id) return false;
    const isGuestById = u.id.startsWith('guest-');
    const isGuestByField = (u as any).isGuest === true;
    return !(isGuestById || isGuestByField);
  });
  
  const guestUsers = users.filter((u: User) => {
    if (!u.id) return false;
    const isGuestById = u.id.startsWith('guest-');
    const isGuestByField = (u as any).isGuest === true;
    return isGuestById || isGuestByField;
  });
  
  const newUsersToday = users.filter((u: User) => {
    const createdAt = new Date(u.createdAt || now.toISOString());
    return createdAt >= today;
  }).length;

  const newUsersThisWeek = users.filter((u: User) => {
    const createdAt = new Date(u.createdAt || now.toISOString());
    return createdAt >= weekAgo;
  }).length;

  const newUsersThisMonth = users.filter((u: User) => {
    const createdAt = new Date(u.createdAt || now.toISOString());
    return createdAt >= monthAgo;
  }).length;

  // 计算活跃用户 (最近24小时内有活动的用户)
  const activeUsers = users.filter((u: User) => {
    const lastActivity = new Date(u.lastActivity || u.createdAt || now.toISOString());
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return lastActivity >= dayAgo;
  }).length;

  return {
    totalUsers: users.length,
    registeredUsers: registeredUsers.length,
    guestUsers: guestUsers.length,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth
  };
};

// 获取房间统计数据
export const getRoomStats = (): RoomStats => {
  const rooms = JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activeRooms = rooms.filter((r: ChatRoom) => !isRoomExpired(r));
  const expiredRooms = rooms.filter((r: ChatRoom) => isRoomExpired(r));
  const publicRooms = rooms.filter((r: ChatRoom) => r.roomType === 'public');
  const privateRooms = rooms.filter((r: ChatRoom) => r.roomType === 'private');

  const roomsCreatedToday = rooms.filter((r: ChatRoom) => {
    const createdAt = new Date(r.createdAt || now.toISOString());
    return createdAt >= today;
  }).length;

  const roomsCreatedThisWeek = rooms.filter((r: ChatRoom) => {
    const createdAt = new Date(r.createdAt || now.toISOString());
    return createdAt >= weekAgo;
  }).length;

  const roomsCreatedThisMonth = rooms.filter((r: ChatRoom) => {
    const createdAt = new Date(r.createdAt || now.toISOString());
    return createdAt >= monthAgo;
  }).length;

  return {
    totalRooms: rooms.length,
    activeRooms: activeRooms.length,
    expiredRooms: expiredRooms.length,
    publicRooms: publicRooms.length,
    privateRooms: privateRooms.length,
    roomsCreatedToday,
    roomsCreatedThisWeek,
    roomsCreatedThisMonth
  };
};

// 获取消息统计数据
export const getMessageStats = (): MessageStats => {
  const rooms = JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
  const privateChats = JSON.parse(localStorage.getItem('privateChats') || '[]');
  const officialMessages = JSON.parse(localStorage.getItem('chatsphere_official_rooms_messages') || '{}');
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 计算所有消息
  let allMessages: any[] = [];
  
  // 房间消息
  rooms.forEach((room: ChatRoom) => {
    allMessages = allMessages.concat(room.messages || []);
  });
  
  // 私聊消息
  privateChats.forEach((chat: any) => {
    allMessages = allMessages.concat(chat.messages || []);
  });
  
  // 官方房间消息
  Object.values(officialMessages).forEach((messages: any) => {
    allMessages = allMessages.concat(messages || []);
  });

  const messagesToday = allMessages.filter((msg: any) => {
    const timestamp = new Date(msg.timestamp || now.toISOString());
    return timestamp >= today;
  }).length;

  const messagesThisWeek = allMessages.filter((msg: any) => {
    const timestamp = new Date(msg.timestamp || now.toISOString());
    return timestamp >= weekAgo;
  }).length;

  const messagesThisMonth = allMessages.filter((msg: any) => {
    const timestamp = new Date(msg.timestamp || now.toISOString());
    return timestamp >= monthAgo;
  }).length;

  const users = JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
  const activeRooms = rooms.filter((r: ChatRoom) => !isRoomExpired(r));

  return {
    totalMessages: allMessages.length,
    messagesToday,
    messagesThisWeek,
    messagesThisMonth,
    averageMessagesPerUser: users.length > 0 ? Math.round(allMessages.length / users.length) : 0,
    averageMessagesPerRoom: activeRooms.length > 0 ? Math.round(allMessages.length / activeRooms.length) : 0
  };
};

// 获取系统统计数据
export const getSystemStats = (): SystemStats => {
  const storageUsage = calculateStorageUsage();
  
  return {
    storageUsage,
    performance: {
      averageLoadTime: 1.2, // 模拟数据
      uptime: 99.9, // 模拟数据
      errorRate: 0.1 // 模拟数据
    }
  };
};

// 计算存储使用情况
const calculateStorageUsage = () => {
  let totalSize = 0;
  let usersSize = 0;
  let roomsSize = 0;
  let messagesSize = 0;

  // 计算各部分的存储大小
  const users = localStorage.getItem('chatsphere_users') || '';
  const rooms = localStorage.getItem('chatsphere_rooms') || '';
  const privateChats = localStorage.getItem('privateChats') || '';
  const officialMessages = localStorage.getItem('chatsphere_official_rooms_messages') || '';

  usersSize = new Blob([users]).size;
  roomsSize = new Blob([rooms]).size;
  messagesSize = new Blob([privateChats]).size + new Blob([officialMessages]).size;
  
  totalSize = usersSize + roomsSize + messagesSize;

  // 假设localStorage限制为5MB
  const maxStorage = 5 * 1024 * 1024;
  const percentage = (totalSize / maxStorage) * 100;

  return {
    total: totalSize,
    users: usersSize,
    rooms: roomsSize,
    messages: messagesSize,
    percentage: Math.round(percentage * 100) / 100
  };
};

// 检查房间是否过期 (从roomService导入逻辑)
const isRoomExpired = (room: ChatRoom): boolean => {
  if (!room.createdAt || room.isOfficial) return false;
  
  const createdAt = new Date(room.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff >= 6; // 6小时过期
};

// 获取所有用户列表 (管理员用)
export const getAllUsersForAdmin = (): User[] => {
  return JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
};

// 获取所有房间列表 (管理员用)
export const getAllRoomsForAdmin = (): ChatRoom[] => {
  return JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
};

// 删除用户 (管理员操作)
export const deleteUser = (userId: string): boolean => {
  const users = JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
  const userIndex = users.findIndex((u: User) => u.id === userId);
  
  if (userIndex === -1) return false;
  
  users.splice(userIndex, 1);
  localStorage.setItem('chatsphere_users', JSON.stringify(users));
  
  // 同时清理相关数据
  cleanupUserData(userId);
  
  return true;
};

// 清理用户相关数据
const cleanupUserData = (userId: string): void => {
  // 清理房间中的用户
  const rooms = JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
  rooms.forEach((room: ChatRoom) => {
    room.participants = room.participants.filter(p => p.id !== userId);
  });
  localStorage.setItem('chatsphere_rooms', JSON.stringify(rooms));
  
  // 清理私聊记录
  const privateChats = JSON.parse(localStorage.getItem('privateChats') || '[]');
  const filteredChats = privateChats.filter((chat: any) => 
    !chat.participants.includes(userId)
  );
  localStorage.setItem('privateChats', JSON.stringify(filteredChats));
};

// 删除房间 (管理员操作)
export const deleteRoom = (roomId: string): boolean => {
  const rooms = JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
  const roomIndex = rooms.findIndex((r: ChatRoom) => r.id === roomId);
  
  if (roomIndex === -1) return false;
  
  rooms.splice(roomIndex, 1);
  localStorage.setItem('chatsphere_rooms', JSON.stringify(rooms));
  
  return true;
};
