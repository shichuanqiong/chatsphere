// 系统日志类型
export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  category: 'user' | 'room' | 'message' | 'system' | 'security' | 'performance';
  timestamp: string;
  userId?: string;
  roomId?: string;
  details?: any;
}

// 日志级别
export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
} as const;

// 日志分类
export const LOG_CATEGORIES = {
  USER: 'user',
  ROOM: 'room',
  MESSAGE: 'message',
  SYSTEM: 'system',
  SECURITY: 'security',
  PERFORMANCE: 'performance'
} as const;

// 日志存储键
const LOGS_KEY = 'chatsphere_system_logs';
const MAX_LOGS = 10000; // 最大日志条数

// 添加日志
export const addLog = (log: Omit<SystemLog, 'id' | 'timestamp'>): void => {
  const logs = getLogs();
  const newLog: SystemLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(newLog);
  
  // 限制日志数量
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

// 获取日志
export const getLogs = (): SystemLog[] => {
  const logs = localStorage.getItem(LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

// 获取过滤后的日志
export const getFilteredLogs = (filters: {
  level?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}): SystemLog[] => {
  let logs = getLogs();
  
  // 按级别过滤
  if (filters.level) {
    logs = logs.filter(log => log.level === filters.level);
  }
  
  // 按分类过滤
  if (filters.category) {
    logs = logs.filter(log => log.category === filters.category);
  }
  
  // 按日期范围过滤
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    logs = logs.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    logs = logs.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  // 按搜索关键词过滤
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(searchLower) ||
      log.details?.toString().toLowerCase().includes(searchLower)
    );
  }
  
  // 限制数量
  if (filters.limit) {
    logs = logs.slice(0, filters.limit);
  }
  
  return logs;
};

// 清理旧日志
export const cleanupOldLogs = (daysToKeep: number = 30): void => {
  const logs = getLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const filteredLogs = logs.filter(log => 
    new Date(log.timestamp) >= cutoffDate
  );
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
};

// 获取日志统计
export const getLogStats = () => {
  const logs = getLogs();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const todayLogs = logs.filter(log => new Date(log.timestamp) >= today);
  const weekLogs = logs.filter(log => new Date(log.timestamp) >= weekAgo);
  
  const levelStats = {
    info: logs.filter(log => log.level === 'info').length,
    warning: logs.filter(log => log.level === 'warning').length,
    error: logs.filter(log => log.level === 'error').length,
    debug: logs.filter(log => log.level === 'debug').length
  };
  
  const categoryStats = {
    user: logs.filter(log => log.category === 'user').length,
    room: logs.filter(log => log.category === 'room').length,
    message: logs.filter(log => log.category === 'message').length,
    system: logs.filter(log => log.category === 'system').length,
    security: logs.filter(log => log.category === 'security').length,
    performance: logs.filter(log => log.category === 'performance').length
  };
  
  return {
    total: logs.length,
    today: todayLogs.length,
    thisWeek: weekLogs.length,
    levelStats,
    categoryStats
  };
};

// 初始化示例日志（用于演示）
export const initSampleLogs = (): void => {
  const existingLogs = getLogs();
  if (existingLogs.length > 0) {
    return; // 如果已有日志，不重复初始化
  }
  
  const now = new Date();
  const sampleLogs: SystemLog[] = [
    {
      id: `log-${Date.now()}-1`,
      level: 'info',
      message: 'System initialized successfully',
      category: 'system',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
      details: { version: '1.0.0', build: '2025-01-27' }
    },
    {
      id: `log-${Date.now()}-2`,
      level: 'info',
      message: 'User registration completed',
      category: 'user',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(), // 1.5小时前
      userId: 'user-123',
      details: { method: 'email', country: 'US' }
    },
    {
      id: `log-${Date.now()}-3`,
      level: 'warning',
      message: 'Room creation limit reached',
      category: 'room',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1小时前
      userId: 'user-456',
      details: { limit: 2, current: 2 }
    },
    {
      id: `log-${Date.now()}-4`,
      level: 'error',
      message: 'Failed to send message',
      category: 'message',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30分钟前
      userId: 'user-789',
      roomId: 'room-abc',
      details: { error: 'Network timeout', retryCount: 3 }
    },
    {
      id: `log-${Date.now()}-5`,
      level: 'info',
      message: 'User kicked from room',
      category: 'security',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15分钟前
      userId: 'user-999',
      roomId: 'room-xyz',
      details: { kickedBy: 'user-123', reason: 'Inappropriate behavior' }
    },
    {
      id: `log-${Date.now()}-6`,
      level: 'debug',
      message: 'Performance metrics collected',
      category: 'performance',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5分钟前
      details: { loadTime: 1200, memoryUsage: '45MB', activeUsers: 25 }
    },
    {
      id: `log-${Date.now()}-7`,
      level: 'info',
      message: 'New room created',
      category: 'room',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2分钟前
      userId: 'user-111',
      roomId: 'room-new',
      details: { roomType: 'public', participants: 1 }
    },
    {
      id: `log-${Date.now()}-8`,
      level: 'warning',
      message: 'High memory usage detected',
      category: 'performance',
      timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(), // 1分钟前
      details: { memoryUsage: '85MB', threshold: '80MB' }
    }
  ];
  
  // 保存示例日志
  localStorage.setItem(LOGS_KEY, JSON.stringify(sampleLogs));
};

// 添加实时日志（模拟实时日志生成）
export const addRealtimeLog = (): void => {
  const logTypes = [
    { level: 'info', category: 'user', message: 'User activity detected' },
    { level: 'info', category: 'message', message: 'Message sent successfully' },
    { level: 'debug', category: 'system', message: 'Background task completed' },
    { level: 'info', category: 'room', message: 'User joined room' },
    { level: 'warning', category: 'performance', message: 'Response time increased' }
  ];
  
  const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
  
  addLog({
    level: randomLog.level as any,
    category: randomLog.category as any,
    message: randomLog.message,
    details: { 
      timestamp: Date.now(),
      random: Math.random().toString(36).substr(2, 9)
    }
  });
};

// 导出日志
export const exportLogs = (format: 'json' | 'csv' = 'json'): string => {
  const logs = getLogs();
  
  if (format === 'csv') {
    const headers = ['ID', 'Level', 'Category', 'Message', 'Timestamp', 'User ID', 'Room ID', 'Details'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.id,
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        log.timestamp,
        log.userId || '',
        log.roomId || '',
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
  
  return JSON.stringify(logs, null, 2);
};

// 便捷的日志记录函数
export const logInfo = (message: string, category: string, details?: any, userId?: string, roomId?: string): void => {
  addLog({ level: 'info', message, category, details, userId, roomId });
};

export const logWarning = (message: string, category: string, details?: any, userId?: string, roomId?: string): void => {
  addLog({ level: 'warning', message, category, details, userId, roomId });
};

export const logError = (message: string, category: string, details?: any, userId?: string, roomId?: string): void => {
  addLog({ level: 'error', message, category, details, userId, roomId });
};

export const logDebug = (message: string, category: string, details?: any, userId?: string, roomId?: string): void => {
  addLog({ level: 'debug', message, category, details, userId, roomId });
};
