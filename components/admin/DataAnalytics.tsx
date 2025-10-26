import React, { useState, useEffect } from 'react';
import { getUserStats, getRoomStats, getMessageStats, getSystemStats } from '../../services/adminDataService';
import { getAllUsers } from '../../services/authService';
import { getAllRoomsForAdmin } from '../../services/adminDataService';
import { User, ChatRoom } from '../../types';

const DataAnalytics: React.FC = () => {
  const [userStats, setUserStats] = useState<any>(null);
  const [roomStats, setRoomStats] = useState<any>(null);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setIsLoading(true);
    try {
      setUserStats(getUserStats());
      setRoomStats(getRoomStats());
      setMessageStats(getMessageStats());
      setSystemStats(getSystemStats());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'all': return 'All time';
      default: return 'Last 30 days';
    }
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getEngagementMetrics = () => {
    const users = getAllUsers();
    const rooms = getAllRoomsForAdmin();
    
    const registeredUsers = users.filter(u => !u.id?.startsWith('guest-'));
    const guestUsers = users.filter(u => u.id?.startsWith('guest-'));
    
    const totalMessages = rooms.reduce((sum, room) => sum + room.messages.length, 0);
    const avgMessagesPerUser = users.length > 0 ? (totalMessages / users.length).toFixed(1) : '0';
    const avgMessagesPerRoom = rooms.length > 0 ? (totalMessages / rooms.length).toFixed(1) : '0';
    
    return {
      totalUsers: users.length,
      registeredUsers: registeredUsers.length,
      guestUsers: guestUsers.length,
      totalMessages,
      avgMessagesPerUser,
      avgMessagesPerRoom,
      totalRooms: rooms.length,
      activeRooms: rooms.filter(room => !isRoomExpired(room)).length
    };
  };

  const isRoomExpired = (room: ChatRoom): boolean => {
    if (!room.createdAt || room.isOfficial) return false;
    const createdAt = new Date(room.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 6;
  };

  const getTopActiveRooms = () => {
    const rooms = getAllRoomsForAdmin();
    return rooms
      .filter(room => !isRoomExpired(room))
      .sort((a, b) => b.messages.length - a.messages.length)
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    const rooms = getAllRoomsForAdmin();
    const allMessages = rooms.flatMap(room => 
      room.messages.map(msg => ({ ...msg, roomName: room.name }))
    );
    
    return allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const engagementMetrics = getEngagementMetrics();
  const topRooms = getTopActiveRooms();
  const recentActivity = getRecentActivity();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <div className="text-3xl font-bold text-blue-600">{engagementMetrics.totalUsers}</div>
          <div className="text-sm text-gray-600 mt-1">
            {engagementMetrics.registeredUsers} registered, {engagementMetrics.guestUsers} guests
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Messages</h3>
          <div className="text-3xl font-bold text-green-600">{engagementMetrics.totalMessages}</div>
          <div className="text-sm text-gray-600 mt-1">
            {engagementMetrics.avgMessagesPerUser} per user
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Rooms</h3>
          <div className="text-3xl font-bold text-purple-600">{engagementMetrics.activeRooms}</div>
          <div className="text-sm text-gray-600 mt-1">
            {engagementMetrics.totalRooms} total rooms
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage Usage</h3>
          <div className="text-3xl font-bold text-orange-600">{systemStats?.localStorageUsage || 'N/A'}</div>
          <div className="text-sm text-gray-600 mt-1">
            {systemStats?.localStoragePercentage || 'N/A'} of limit
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Active Rooms */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Active Rooms</h3>
          <div className="space-y-3">
            {topRooms.map((room, index) => (
              <div key={room.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    <div className="text-xs text-gray-500">{room.participants.length} participants</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{room.messages.length}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Registered Users</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(engagementMetrics.registeredUsers / engagementMetrics.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{engagementMetrics.registeredUsers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Guest Users</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(engagementMetrics.guestUsers / engagementMetrics.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{engagementMetrics.guestUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((message) => (
            <div key={message.id} className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={message.sender.avatar || `https://i.pravatar.cc/150?u=${message.sender.nickname}`}
                  alt={message.sender.nickname}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{message.sender.nickname}</span>
                    <span className="text-xs text-gray-500">in</span>
                    <span className="text-sm text-purple-600">{message.roomName}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.text}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataAnalytics;
