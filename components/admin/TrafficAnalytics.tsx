import React, { useState, useEffect } from 'react';
import { 
  getTrafficData, 
  getGeographicData, 
  getDeviceData, 
  getSourceData, 
  getTrafficStats, 
  getRealtimeTraffic,
  TrafficData,
  GeographicData,
  DeviceData,
  SourceData,
  TrafficStats
} from '../../services/trafficAnalyticsService';

const TrafficAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [realtimeTraffic, setRealtimeTraffic] = useState<TrafficData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    loadTrafficData();
    const interval = setInterval(loadTrafficData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadTrafficData = () => {
    setIsLoading(true);
    try {
      setTrafficStats(getTrafficStats());
      setGeographicData(getGeographicData());
      setDeviceData(getDeviceData());
      setSourceData(getSourceData());
      setRealtimeTraffic(getRealtimeTraffic());
    } catch (error) {
      console.error('Failed to load traffic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'geographic', label: 'Geographic', icon: '🌍' },
    { id: 'devices', label: 'Devices', icon: '📱' },
    { id: 'sources', label: 'Traffic Sources', icon: '🔗' },
    { id: 'realtime', label: 'Real-time', icon: '⚡' }
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading traffic analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Clear Mock Data Button */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">检测到模拟数据</p>
              <p className="text-yellow-700 text-sm mt-1">需要清除模拟数据以查看真实流量</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('chatsphere_traffic_data');
                alert('模拟数据已清除！页面将在 3 秒后刷新...');
                setTimeout(() => location.reload(), 3000);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              清除模拟数据
            </button>
          </div>
        </div>
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Traffic Analytics</h1>
              <p className="text-gray-600 mb-2">Monitor visitor behavior, geographic distribution, and traffic sources</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  📊 <strong>Demo Data:</strong> This is simulated data for testing purposes. Real traffic analytics will be available after deployment.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadTrafficData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && trafficStats && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(trafficStats.totalVisitors)}</div>
                        <div className="text-sm text-gray-600">Total Visitors</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{formatNumber(trafficStats.uniqueVisitors)} unique visitors</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(trafficStats.pageViews)}</div>
                        <div className="text-sm text-gray-600">Page Views</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{trafficStats.bounceRate.toFixed(1)}% bounce rate</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⏱️</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{formatDuration(trafficStats.avgSessionDuration)}</div>
                        <div className="text-sm text-gray-600">Avg Session</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Average session duration</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{trafficStats.bounceRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Bounce Rate</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Single page visits</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hourly Traffic */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic by Hour</h3>
                    <div className="space-y-2">
                      {trafficStats.hourlyData.map((data) => (
                        <div key={data.hour} className="flex items-center space-x-3">
                          <div className="w-12 text-sm text-gray-600">{data.hour}:00</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(data.visitors / Math.max(...trafficStats.hourlyData.map(d => d.visitors))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-sm text-gray-900 text-right">{data.visitors}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Pages */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                    <div className="space-y-3">
                      {trafficStats.topPages.slice(0, 5).map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">
                              {index + 1}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{page.page}</div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{formatNumber(page.views)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Geographic Tab */}
            {activeTab === 'geographic' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
                  <div className="space-y-4">
                    {geographicData.map((country, index) => (
                      <div key={country.country} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{country.country}</div>
                              <div className="text-sm text-gray-600">{formatNumber(country.visitors)} visitors</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{country.percentage.toFixed(1)}%</div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${country.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-11">
                          <div className="text-sm text-gray-600 mb-2">Top Cities:</div>
                          <div className="flex flex-wrap gap-2">
                            {country.cities.map((city) => (
                              <span key={city.city} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {city.city} ({city.visitors})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {deviceData.map((device) => (
                    <div key={device.device} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          device.device === 'Desktop' ? 'bg-blue-100' :
                          device.device === 'Mobile' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          <span className="text-2xl">
                            {device.device === 'Desktop' ? '💻' :
                             device.device === 'Mobile' ? '📱' : '📱'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{device.device}</h3>
                          <p className="text-sm text-gray-600">{formatNumber(device.visitors)} visitors</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Percentage</span>
                          <span className="font-medium">{device.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              device.device === 'Desktop' ? 'bg-blue-500' :
                              device.device === 'Mobile' ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Top Browsers</h4>
                          <div className="space-y-1">
                            {device.browsers.map((browser) => (
                              <div key={browser.browser} className="flex justify-between text-xs">
                                <span className="text-gray-600">{browser.browser}</span>
                                <span className="font-medium">{browser.visitors}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Operating Systems</h4>
                          <div className="space-y-1">
                            {device.os.map((os) => (
                              <div key={os.os} className="flex justify-between text-xs">
                                <span className="text-gray-600">{os.os}</span>
                                <span className="font-medium">{os.visitors}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
                  <div className="space-y-4">
                    {sourceData.map((source, index) => (
                      <div key={source.source} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              source.source === 'Direct' ? 'bg-gray-100 text-gray-600' :
                              source.source === 'Search' ? 'bg-blue-100 text-blue-600' :
                              source.source === 'Social' ? 'bg-green-100 text-green-600' :
                              source.source === 'Referral' ? 'bg-purple-100 text-purple-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{source.source}</div>
                              <div className="text-sm text-gray-600">{formatNumber(source.visitors)} visitors</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{source.percentage.toFixed(1)}%</div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  source.source === 'Direct' ? 'bg-gray-500' :
                                  source.source === 'Search' ? 'bg-blue-500' :
                                  source.source === 'Social' ? 'bg-green-500' :
                                  source.source === 'Referral' ? 'bg-purple-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${source.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        {source.referrers.length > 0 && (
                          <div className="ml-11">
                            <div className="text-sm text-gray-600 mb-2">Top Referrers:</div>
                            <div className="flex flex-wrap gap-2">
                              {source.referrers.map((referrer) => (
                                <span key={referrer.referrer} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  {referrer.referrer} ({referrer.visitors})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Tab */}
            {activeTab === 'realtime' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Real-time Traffic (Last Hour)</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Live</span>
                    </div>
                  </div>
                  
                  {realtimeTraffic.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-gray-500">No recent traffic data</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {realtimeTraffic.slice(0, 20).map((visit) => (
                        <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">🌍</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{visit.country}</div>
                              <div className="text-xs text-gray-600">{visit.city}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{visit.device}</span>
                            <span>{visit.browser}</span>
                            <span>{visit.source}</span>
                            <span className="text-xs">{new Date(visit.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalytics;
