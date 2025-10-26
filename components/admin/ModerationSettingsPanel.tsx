import React, { useState, useEffect } from 'react';
import { getModerationSettings, updateModerationSettings, ModerationSettings } from '../../services/contentModerationService';

const ModerationSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ModerationSettings>(getModerationSettings());
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: keyof ModerationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateModerationSettings(newSettings);
  };

  const handleSave = () => {
    setIsLoading(true);
    updateModerationSettings(settings);
    setTimeout(() => {
      setIsLoading(false);
      alert('Moderation settings saved successfully!');
    }, 500);
  };

  const handleReset = () => {
    const defaultSettings: ModerationSettings = {
      enabled: false,
      strictMode: false,
      spamDetection: true,
      hateSpeechDetection: false,
      harassmentDetection: false,
      inappropriateDetection: false,
      advertisingDetection: false,
      scamDetection: true
    };
    setSettings(defaultSettings);
    updateModerationSettings(defaultSettings);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Content Moderation Settings</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Content Moderation</h3>
              <p className="text-sm text-gray-600">Enable or disable the entire content moderation system</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Detection Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Detection Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spam Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Spam Detection</h4>
                  <p className="text-sm text-gray-600">Detect spam messages and advertisements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.spamDetection}
                    onChange={(e) => handleSettingChange('spamDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Scam Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Scam Detection</h4>
                  <p className="text-sm text-gray-600">Detect scam and fraudulent content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.scamDetection}
                    onChange={(e) => handleSettingChange('scamDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Hate Speech Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Hate Speech Detection</h4>
                  <p className="text-sm text-gray-600">Detect hate speech and discriminatory content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hateSpeechDetection}
                    onChange={(e) => handleSettingChange('hateSpeechDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Harassment Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Harassment Detection</h4>
                  <p className="text-sm text-gray-600">Detect harassment and bullying</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.harassmentDetection}
                    onChange={(e) => handleSettingChange('harassmentDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Inappropriate Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Inappropriate Content Detection</h4>
                  <p className="text-sm text-gray-600">Detect inappropriate and adult content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inappropriateDetection}
                    onChange={(e) => handleSettingChange('inappropriateDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Advertising Detection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Advertising Detection</h4>
                  <p className="text-sm text-gray-600">Detect advertising and promotional content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.advertisingDetection}
                    onChange={(e) => handleSettingChange('advertisingDetection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Additional Settings</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Strict Mode</h4>
                <p className="text-sm text-gray-600">Enable stricter detection rules and lower thresholds</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.strictMode}
                  onChange={(e) => handleSettingChange('strictMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                Content Moderation Status: {settings.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-gray-600">
                {settings.enabled 
                  ? 'The system is actively monitoring and moderating content in public rooms.'
                  : 'Content moderation is currently disabled. Users can chat freely without automated monitoring.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationSettingsPanel;
