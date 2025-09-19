"use client";

import { Card, Switch, Divider } from 'antd';
import { Bell, Mail, Smartphone, Award, BookOpen, Shield, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export default function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const handleEmailChange = async (field: string, value: boolean) => {
    try {
      await onUpdate({
        notifications: {
          ...settings,
          email: {
            ...settings?.email,
            [field]: value
          }
        }
      });
    } catch (error) {
      toast.error('Failed to update email notification setting');
    }
  };

  const handlePushChange = async (field: string, value: boolean) => {
    try {
      await onUpdate({
        notifications: {
          ...settings,
          push: {
            ...settings?.push,
            [field]: value
          }
        }
      });
    } catch (error) {
      toast.error('Failed to update push notification setting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card title={
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <span>Email Notifications</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Credential Updates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New credentials earned, verifications, and status changes
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email?.credentialUpdates !== false}
              onChange={(value) => handleEmailChange('credentialUpdates', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-medium">Achievement Alerts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Milestones, badges, and accomplishments
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email?.achievementAlerts !== false}
              onChange={(value) => handleEmailChange('achievementAlerts', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Learning Reminders</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Course deadlines, study reminders, and learning goals
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email?.learningReminders !== false}
              onChange={(value) => handleEmailChange('learningReminders', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Login attempts, password changes, and security updates
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.email?.securityAlerts !== false}
              onChange={(value) => handleEmailChange('securityAlerts', value)}
            />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Weekly Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Summary of your learning progress and achievements
              </p>
            </div>
            <Switch
              checked={settings?.email?.weeklyReports !== false}
              onChange={(value) => handleEmailChange('weeklyReports', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Monthly Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed monthly analytics and insights
              </p>
            </div>
            <Switch
              checked={settings?.email?.monthlyReports === true}
              onChange={(value) => handleEmailChange('monthlyReports', value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Marketing Emails</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Product updates, tips, and promotional content
              </p>
            </div>
            <Switch
              checked={settings?.email?.marketingEmails === true}
              onChange={(value) => handleEmailChange('marketingEmails', value)}
            />
          </div>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card title={
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <span>Push Notifications</span>
        </div>
      }>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Enable Push Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              checked={settings?.push?.enabled === true}
              onChange={(value) => handlePushChange('enabled', value)}
            />
          </div>

          {settings?.push?.enabled && (
            <>
              <Divider />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Achievement Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Instant notifications for new achievements
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.push?.achievementAlerts !== false}
                  onChange={(value) => handlePushChange('achievementAlerts', value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Learning Reminders</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Study reminders and course notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.push?.learningReminders !== false}
                  onChange={(value) => handlePushChange('learningReminders', value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Social Updates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Friend activities and social interactions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.push?.socialUpdates === true}
                  onChange={(value) => handlePushChange('socialUpdates', value)}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}