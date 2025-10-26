import React, { useState, useEffect } from 'react';
import { AdminUser, adminLogout, hasPermission } from '../../services/adminService';
import { getUserStats, getRoomStats, getMessageStats, getSystemStats } from '../../services/adminDataService';
import { getLogStats } from '../../services/logService';
import UserManagement from './UserManagement';
import ContentModeration from './ContentModeration';
import ModerationSettingsPanel from './ModerationSettingsPanel';
import RoomMonitoring from './RoomMonitoring';
import DataAnalytics from './DataAnalytics';
import SystemLogs from './SystemLogs';
import TrafficAnalytics from './TrafficAnalytics';
import SEOTools from './SEOTools';

interface AdminPanelProps {
  admin: AdminUser;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats, setUserStats] = useState<any>(null);
  const [roomStats, setRoomStats] = useState<any>(null);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [logStats, setLogStats] = useState<any>(null);

  const loadStats = () => {
    setUserStats(getUserStats());
    setRoomStats(getRoomStats());
    setMessageStats(getMessageStats());
    setSystemStats(getSystemStats());
    setLogStats(getLogStats());
  };

  useEffect(() => {
    // 修复旧数据格式（自动执行一次）
    const fixGuestFormat = () => {
      const KEY = 'chatsphere_users';
      try {
        let users = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!Array.isArray(users)) users = [];

        const fixed = users.map((u: any) => {
          const isGuestById = typeof u?.id === 'string' && u.id.startsWith('guest-');
          return {
            ...u,
            isGuest: u?.isGuest === true ? true : isGuestById,
            userType: (u?.isGuest === true || isGuestById) ? 'guest' : 'registered'
          };
        });

        localStorage.setItem(KEY, JSON.stringify(fixed));
      } catch (error) {
        console.error('Failed to fix format:', error);
      }
    };
    
    // 只在首次加载时执行一次
    if (!sessionStorage.getItem('guest_format_fixed')) {
      fixGuestFormat();
      sessionStorage.setItem('guest_format_fixed', 'true');
    }
    
    // 立即加载一次
    loadStats();
    // 每5秒刷新一次（更快地看到更新）
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome back, {admin.username}!</h1>
                  <p className="text-purple-100">Manage your ChatSphere community with powerful admin tools</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={loadStats}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">👑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Users" 
                value={userStats?.totalUsers || 0}
                subtitle={`${userStats?.registeredUsers || 0} registered, ${userStats?.guestUsers || 0} guests`}
                icon="👥"
                color="blue"
              />
              <StatCard 
                title="Active Rooms" 
                value={roomStats?.activeRooms || 0}
                subtitle={`${roomStats?.totalRooms || 0} total rooms`}
                icon="🏠"
                color="green"
              />
              <StatCard 
                title="Total Messages" 
                value={messageStats?.totalMessages || 0}
                subtitle={`${messageStats?.averageMessagesPerUser || 0} avg per user`}
                icon="💬"
                color="purple"
              />
              <StatCard 
                title="Storage Usage" 
                value={systemStats?.storageUsage?.percentage || 0}
                subtitle={`${systemStats?.storageUsage?.total || 0} bytes used`}
                icon="💾"
                color="orange"
                suffix="%"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-semibold text-green-600">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Load Time</span>
                    <span className="text-sm font-semibold text-blue-600">1.2s</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm font-medium transition-colors"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 text-sm font-medium transition-colors"
                  >
                    Content Review
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-medium transition-colors"
                  >
                    Room Monitor
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm font-medium transition-colors"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return hasPermission('user_management') ? <UserManagement /> : <NoPermission />;
      case 'moderation':
        return hasPermission('content_moderation') ? <ContentModeration /> : <NoPermission />;
      case 'moderation-settings':
        return hasPermission('admin') ? <ModerationSettingsPanel /> : <NoPermission />;
      case 'rooms':
        return hasPermission('room_monitoring') ? <RoomMonitoring /> : <NoPermission />;
      case 'analytics':
        return hasPermission('data_analytics') ? <DataAnalytics /> : <NoPermission />;
      case 'traffic':
        return hasPermission('data_analytics') ? <TrafficAnalytics /> : <NoPermission />;
      case 'logs':
        return hasPermission('system_logs') ? <SystemLogs /> : <NoPermission />;
      case 'seo':
        return <SEOTools />;
      default:
        return <NoPermission />;
    }
  };

  const StatCard: React.FC<{ title: string; value: number; subtitle: string; icon: string; color: string; suffix?: string }> = ({ title, value, subtitle, icon, color, suffix = '' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{value}{suffix}</div>
            <div className="text-sm text-gray-600">{title}</div>
          </div>
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    );
  };

  const NoPermission: React.FC = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You do not have permission to view this section.</p>
      </div>
    </div>
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: null },
    { id: 'users', label: 'User Management', icon: '👥', permission: 'admin' },
    { id: 'moderation', label: 'Content Moderation', icon: '🛡️', permission: 'moderator' },
    { id: 'moderation-settings', label: 'Moderation Settings', icon: '⚙️', permission: 'admin' },
    { id: 'rooms', label: 'Room Monitoring', icon: '🏠', permission: 'moderator' },
    { id: 'analytics', label: 'Data Analytics', icon: '📈', permission: 'admin' },
    { id: 'traffic', label: 'Traffic Analytics', icon: '🌍', permission: 'admin' },
    { id: 'logs', label: 'System Logs', icon: '📋', permission: 'admin' },
    { id: 'seo', label: 'SEO Tools', icon: '🚀', permission: 'seo_tools' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">ChatSphere</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">{admin.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{admin.username}</p>
              <p className="text-xs text-gray-500 capitalize">{admin.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const hasAccess = !item.permission || hasPermission(item.permission as any);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                disabled={!hasAccess}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : hasAccess
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;