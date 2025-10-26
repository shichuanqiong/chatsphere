import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { getUnreadNotificationCount } from '../services/notificationService';
import { getPrivateChats } from '../services/chatHistoryService';
import { BellIcon, MessageIcon, HistoryIcon, VolumeUpIcon, VolumeOffIcon, LogoIcon } from './icons';
import AdPlaceholder from './AdPlaceholder';

interface TopNavigationProps {
  currentUser: User;
  onOpenInbox: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  isGuest: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  currentUser, 
  onOpenInbox, 
  onOpenHistory, 
  onLogout,
  onEditProfile,
  isGuest 
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadPrivateMessages, setUnreadPrivateMessages] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isGuest || !currentUser.id) return;
    
    const updateCounts = () => {
      const notificationCount = getUnreadNotificationCount(currentUser.id!);
      const privateChats = getPrivateChats(currentUser.id!);
      const privateMessageCount = privateChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
      
      setUnreadNotifications(notificationCount);
      setUnreadPrivateMessages(privateMessageCount);
    };

    updateCounts();
    
    // Update counts every 5 seconds
    const interval = setInterval(updateCounts, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id, isGuest]);

  // Show notification when new messages arrive
  useEffect(() => {
    if (isMuted || isGuest || !currentUser.id) return;
    
    const checkForNewMessages = () => {
      const notificationCount = getUnreadNotificationCount(currentUser.id!);
      const privateChats = getPrivateChats(currentUser.id!);
      const privateMessageCount = privateChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
      
      if (notificationCount > unreadNotifications || privateMessageCount > unreadPrivateMessages) {
        setNotificationMessage(
          notificationCount > unreadNotifications 
            ? `You have ${notificationCount} new notifications`
            : `You have ${privateMessageCount} new messages`
        );
        setShowNotification(true);
        
        // Play notification sound
        playNotificationSound();
        
        // Auto hide after 3 seconds
        setTimeout(() => setShowNotification(false), 3000);
      }
    };

    const interval = setInterval(checkForNewMessages, 2000);
    return () => clearInterval(interval);
  }, [unreadNotifications, unreadPrivateMessages, isMuted, isGuest, currentUser.id]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (showNotification) {
      setShowNotification(false);
    }
  };

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      {/* Top Navigation Bar */}
        <div className="bg-secondary/80 backdrop-blur-sm border-b border-accent/40 px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Left side - Brand with Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <LogoIcon className="w-12 h-12 drop-shadow-lg" />
            <div className="absolute inset-0 w-12 h-12 bg-highlight/20 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-text-primary tracking-wide">ChatSphere</h1>
            <p className="text-xs text-text-secondary -mt-1 font-medium">Connect & Chat</p>
          </div>
        </div>

        {/* Center - Advertisement Area */}
        <div className="flex-1 flex justify-center px-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-accent/30 p-3 w-full max-w-4xl ml-8">
            <AdPlaceholder title="Premium Chat Experience - Upgrade Now! Get unlimited messages, priority support, and exclusive features!" width="w-full" height="h-16" />
          </div>
        </div>

        {/* Right side - Notifications, History, Mute, User */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenInbox}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-accent/30"
            title="Inbox"
          >
            <BellIcon className="w-5 h-5" />
            {!isGuest && unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadNotifications}
              </span>
            )}
          </button>
          
          <button
            onClick={onOpenHistory}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-accent/30"
            title="Chat History"
          >
            <HistoryIcon className="w-5 h-5" />
            {!isGuest && unreadPrivateMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-highlight text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadPrivateMessages}
              </span>
            )}
          </button>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-colors ${
              isMuted 
                ? 'text-red-400 hover:bg-red-400/20' 
                : 'text-text-secondary hover:text-text-primary hover:bg-accent/30'
            }`}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
          </button>
          
          {/* User Info with Dropdown */}
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-accent/30 rounded-lg p-2 transition-colors"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.nickname}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
                  {currentUser.nickname.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-text-primary font-medium">
                {currentUser.nickname}
                {isGuest && <span className="text-text-secondary text-sm ml-1">(Guest)</span>}
              </span>
            </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-secondary/80 backdrop-blur-sm border border-accent/30 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {!isGuest && (
                    <button
                      onClick={() => {
                        onEditProfile();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-accent/50 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/20 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && !isMuted && (
        <div className="fixed top-20 right-4 z-50 bg-highlight text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-center space-x-2">
            <BellIcon className="w-5 h-5" />
            <span className="font-medium">{notificationMessage}</span>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
