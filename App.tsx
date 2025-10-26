import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, UserProfile } from './types';
import AuthScreen from './components/AuthScreen';
import ChatScreen from './components/ChatScreen';
import AdminApp from './components/AdminApp';
import { getCurrentUser, logout } from './services/authService';
import { initTrafficTracking } from './services/trafficTrackingService';
import { initUserPresence, cleanupUserPresence } from './services/presenceService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [showAdmin, setShowAdmin] = useState(false);
  const presenceCleanupRef = useRef<(() => void) | null>(null);

  // 定义退出函数（需要在 useEffect 之前）
  const handleLogout = useCallback(() => {
    // 清理在线状态
    if (currentUser) {
      cleanupUserPresence(currentUser);
    }
    logout();
    setCurrentUser(null);
  }, [currentUser]);
  
  // 初始化流量跟踪
  React.useEffect(() => {
    initTrafficTracking();
  }, []);
  
  // 检查URL参数来显示管理员面板（刷新时保持）
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdmin(true);
    }
    
    // 检查 localStorage 中的管理员状态
    const adminData = localStorage.getItem('chatsphere_admin');
    if (adminData) {
      setShowAdmin(true);
    }
  }, []);

  // 初始化用户在线状态追踪
  React.useEffect(() => {
    if (currentUser) {
      // 清理之前的 presence
      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
      }
      
      // 初始化新的 presence（包括 Guest）
      initUserPresence(currentUser).then(cleanup => {
        presenceCleanupRef.current = cleanup;
      });
    }
    
    // 清理函数
    return () => {
      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
      }
    };
  }, [currentUser]);

  // 30分钟自动退出功能
  React.useEffect(() => {
    if (!currentUser) return;

    let inactivityTimer: NodeJS.Timeout | null = null;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30分钟（毫秒）

    const resetTimer = () => {
      // 清除之前的计时器
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // 设置新的计时器
      inactivityTimer = setTimeout(() => {
        console.log('🕐 用户已静默30分钟，自动退出');
        handleLogout();
      }, INACTIVITY_TIME);
    };

    // 监听用户活动
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    // 初始化计时器
    resetTimer();

    // 清理函数
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [currentUser, handleLogout]);
  
  // 检查快捷键来显示管理员面板
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
      
      // Ctrl+Shift+A 打开管理员面板
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        console.log('Opening admin panel');
        setShowAdmin(true);
      }
      // Escape 关闭管理员面板
      if (e.key === 'Escape') {
        console.log('Closing admin panel');
        setShowAdmin(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAuthSuccess = (user: User) => {
    // 强制刷新用户状态
    setCurrentUser(null);
    setTimeout(() => {
      setCurrentUser(user);
    }, 0);
  };

  const handleGuestLogin = (profile: UserProfile) => {
    const guestUser = { 
      ...profile, 
      id: `guest-${profile.nickname}`,
      friends: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isGuest: true,  // 明确标记为 guest
      userType: 'guest'  // 添加用户类型字段
    } as User & { createdAt: string; lastActivity: string; isGuest: boolean; userType: string };
    
    // 保存Guest用户到localStorage，使其刷新后不会退出
    localStorage.setItem('chatsphere_current_user', JSON.stringify(guestUser));
    
    // 同时保存到用户列表中（用于统计）
    const allUsers = JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
    const existingUserIndex = allUsers.findIndex((u: any) => u.id === guestUser.id);
    if (existingUserIndex >= 0) {
      // 更新现有用户，添加 createdAt 和 lastActivity 字段
      allUsers[existingUserIndex] = {
        ...allUsers[existingUserIndex],
        ...guestUser,
        createdAt: allUsers[existingUserIndex].createdAt || guestUser.createdAt,
        lastActivity: new Date().toISOString()
      };
    } else {
      allUsers.push(guestUser);
    }
    localStorage.setItem('chatsphere_users', JSON.stringify(allUsers));
    
    console.log('✅ Guest user saved to chatsphere_users:', guestUser);
    console.log('✅ Guest user ID:', guestUser.id);
    console.log('✅ Total users in storage:', allUsers.length);
    console.log('✅ Guest users in storage:', allUsers.filter(u => u.id && u.id.startsWith('guest-')));
    console.log('✅ Full localStorage check:', JSON.parse(localStorage.getItem('chatsphere_users') || '[]'));
    
    // 清理过期房间
    import('./services/roomService').then(({ cleanupExpiredRooms }) => {
      cleanupExpiredRooms();
    });
    
    setCurrentUser(guestUser);
  };

  // 如果显示管理员面板
  if (showAdmin) {
    return <AdminApp />;
  }

  return (
    <div className="w-full h-screen bg-primary font-sans">
      {currentUser ? (
        <ChatScreen user={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} onGuestLogin={handleGuestLogin} />
      )}
    </div>
  );
};

export default App;