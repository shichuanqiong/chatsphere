import { ref, set, onDisconnect, remove, onValue, get } from 'firebase/database';
import { realtimeDB } from './firebase';

// 加入房间
export const joinRoomPresence = async (roomId: string, uid: string) => {
  const memberRef = ref(realtimeDB, `roomMembers/${roomId}/${uid}`);
  
  try {
    // 注册断线自动移除
    await onDisconnect(memberRef).remove();
    // 加入房间
    await set(memberRef, {
      joinedAt: Date.now(),
      lastActive: Date.now(),
    });
  } catch (error) {
    console.error('Error joining room presence:', error);
  }
};

// 离开房间
export const leaveRoomPresence = async (roomId: string, uid: string) => {
  const memberRef = ref(realtimeDB, `roomMembers/${roomId}/${uid}`);
  
  try {
    await remove(memberRef);
  } catch (error) {
    console.error('Error leaving room presence:', error);
  }
};

// 监听房间在线人数
export const subscribeToRoomMemberCount = (
  roomId: string, 
  callback: (count: number) => void
) => {
  const rmRef = ref(realtimeDB, `roomMembers/${roomId}`);
  
  return onValue(rmRef, (snapshot) => {
    const members = snapshot.val();
    const count = members ? Object.keys(members).length : 0;
    callback(count);
  });
};

// 获取房间在线成员
export const getRoomOnlineMembers = async (roomId: string): Promise<string[]> => {
  const rmRef = ref(realtimeDB, `roomMembers/${roomId}`);
  const snapshot = await get(rmRef);
  const members = snapshot.val();
  
  if (!members) return [];
  
  return Object.keys(members);
};
