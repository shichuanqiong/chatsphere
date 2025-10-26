import { ref, onValue, onDisconnect, set, push, remove, update, serverTimestamp, get } from 'firebase/database';
import { realtimeDB } from './firebase';
import type { User } from '../types';

// 全局：当前连接引用和清理函数
let thisConnRef: ReturnType<typeof ref> | null = null;
let presenceUnsubscribe: (() => void) | null = null;
let currentUid: string | null = null;

// 监听在线状态变化
export const subscribeToOnlineStatus = (callback: (onlineUsers: { [uid: string]: boolean }) => void) => {
  const statusRef = ref(realtimeDB, 'status');
  
  console.log('🔍 Subscribing to online status...');
  
  return onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val();
    const onlineUsers: { [uid: string]: boolean } = {};
    
    console.log('📊 Status data:', statuses);
    
    if (statuses) {
      Object.keys(statuses).forEach(uid => {
        // 只返回真正在线的用户
        if (statuses[uid]?.state === 'online') {
          onlineUsers[uid] = true;
        }
      });
    }
    
    console.log('👥 Online users:', Object.keys(onlineUsers).length, onlineUsers);
    callback(onlineUsers);
  });
};

// 设置用户在线状态（标准代码）
export const initUserPresence = async (user: User) => {
  // Guest 用户也需要在线状态
  const uid = user.id || `guest-${user.nickname}`;
  
  // 如果已经是同一个用户，不需要重复初始化
  if (currentUid === uid) {
    console.log('⏭️ User presence already initialized for', uid);
    return () => {
      // 返回空的清理函数
    };
  }
  
  // 清理之前的 presence
  if (currentUid) {
    console.log('🧹 Cleaning up previous presence for', currentUid);
    if (thisConnRef) {
      remove(thisConnRef).catch(console.error);
    }
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
    }
  }
  
  currentUid = uid;
  
  const infoRef = ref(realtimeDB, '.info/connected');
  const userStatusRef = ref(realtimeDB, `status/${uid}`);
  const connsRef = ref(realtimeDB, `connections/${uid}`);
  
  // 每个标签页创建唯一的连接节点
  thisConnRef = push(connsRef);
  
  // 监听 Firebase 连接状态
  presenceUnsubscribe = onValue(infoRef, async (snap) => {
    if (snap.val() !== true) return; // 未连接
    
    // 确保当前仍然是同一个用户
    if (currentUid !== uid) {
      console.log('⚠️ User changed, skipping presence setup');
      return;
    }
    
    try {
      // 1) 必须先注册 onDisconnect，再写入
      await onDisconnect(thisConnRef!).remove();
      await onDisconnect(userStatusRef).set({
        state: 'offline',
        last_changed: serverTimestamp(),
      });
      
      // 2) 该连接上线
      await set(thisConnRef!, true);
      
      // 3) 汇总状态：只要有任意连接 -> online
      await update(userStatusRef, {
        state: 'online',
        last_changed: serverTimestamp(),
      });
      
      console.log('✅ Presence registered for', uid);
    } catch (error) {
      console.error('❌ Error setting user presence:', error);
    }
  });
  
  // 页面卸载时清理
  const beforeUnloadHandler = () => {
    if (thisConnRef) {
      remove(thisConnRef).catch(console.error);
    }
  };
  window.addEventListener('beforeunload', beforeUnloadHandler);
  
  return () => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    if (currentUid === uid) {
      if (presenceUnsubscribe) {
        presenceUnsubscribe();
      }
      if (thisConnRef) {
        remove(thisConnRef).catch(console.error);
      }
      currentUid = null;
    }
  };
};

// 退出登录时清理
export const cleanupUserPresence = async (user: User) => {
  const uid = user.id || `guest-${user.nickname}`;
  const userStatusRef = ref(realtimeDB, `status/${uid}`);
  const connsRef = ref(realtimeDB, `connections/${uid}`);
  
  try {
    // 清理本地状态
    if (currentUid === uid) {
      currentUid = null;
    }
    if (thisConnRef) {
      remove(thisConnRef).catch(console.error);
      thisConnRef = null;
    }
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
      presenceUnsubscribe = null;
    }
    
    // 清理 RTDB 状态
    await remove(userStatusRef);
    // 清理所有连接
    await remove(connsRef);
    console.log('✅ Cleaned up presence for', uid);
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