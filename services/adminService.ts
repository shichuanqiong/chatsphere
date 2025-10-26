// 管理员认证服务
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

// 管理员权限
export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  CONTENT_MODERATION: 'content_moderation',
  ROOM_MONITORING: 'room_monitoring',
  DATA_ANALYTICS: 'data_analytics',
  SYSTEM_LOGS: 'system_logs',
  SEO_TOOLS: 'seo_tools',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

// 默认管理员账户 (生产环境中应该从环境变量或数据库获取)
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@chatsphere.live',
  role: 'super_admin',
  permissions: Object.values(ADMIN_PERMISSIONS),
  createdAt: new Date().toISOString()
};

// 管理员密码 (生产环境中应该加密存储)
const ADMIN_PASSWORD = 'ChatSphere2025!';

// 获取当前管理员
export const getCurrentAdmin = (): AdminUser | null => {
  const adminData = localStorage.getItem('chatsphere_admin');
  return adminData ? JSON.parse(adminData) : null;
};

// 管理员登录
export const adminLogin = (credentials: AdminLoginCredentials): { success: boolean; admin?: AdminUser; message?: string } => {
  if (credentials.username === DEFAULT_ADMIN.username && credentials.password === ADMIN_PASSWORD) {
    const admin = { ...DEFAULT_ADMIN, lastLogin: new Date().toISOString() };
    localStorage.setItem('chatsphere_admin', JSON.stringify(admin));
    return { success: true, admin };
  }
  
  return { success: false, message: 'Invalid credentials' };
};

// 管理员登出
export const adminLogout = (): void => {
  localStorage.removeItem('chatsphere_admin');
};

// 检查管理员权限
export const hasPermission = (permission: string): boolean => {
  const admin = getCurrentAdmin();
  if (!admin) return false;
  
  return admin.permissions.includes(permission) || admin.role === 'super_admin';
};

// 检查是否为管理员
export const isAdmin = (): boolean => {
  return getCurrentAdmin() !== null;
};
