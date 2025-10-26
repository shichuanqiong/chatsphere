import React, { useState, useEffect } from 'react';
import { getAllRoomsForAdmin } from '../../services/adminDataService';
import { ChatRoom, Message } from '../../types';
import { logInfo, logWarning } from '../../services/logService';
import { getAllViolations, getViolationStats } from '../../services/contentModerationService';

const ContentModeration: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [flaggedMessages, setFlaggedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const allRooms = getAllRoomsForAdmin();
      setRooms(allRooms);
      
      // 使用新的违规检测系统
      const violations = getAllViolations();
      const violationStats = getViolationStats();
      
      // 将违规转换为标记消息格式（用于兼容现有UI）
      const flagged: Message[] = violations.map(violation => ({
        id: violation.messageId,
        text: violation.detectedText,
        sender: {
          id: violation.userId,
          nickname: `User ${violation.userId}`,
          name: `User ${violation.userId}`,
          avatar: '', // 使用空字符串，让UI显示默认头像
          email: '',
          age: 0,
          gender: 'other' as any,
          country: '',
          friends: []
        },
        timestamp: violation.timestamp,
        imageUrl: undefined
      }));
      
      setFlaggedMessages(flagged);
      
      // 记录统计信息
      logInfo(`Content moderation loaded: ${violations.length} violations found`, 'system', {
        totalViolations: violations.length,
        todayViolations: violationStats.today,
        typeStats: violationStats.typeStats,
        severityStats: violationStats.severityStats
      });
      
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = (messageId: string, roomId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const rooms = JSON.parse(localStorage.getItem('chatsphere_rooms') || '[]');
      const roomIndex = rooms.findIndex((r: ChatRoom) => r.id === roomId);
      
      if (roomIndex !== -1) {
        rooms[roomIndex].messages = rooms[roomIndex].messages.filter((m: Message) => m.id !== messageId);
        localStorage.setItem('chatsphere_rooms', JSON.stringify(rooms));
        
        setFlaggedMessages(prev => prev.filter(m => m.id !== messageId));
        logWarning('Message deleted by admin', 'content_moderation', { messageId, roomId });
        alert('Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleWarnUser = (userId: string, messageId: string) => {
    if (!confirm('Send warning to this user?')) return;
    
    logWarning('User warned by admin', 'content_moderation', { userId, messageId });
    alert('Warning sent to user');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading content moderation data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
        <button
          onClick={loadData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Flagged Messages</h3>
          <div className="text-3xl font-bold text-red-600">{flaggedMessages.length}</div>
          <p className="text-sm text-gray-600">Require review</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Rooms</h3>
          <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
          <p className="text-sm text-gray-600">Active rooms</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Messages</h3>
          <div className="text-3xl font-bold text-green-600">
            {rooms.reduce((total, room) => total + room.messages.length, 0)}
          </div>
          <p className="text-sm text-gray-600">All messages</p>
        </div>
      </div>

      {/* Flagged Messages */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Flagged Messages</h3>
        </div>
        
        {flaggedMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No flagged messages found. Great job! 🎉
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {flaggedMessages.map((message) => (
              <div key={message.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {message.sender.avatar && message.sender.avatar.startsWith('http') ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={message.sender.avatar}
                          alt={message.sender.nickname}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                          {message.sender.nickname?.charAt(0)?.toUpperCase() || '👤'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{message.sender.nickname}</p>
                        <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-900">{message.text}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Room: {rooms.find(r => r.messages.some(m => m.id === message.id))?.name || 'Unknown'}</span>
                      <span>Type: {message.sender.id?.startsWith('guest-') ? 'Guest' : 'Registered'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleWarnUser(message.sender.id!, message.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Warn User
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message.id, rooms.find(r => r.messages.some(m => m.id === message.id))?.id || '')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Delete Message
                    </button>
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

export default ContentModeration;
