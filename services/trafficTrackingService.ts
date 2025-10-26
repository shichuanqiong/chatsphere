// 访问记录工具
import { recordVisit } from './trafficAnalyticsService';

// 获取用户设备信息
const getUserDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // 检测设备类型
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      device = 'tablet';
    } else {
      device = 'mobile';
    }
  }
  
  // 检测浏览器
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // 检测操作系统
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { device, browser, os };
};

// 获取地理位置信息（模拟）
const getGeographicInfo = () => {
  // 在实际应用中，这里可以使用IP地理位置API
  // 现在使用模拟数据
  const countries = ['United States', 'China', 'Japan', 'Germany', 'United Kingdom', 'France', 'Canada', 'Australia', 'Brazil', 'India'];
  const cities = ['New York', 'Los Angeles', 'London', 'Tokyo', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'São Paulo', 'Mumbai'];
  
  return {
    country: countries[Math.floor(Math.random() * countries.length)],
    city: cities[Math.floor(Math.random() * cities.length)]
  };
};

// 获取流量来源
const getTrafficSource = () => {
  const referrer = document.referrer;
  
  if (!referrer) return 'direct';
  
  if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo')) {
    return 'search';
  }
  
  if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('linkedin') || referrer.includes('instagram')) {
    return 'social';
  }
  
  if (referrer.includes('mail') || referrer.includes('email')) {
    return 'email';
  }
  
  return 'referral';
};

// 记录页面访问
export const trackPageVisit = (page: string = window.location.pathname) => {
  try {
    const deviceInfo = getUserDeviceInfo();
    const geoInfo = getGeographicInfo();
    const source = getTrafficSource();
    
    recordVisit({
      page,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      country: geoInfo.country,
      city: geoInfo.city,
      referrer: document.referrer,
      source: source as any,
      sessionId: getOrCreateSessionId()
    });
  } catch (error) {
    console.error('Failed to track page visit:', error);
  }
};

// 获取或创建会话ID
const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('chatsphere_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chatsphere_session_id', sessionId);
  }
  return sessionId;
};

// 自动跟踪页面访问
export const initTrafficTracking = () => {
  // 跟踪当前页面访问
  trackPageVisit();
  
  // 监听页面变化（用于SPA）
  let currentPath = window.location.pathname;
  
  const checkPathChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageVisit(currentPath);
    }
  };
  
  // 定期检查路径变化
  setInterval(checkPathChange, 1000);
  
  // 监听popstate事件（浏览器前进/后退）
  window.addEventListener('popstate', () => {
    setTimeout(() => trackPageVisit(), 100);
  });
};
