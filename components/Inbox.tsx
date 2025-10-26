import React, { useState, useEffect } from 'react';
import type { User, Notification, PrivateChat } from '../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from '../services/notificationService';
import { getPrivateChats, markPrivateChatAsRead } from '../services/chatHistoryService';
import { getAllUsers, blockUser, unblockUser, isUserBlocked } from '../services/authService';
import { BellIcon, MessageIcon, CheckIcon, XIcon, BlockIcon, UnblockIcon } from './icons';

interface InboxProps {
  currentUser: User;
  onSelectPrivateChat: (chat: PrivateChat, otherUser: User) => void;
  onClose: () => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  isGuest: boolean;
}

const Inbox: React.FC<InboxProps> = ({ currentUser, onSelectPrivateChat, onClose, onBlockUser, onUnblockUser, isGuest }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser.id) return;
    
    const loadData = () => {
      const userNotifications = getNotifications(currentUser.id!);
      const userPrivateChats = getPrivateChats(currentUser.id!);
      const users = getAllUsers();
      const unread = getUnreadNotificationCount(currentUser.id!);
      
      setNotifications(userNotifications);
      setPrivateChats(userPrivateChats);
      setAllUsers(users);
      setUnreadCount(unread);
    };

    loadData();
    
    // 定期刷新数据
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = () => {
    if (!currentUser.id) return;
    markAllNotificationsAsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handlePrivateChatClick = (chat: PrivateChat) => {
    const otherUserId = chat.participants.find(id => id !== currentUser.id);
    const otherUser = allUsers.find(u => u.id === otherUserId);
    if (otherUser) {
      markPrivateChatAsRead(chat.id, currentUser.id!);
      onSelectPrivateChat(chat, otherUser);
      onClose(); // 关闭Inbox窗口
    }
  };

  const getOtherUser = (chat: PrivateChat): User | undefined => {
    const otherUserId = chat.participants.find(id => id !== currentUser.id);
    return allUsers.find(u => u.id === otherUserId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'message':
        return '💬';
      case 'room_invite':
        return '🏠';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  return (
    <div className="w-full h-full bg-secondary flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-accent flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Inbox</h2>
        <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-accent">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 p-4 text-center font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'text-highlight border-b-2 border-highlight'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 p-4 text-center font-medium transition-colors ${
            activeTab === 'messages'
              ? 'text-highlight border-b-2 border-highlight'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageIcon className="w-5 h-5" />
            Messages
            {privateChats.some(chat => chat.unreadCount > 0) && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {privateChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notifications' && (
          <div>
            {notifications.length > 0 && (
              <div className="p-4 border-b border-accent">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-highlight hover:text-teal-400 flex items-center gap-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-accent">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-accent/30 ${
                      !notification.isRead ? 'bg-accent/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-text-secondary">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-highlight rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            {privateChats.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <MessageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No private messages yet</p>
                <p className="text-sm mt-2">Start a conversation with a friend!</p>
              </div>
            ) : (
              <div className="divide-y divide-accent">
                {privateChats.map(chat => {
                  const otherUser = getOtherUser(chat);
                  if (!otherUser) return null;
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handlePrivateChatClick(chat)}
                      className="p-4 cursor-pointer transition-colors hover:bg-accent/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {otherUser.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.nickname}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
                              {otherUser.nickname.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-text-primary truncate">
                              {otherUser.nickname}
                            </h3>
                            <div className="flex items-center gap-2">
                              {otherUser.id && !otherUser.id.startsWith('guest-') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const isBlocked = currentUser.id ? isUserBlocked(currentUser.id, otherUser.id!) : false;
                                    if (isBlocked) {
                                      onUnblockUser(otherUser.id!);
                                    } else {
                                      onBlockUser(otherUser.id!);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title={currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? `Unblock ${otherUser.nickname}` : `Block ${otherUser.nickname}`}
                                >
                                  {currentUser.id && isUserBlocked(currentUser.id, otherUser.id!) ? (
                                    <UnblockIcon className="w-4 h-4" />
                                  ) : (
                                    <BlockIcon className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              {chat.lastMessage && (
                                <span className="text-xs text-text-secondary">
                                  {formatTime(chat.lastMessage.timestamp)}
                                </span>
                              )}
                              {chat.unreadCount > 0 && (
                                <span className="bg-highlight text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          {chat.lastMessage && (
                            <p className="text-sm text-text-secondary truncate mt-1">
                              {chat.lastMessage.text || '📷 Image'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
