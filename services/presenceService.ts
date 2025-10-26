import { ref, onValue, onDisconnect, set, push, remove, update, serverTimestamp, get } from 'firebase/database';
import { realtimeDB } from './firebase';
import type { User } from '../types';

// 监听在线状态变化
export const subscribeToOnlineStatus = (callback: (onlineUsers: { [uid: string]: boolean }) => void) => {
  const statusRef = ref(realtimeDB, 'status');
  
  return onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val();
    const onlineUsers: { [uid: string]: boolean } = {};
    
    if (statuses) {
      Object.keys(statuses).forEach(uid => {
        onlineUsers[uid] = statuses[uid]?.state === 'online';
      });
    }
    
    callback(onlineUsers);
  });
};

// 设置用户在线状态（在 App.tsx 中调用）
export const initUserPresence = async (user: User) => {
  if (!user.id) return;
  
  const uid = user.id;
  const infoRef = ref(realtimeDB, '.info/connected');
  const userStatusRef = ref(realtimeDB, `status/${uid}`);
  const connsRef = ref(realtimeDB, `connections/${uid}`);
  
  // 为当前标签页创建唯一的连接节点
  const thisConnRef = push(connsRef);
  
  // 监听 Firebase 连接状态
  const unsubscribe = onValue(infoRef, async (snap) => {
    if (snap.val() === false) return; // 未连接
    
    try {
      // 1) 注册断线自动清理
      await onDisconnect(thisConnRef).remove();
      await onDisconnect(userStatusRef).set({
        state: 'offline',
        last_changed: serverTimestamp(),
      });
      
      // 2) 标记当前连接为在线
      await set(thisConnRef, true);
      
      // 3) 更新用户状态为在线
      await update(userStatusRef, {
        state: 'online',
        last_changed: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error setting user presence:', error);
    }
  });
  
  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    remove(thisConnRef).catch(console.error);
  });
  
  return () => {
    unsubscribe();
    remove(thisConnRef).catch(console.error);
  };
};

// 退出登录时清理
export const cleanupUserPresence = async (user: User) => {
  if (!user.id) return;
  
  const uid = user.id;
  const userStatusRef = ref(realtimeDB, `status/${uid}`);
  const connsRef = ref(realtimeDB, `connections/${uid}`);
  
  try {
    // 清理状态
    await remove(userStatusRef);
    // 清理所有连接
    await remove(connsRef);
  } catch (error) {
    console.error('Error cleaning up user presence:', error);
  }
};

// 获取在线用户列表
export const getOnlineUsers = async (): Promise<string[]> => {
  const statusRef = ref(realtimeDB, 'status');
  const snapshot = await get(statusRef);
  const statuses = snapshot.val();
  
  if (!statuses) return [];
  
  return Object.keys(statuses).filter(uid => statuses[uid]?.state === 'online');
};
