"use client";

import { useState } from 'react';
import { Card, Switch, Button, Modal, Form, Input, Divider, Tag, Alert } from 'antd';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Unlink, 
  Github, 
  Mail,
  Loader2
} from 'lucide-react';
import { FaGoogle, FaFacebook, FaDiscord, FaLinkedin } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import toast from 'react-hot-toast';
import api from '@/utils/axios';

interface AccountSettingsProps {
  settings: any;
  connectedAccounts: any;
  onUpdate: (updates: any) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function AccountSettings({ 
  settings, 
  connectedAccounts, 
  onUpdate, 
  onRefresh 
}: AccountSettingsProps) {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const providerIcons = {
    email: <Mail className="w-5 h-5" />,
    google: <FaGoogle className="w-5 h-5" />,
    github: <Github className="w-5 h-5" />,
    facebook: <FaFacebook className="w-5 h-5" />,
    discord: <FaDiscord className="w-5 h-5" />,
    linkedin: <FaLinkedin className="w-5 h-5" />,
    web3: <SiEthereum className="w-5 h-5" />
  };

  const providerNames = {
    email: 'Email',
    google: 'Google',
    github: 'GitHub',
    facebook: 'Facebook',
    discord: 'Discord',
    linkedin: 'LinkedIn',
    web3: 'Web3 Wallet'
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      await api.put('/api/settings/change-password', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      toast.success('Password changed successfully');
      setPasswordModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      await api.put('/api/settings/2fa', { enable: enabled }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      await onUpdate({
        accountSecurity: {
          ...settings,
          twoFactorEnabled: enabled
        }
      });
      
      toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update 2FA settings');
    }
  };

  const handleDisconnectAccount = async (provider: string) => {
    try {
      await api.delete(`/api/settings/connected-accounts/${provider}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      toast.success(`${providerNames[provider as keyof typeof providerNames]} account disconnected`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
    }
  };

  const handleSecuritySettingChange = async (field: string, value: any) => {
    try {
      await onUpdate({
        accountSecurity: {
          ...settings,
          [field]: value
        }
      });
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span>Account Security</span>
        </div>
      }>
        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {settings?.passwordLastChanged 
                  ? `Last changed: ${new Date(settings.passwordLastChanged).toLocaleDateString()}`
                  : 'Change your account password'
                }
              </p>
            </div>
            <Button 
              icon={<Key className="w-4 h-4" />}
              onClick={() => setPasswordModalOpen(true)}
              disabled={connectedAccounts?.primaryProvider !== 'email'}
            >
              Change Password
            </Button>
          </div>

          <Divider />

          {/* Two-Factor Authentication */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <h4 className="font-medium">Two-Factor Authentication</h4>
                {settings?.twoFactorEnabled && (
                  <Tag color="green">Enabled</Tag>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              checked={settings?.twoFactorEnabled || false}
              onChange={handleToggle2FA}
            />
          </div>

          <Divider />

          {/* Session Settings */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Session Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified of new login sessions
              </p>
            </div>
            <Switch 
              checked={settings?.sessionNotifications !== false}
              onChange={(value) => handleSecuritySettingChange('sessionNotifications', value)}
            />
          </div>
        </div>
      </Card>

      {/* Connected Accounts */}
      <Card title="Connected Accounts">
        <div className="space-y-4">
          <Alert 
            message="Manage your connected accounts. You need at least one method to sign in."
            type="info"
            showIcon
            className="mb-4"
          />

          {connectedAccounts && Object.entries(connectedAccounts.connectedAccounts).map(([provider, data]: [string, any]) => (
            <div key={provider} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {providerIcons[provider as keyof typeof providerIcons]}
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {providerNames[provider as keyof typeof providerNames]}
                    {data.primary && <Tag color="blue">Primary</Tag>}
                    {provider === 'web3' && data.connected && (
                      <span className="text-xs text-gray-500">
                        {data.address?.slice(0, 6)}...{data.address?.slice(-4)}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {data.connected ? (
                  <>
                    {!data.primary && (
                      <Button 
                        size="small"
                        danger
                        icon={<Unlink className="w-4 h-4" />}
                        onClick={() => handleDisconnectAccount(provider)}
                      >
                        Disconnect
                      </Button>
                    )}
                    {data.primary && (
                      <Tag color="green">Primary Login</Tag>
                    )}
                  </>
                ) : (
                  <Button size="small" type="dashed">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Passwords do not match');
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              onClick={() => {
                setPasswordModalOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}