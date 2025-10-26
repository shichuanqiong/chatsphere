// 流量分析服务
export interface TrafficData {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  city: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  referrer: string;
  source: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other';
  page: string;
  sessionId: string;
  userId?: string;
}

export interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
  cities: { city: string; visitors: number }[];
}

export interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
  browsers: { browser: string; visitors: number }[];
  os: { os: string; visitors: number }[];
}

export interface SourceData {
  source: string;
  visitors: number;
  percentage: number;
  referrers: { referrer: string; visitors: number }[];
}

export interface TrafficStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  hourlyData: { hour: number; visitors: number }[];
  dailyData: { date: string; visitors: number }[];
}

// 模拟流量数据生成
const generateMockTrafficData = (): TrafficData[] => {
  const countries = ['United States', 'China', 'Japan', 'Germany', 'United Kingdom', 'France', 'Canada', 'Australia', 'Brazil', 'India'];
  const cities = ['New York', 'Los Angeles', 'London', 'Tokyo', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'São Paulo', 'Mumbai'];
  const devices = ['desktop', 'mobile', 'tablet'] as const;
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
  const os = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
  const sources = ['direct', 'search', 'social', 'referral', 'email', 'other'] as const;
  const pages = ['/', '/login', '/register', '/chat', '/profile'];
  const socialPlatforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com'];
  const searchEngines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];

  const data: TrafficData[] = [];
  const now = new Date();
  
  // 生成过去30天的数据
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const visitorsPerDay = Math.floor(Math.random() * 200) + 50; // 50-250 visitors per day
    
    for (let j = 0; j < visitorsPerDay; j++) {
      const hour = Math.floor(Math.random() * 24);
      const timestamp = new Date(date.getTime() + hour * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000);
      
      const country = countries[Math.floor(Math.random() * countries.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const osSystem = os[Math.floor(Math.random() * os.length)];
      const page = pages[Math.floor(Math.random() * pages.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      let referrer = '';
      if (source === 'social') {
        referrer = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)];
      } else if (source === 'search') {
        referrer = searchEngines[Math.floor(Math.random() * searchEngines.length)];
      } else if (source === 'referral') {
        referrer = `example${Math.floor(Math.random() * 10)}.com`;
      }
      
      data.push({
        id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: timestamp.toISOString(),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country,
        city,
        device,
        browser,
        os: osSystem,
        referrer,
        source,
        page,
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        userId: Math.random() > 0.7 ? `user-${Math.random().toString(36).substr(2, 9)}` : undefined
      });
    }
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 获取流量数据
export const getTrafficData = (): TrafficData[] => {
  const stored = localStorage.getItem('chatsphere_traffic_data');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const mockData = generateMockTrafficData();
  localStorage.setItem('chatsphere_traffic_data', JSON.stringify(mockData));
  return mockData;
};

// 记录新的访问
export const recordVisit = (visitData: Partial<TrafficData>): void => {
  const trafficData = getTrafficData();
  const newVisit: TrafficData = {
    id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ip: visitData.ip || 'unknown',
    country: visitData.country || 'Unknown',
    city: visitData.city || 'Unknown',
    device: visitData.device || 'desktop',
    browser: visitData.browser || 'Unknown',
    os: visitData.os || 'Unknown',
    referrer: visitData.referrer || '',
    source: visitData.source || 'direct',
    page: visitData.page || '/',
    sessionId: visitData.sessionId || `session-${Math.random().toString(36).substr(2, 9)}`,
    userId: visitData.userId
  };
  
  trafficData.unshift(newVisit);
  // 只保留最近1000条记录
  if (trafficData.length > 1000) {
    trafficData.splice(1000);
  }
  
  localStorage.setItem('chatsphere_traffic_data', JSON.stringify(trafficData));
};

// 获取地域分布数据
export const getGeographicData = (): GeographicData[] => {
  const trafficData = getTrafficData();
  const countryMap = new Map<string, { visitors: number; cities: Map<string, number> }>();
  
  trafficData.forEach(visit => {
    if (!countryMap.has(visit.country)) {
      countryMap.set(visit.country, { visitors: 0, cities: new Map() });
    }
    
    const countryData = countryMap.get(visit.country)!;
    countryData.visitors++;
    
    if (!countryData.cities.has(visit.city)) {
      countryData.cities.set(visit.city, 0);
    }
    countryData.cities.set(visit.city, countryData.cities.get(visit.city)! + 1);
  });
  
  const totalVisitors = trafficData.length;
  
  return Array.from(countryMap.entries())
    .map(([country, data]) => ({
      country,
      visitors: data.visitors,
      percentage: (data.visitors / totalVisitors) * 100,
      cities: Array.from(data.cities.entries())
        .map(([city, visitors]) => ({ city, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5) // Top 5 cities
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10); // Top 10 countries
};

// 获取设备数据
export const getDeviceData = (): DeviceData[] => {
  const trafficData = getTrafficData();
  const deviceMap = new Map<string, { visitors: number; browsers: Map<string, number>; os: Map<string, number> }>();
  
  trafficData.forEach(visit => {
    if (!deviceMap.has(visit.device)) {
      deviceMap.set(visit.device, { visitors: 0, browsers: new Map(), os: new Map() });
    }
    
    const deviceData = deviceMap.get(visit.device)!;
    deviceData.visitors++;
    
    if (!deviceData.browsers.has(visit.browser)) {
      deviceData.browsers.set(visit.browser, 0);
    }
    deviceData.browsers.set(visit.browser, deviceData.browsers.get(visit.browser)! + 1);
    
    if (!deviceData.os.has(visit.os)) {
      deviceData.os.set(visit.os, 0);
    }
    deviceData.os.set(visit.os, deviceData.os.get(visit.os)! + 1);
  });
  
  const totalVisitors = trafficData.length;
  
  return Array.from(deviceMap.entries())
    .map(([device, data]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      visitors: data.visitors,
      percentage: (data.visitors / totalVisitors) * 100,
      browsers: Array.from(data.browsers.entries())
        .map(([browser, visitors]) => ({ browser, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5),
      os: Array.from(data.os.entries())
        .map(([os, visitors]) => ({ os, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5)
    }))
    .sort((a, b) => b.visitors - a.visitors);
};

// 获取流量来源数据
export const getSourceData = (): SourceData[] => {
  const trafficData = getTrafficData();
  const sourceMap = new Map<string, { visitors: number; referrers: Map<string, number> }>();
  
  trafficData.forEach(visit => {
    if (!sourceMap.has(visit.source)) {
      sourceMap.set(visit.source, { visitors: 0, referrers: new Map() });
    }
    
    const sourceData = sourceMap.get(visit.source)!;
    sourceData.visitors++;
    
    if (visit.referrer) {
      if (!sourceData.referrers.has(visit.referrer)) {
        sourceData.referrers.set(visit.referrer, 0);
      }
      sourceData.referrers.set(visit.referrer, sourceData.referrers.get(visit.referrer)! + 1);
    }
  });
  
  const totalVisitors = trafficData.length;
  
  return Array.from(sourceMap.entries())
    .map(([source, data]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      visitors: data.visitors,
      percentage: (data.visitors / totalVisitors) * 100,
      referrers: Array.from(data.referrers.entries())
        .map(([referrer, visitors]) => ({ referrer, visitors }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10)
    }))
    .sort((a, b) => b.visitors - a.visitors);
};

// 获取流量统计
export const getTrafficStats = (): TrafficStats => {
  const trafficData = getTrafficData();
  const uniqueVisitors = new Set(trafficData.map(v => v.sessionId)).size;
  
  // 计算页面访问量
  const pageViews = new Map<string, number>();
  trafficData.forEach(visit => {
    pageViews.set(visit.page, (pageViews.get(visit.page) || 0) + 1);
  });
  
  // 计算跳出率（单页访问）
  const singlePageVisits = trafficData.filter(visit => {
    const sessionVisits = trafficData.filter(v => v.sessionId === visit.sessionId);
    return sessionVisits.length === 1;
  }).length;
  
  const bounceRate = (singlePageVisits / trafficData.length) * 100;
  
  // 计算平均会话时长（模拟）
  const avgSessionDuration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
  
  // 按小时统计
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    visitors: trafficData.filter(visit => new Date(visit.timestamp).getHours() === hour).length
  }));
  
  // 按天统计（最近7天）
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayVisitors = trafficData.filter(visit => {
      const visitDate = new Date(visit.timestamp);
      return visitDate.toDateString() === date.toDateString();
    }).length;
    
    return {
      date: date.toISOString().split('T')[0],
      visitors: dayVisitors
    };
  }).reverse();
  
  return {
    totalVisitors: trafficData.length,
    uniqueVisitors,
    pageViews: trafficData.length,
    bounceRate,
    avgSessionDuration,
    topPages: Array.from(pageViews.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    hourlyData,
    dailyData
  };
};

// 获取实时流量数据（最近1小时）
export const getRealtimeTraffic = (): TrafficData[] => {
  const trafficData = getTrafficData();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  return trafficData.filter(visit => 
    new Date(visit.timestamp) > oneHourAgo
  );
};

// 清除旧数据
export const cleanupOldTrafficData = (): void => {
  const trafficData = getTrafficData();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const filteredData = trafficData.filter(visit => 
    new Date(visit.timestamp) > thirtyDaysAgo
  );
  
  localStorage.setItem('chatsphere_traffic_data', JSON.stringify(filteredData));
};
