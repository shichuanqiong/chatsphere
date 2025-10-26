import React, { useState, useEffect } from 'react';
import type { User, ChatHistory } from '../types';
import { getChatHistory, archiveChat, unarchiveChat, deleteChatHistory } from '../services/chatHistoryService';
import { getAllUsers } from '../services/authService';
import { HistoryIcon, ArchiveIcon, TrashIcon, XIcon } from './icons';

interface ChatHistoryProps {
  currentUser: User;
  onSelectChat: (chat: ChatHistory) => void;
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ currentUser, onSelectChat, onClose }) => {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'room' | 'private'>('all');

  useEffect(() => {
    if (!currentUser.id) return;
    
    const loadHistory = () => {
      const userHistory = getChatHistory(currentUser.id!);
      const users = getAllUsers();
      setHistory(userHistory);
      setAllUsers(users);
    };

    loadHistory();
    
    // 定期刷新数据
    const interval = setInterval(loadHistory, 10000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const filteredHistory = history.filter(chat => {
    if (filter === 'archived' && !chat.isArchived) return false;
    if (filter === 'all' && chat.isArchived) return false;
    if (typeFilter !== 'all' && chat.type !== typeFilter) return false;
    return true;
  });

  const handleArchive = (chatId: string) => {
    if (!currentUser.id) return;
    const success = archiveChat(chatId, currentUser.id);
    if (success) {
      setHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, isArchived: true } : chat
      ));
    }
  };

  const handleUnarchive = (chatId: string) => {
    if (!currentUser.id) return;
    const success = unarchiveChat(chatId, currentUser.id);
    if (success) {
      setHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, isArchived: false } : chat
      ));
    }
  };

  const handleDelete = (chatId: string) => {
    if (!currentUser.id) return;
    const success = deleteChatHistory(chatId, currentUser.id);
    if (success) {
      setHistory(prev => prev.filter(chat => chat.id !== chatId));
    }
  };

  const getUserById = (userId: string) => {
    return allUsers.find(user => user.id === userId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'room':
        return '🏠';
      case 'private':
        return '💬';
      default:
        return '💭';
    }
  };

  const getChatDisplayName = (chat: ChatHistory) => {
    if (chat.type === 'private') {
      const otherUserId = chat.participants.find(id => id !== currentUser.id);
      const otherUser = getUserById(otherUserId || '');
      return otherUser ? otherUser.nickname : 'Unknown User';
    }
    return chat.name;
  };

  const getChatAvatar = (chat: ChatHistory) => {
    if (chat.type === 'private') {
      const otherUserId = chat.participants.find(id => id !== currentUser.id);
      const otherUser = getUserById(otherUserId || '');
      if (otherUser?.avatar) {
        return otherUser.avatar;
      }
      return null;
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-secondary flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-accent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-highlight" />
          <h2 className="text-xl font-bold text-text-primary">Chat History</h2>
        </div>
        <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-accent space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'all' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'
            }`}
          >
            All Chats
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'archived' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'
            }`}
          >
            Archived
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'all' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('room')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'room' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setTypeFilter('private')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'private' ? 'bg-highlight text-white' : 'bg-accent text-text-primary hover:bg-accent/70'
            }`}
          >
            Private
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chat history found</p>
            <p className="text-sm mt-2">
              {filter === 'archived' ? 'No archived chats' : 'Start chatting to see your history here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-accent">
            {filteredHistory.map(chat => (
              <div
                key={chat.id}
                className="p-4 hover:bg-accent/30 transition-colors cursor-pointer group"
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {getChatAvatar(chat) ? (
                      <img
                        src={getChatAvatar(chat)!}
                        alt={getChatDisplayName(chat)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">
                        {getChatIcon(chat.type)}
                      </div>
                    )}
                    {chat.type === 'private' && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-secondary"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary truncate">
                        {getChatDisplayName(chat)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">
                          {formatTime(chat.lastActivity)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {chat.isArchived ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnarchive(chat.id);
                              }}
                              className="p-1 text-text-secondary hover:text-highlight"
                              title="Unarchive"
                            >
                              <ArchiveIcon className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(chat.id);
                              }}
                              className="p-1 text-text-secondary hover:text-highlight"
                              title="Archive"
                            >
                              <ArchiveIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chat.id);
                            }}
                            className="p-1 text-text-secondary hover:text-red-400"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-text-secondary">
                        {chat.messageCount} message{chat.messageCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs text-text-secondary capitalize">
                        {chat.type}
                      </span>
                      {chat.isArchived && (
                        <>
                          <span className="text-xs text-text-secondary">•</span>
                          <span className="text-xs text-orange-400">Archived</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
