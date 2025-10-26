import React, { useState, useEffect, useRef } from 'react';
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
  
  // 初始化流量跟踪
  React.useEffect(() => {
    initTrafficTracking();
  }, []);

  // 初始化用户在线状态追踪
  React.useEffect(() => {
    if (currentUser && currentUser.id) {
      // 清理之前的 presence
      if (presenceCleanupRef.current) {
        presenceCleanupRef.current();
      }
      
      // 初始化新的 presence
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
  
  // 检查URL参数来显示管理员面板
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);
  
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
    const guestUser: User = { 
      ...profile, 
      id: `guest-${profile.nickname}`,
      friends: []
    };
    
    // 保存Guest用户到localStorage，使其刷新后不会退出
    localStorage.setItem('chatsphere_current_user', JSON.stringify(guestUser));
    
    // 清理过期房间
    import('./services/roomService').then(({ cleanupExpiredRooms }) => {
      cleanupExpiredRooms();
    });
    
    setCurrentUser(guestUser);
  };

  const handleLogout = () => {
    // 清理在线状态
    if (currentUser) {
      cleanupUserPresence(currentUser);
    }
    logout();
    setCurrentUser(null);
  }

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