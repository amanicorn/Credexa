"use client";

import { Card, Select, Switch, Divider } from 'antd';
import { Monitor, Palette, Globe, Calendar, Zap, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface DisplaySettingsProps {
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export default function DisplaySettings({ settings, onUpdate }: DisplaySettingsProps) {
  const handleDisplayChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        display: {
          ...settings,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update display setting');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' }
  ];

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card title={
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <span>Appearance</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Theme</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your preferred color theme
              </p>
            </div>
            <Select
              value={settings?.theme || 'system'}
              onChange={(value) => handleDisplayChange('theme', value)}
              style={{ width: 150 }}
              options={themeOptions}
            />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Compact Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use a more condensed layout to fit more content
              </p>
            </div>
            <Switch
              checked={settings?.compactMode === true}
              onChange={(value) => handleDisplayChange('compactMode', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <div>
                <h4 className="font-medium">Animations</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable smooth transitions and animations
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.animationsEnabled !== false}
              onChange={(value) => handleDisplayChange('animationsEnabled', value)}
            />
          </div>
        </div>
      </Card>

      {/* Localization */}
      <Card title={
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span>Language & Region</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Language</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your preferred language
              </p>
            </div>
            <Select
              value={settings?.language || 'en'}
              onChange={(value) => handleDisplayChange('language', value)}
              style={{ width: 150 }}
              options={languageOptions}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Timezone</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your timezone for accurate time displays
              </p>
            </div>
            <Select
              value={settings?.timezone || 'UTC'}
              onChange={(value) => handleDisplayChange('timezone', value)}
              style={{ width: 250 }}
              options={timezoneOptions}
              showSearch
              placeholder="Search timezone..."
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div>
                <h4 className="font-medium">Date Format</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  How dates should be displayed throughout the app
                </p>
              </div>
            </div>
            <Select
              value={settings?.dateFormat || 'MM/DD/YYYY'}
              onChange={(value) => handleDisplayChange('dateFormat', value)}
              style={{ width: 200 }}
              options={dateFormatOptions}
            />
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card title={
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          <span>Preview</span>
        </div>
      }>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current settings preview:
            </p>
            <div className="text-sm">
              <span className="font-medium">Theme:</span> {settings?.theme || 'system'} |{' '}
              <span className="font-medium">Language:</span> {languageOptions.find(l => l.value === (settings?.language || 'en'))?.label} |{' '}
              <span className="font-medium">Date:</span> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: settings?.dateFormat?.includes('MM/DD') ? '2-digit' : 'numeric',
                day: '2-digit'
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}