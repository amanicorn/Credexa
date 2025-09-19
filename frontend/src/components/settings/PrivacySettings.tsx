"use client";

import { Card, Switch, Select, Divider } from 'antd';
import { Eye, EyeOff, Globe, Users, Lock, BarChart3, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface PrivacySettingsProps {
  settings: any;
  dataAnalytics: any;
  onUpdate: (updates: any) => Promise<void>;
}

export default function PrivacySettings({ settings, dataAnalytics, onUpdate }: PrivacySettingsProps) {
  const handlePrivacyChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        privacy: {
          ...settings,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update privacy setting');
    }
  };

  const handleAnalyticsChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        dataAnalytics: {
          ...dataAnalytics,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update analytics setting');
    }
  };

  const profileVisibilityOptions = [
    { 
      value: 'public', 
      label: 'Public',
      icon: <Globe className="w-4 h-4" />,
      description: 'Anyone can view your profile'
    },
    { 
      value: 'friends', 
      label: 'Friends Only',
      icon: <Users className="w-4 h-4" />,
      description: 'Only your connections can view'
    },
    { 
      value: 'private', 
      label: 'Private',
      icon: <Lock className="w-4 h-4" />,
      description: 'Only you can view your profile'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card title={
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          <span>Profile Visibility</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Profile Visibility</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control who can see your profile information
              </p>
            </div>
            <Select
              value={settings?.profileVisibility || 'public'}
              onChange={(value) => handlePrivacyChange('profileVisibility', value)}
              style={{ width: 150 }}
              options={profileVisibilityOptions.map(option => ({
                ...option,
                label: (
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                )
              }))}
            />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Show Credentials Publicly</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your earned credentials on your public profile
              </p>
            </div>
            <Switch
              checked={settings?.showCredentialsPublicly !== false}
              onChange={(value) => handlePrivacyChange('showCredentialsPublicly', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Show on Leaderboards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Include your profile in public ranking lists
              </p>
            </div>
            <Switch
              checked={settings?.showOnLeaderboards !== false}
              onChange={(value) => handlePrivacyChange('showOnLeaderboards', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Show Learning Progress</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your learning journey and milestones
              </p>
            </div>
            <Switch
              checked={settings?.showLearningProgress !== false}
              onChange={(value) => handlePrivacyChange('showLearningProgress', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Show Skills Publicly</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your skills and expertise levels
              </p>
            </div>
            <Switch
              checked={settings?.showSkillsPublicly !== false}
              onChange={(value) => handlePrivacyChange('showSkillsPublicly', value)}
            />
          </div>
        </div>
      </Card>

      {/* Data & Analytics */}
      <Card title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <span>Data & Analytics</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Track Learning Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow us to collect data about your learning patterns
              </p>
            </div>
            <Switch
              checked={dataAnalytics?.trackLearningAnalytics !== false}
              onChange={(value) => handleAnalyticsChange('trackLearningAnalytics', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Share Analytics Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help improve the platform by sharing anonymized usage data
              </p>
            </div>
            <Switch
              checked={dataAnalytics?.shareAnalyticsData === true}
              onChange={(value) => handleAnalyticsChange('shareAnalyticsData', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Personalized Recommendations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use your data to provide personalized learning suggestions
              </p>
            </div>
            <Switch
              checked={dataAnalytics?.allowPersonalizedRecommendations !== false}
              onChange={(value) => handleAnalyticsChange('allowPersonalizedRecommendations', value)}
            />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <div>
                <h4 className="font-medium">Data Export</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow data export functionality
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.allowDataExport !== false}
              onChange={(value) => handlePrivacyChange('allowDataExport', value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}