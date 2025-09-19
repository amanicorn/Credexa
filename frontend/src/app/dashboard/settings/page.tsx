"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Card, Spin } from 'antd';
import toast from 'react-hot-toast';
import api from '@/utils/axios';
import Sidebar from '@/components/dashboard/Sidebar';
import dynamic from 'next/dynamic';

// More aggressive lazy loading with smaller bundles
const AccountSettings = dynamic(() => import('@/components/settings/AccountSettings'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

const PrivacySettings = dynamic(() => import('@/components/settings/PrivacySettings'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

const NotificationSettings = dynamic(() => import('@/components/settings/NotificationSettings'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

const DisplaySettings = dynamic(() => import('@/components/settings/DisplaySettings'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

const CredentialSettings = dynamic(() => import('@/components/settings/CredentialSettings'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

const SessionManagement = dynamic(() => import('@/components/dashboard/SessionManagement'), {
  loading: () => <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
  ssr: false
});

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set()); // Start with no tabs loaded

  const fetchSettings = useCallback(async () => {
    try {
      // Only fetch basic settings initially
      const settingsRes = await api.get('/api/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      setSettings(settingsRes.data.settings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  }, []);

  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const accountsRes = await api.get('/api/settings/connected-accounts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setConnectedAccounts(accountsRes.data);
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    }
  }, []);

  const updateSettings = useCallback(async (updates: any): Promise<void> => {
    try {
      const response = await api.put('/api/settings', updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      setSettings(response.data.settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    
    // Load initial tab
    setLoadedTabs(new Set(['account']));
    fetchSettings();
  }, [router]);

  useEffect(() => {
    // Fetch connected accounts when Account tab is accessed
    if (activeTab === 'account' && !connectedAccounts) {
      fetchConnectedAccounts();
    }
  }, [activeTab, connectedAccounts, fetchConnectedAccounts]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    // Add tab to loaded tabs set when user clicks on it
    if (!loadedTabs.has(key)) {
      setLoadedTabs(prev => new Set(prev).add(key));
    }
  }, [loadedTabs]);

  const handleTabHover = useCallback((key: string) => {
    // Preload tab on hover for faster switching
    if (!loadedTabs.has(key)) {
      setTimeout(() => {
        setLoadedTabs(prev => {
          if (!prev.has(key)) {
            return new Set(prev).add(key);
          }
          return prev;
        });
      }, 200); // Small delay to avoid loading on accidental hover
    }
  }, [loadedTabs]);

  const tabItems = useMemo(() => [
    {
      key: 'account',
      label: <span onMouseEnter={() => handleTabHover('account')}>Account</span>,
      children: loadedTabs.has('account') ? (
        <AccountSettings 
          settings={settings?.accountSecurity} 
          connectedAccounts={connectedAccounts}
          onUpdate={updateSettings}
          onRefresh={async () => {
            await fetchSettings();
            if (!connectedAccounts) {
              await fetchConnectedAccounts();
            }
          }}
        />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
    {
      key: 'privacy',
      label: <span onMouseEnter={() => handleTabHover('privacy')}>Privacy</span>,
      children: loadedTabs.has('privacy') ? (
        <PrivacySettings 
          settings={settings?.privacy} 
          dataAnalytics={settings?.dataAnalytics}
          onUpdate={updateSettings}
        />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
    {
      key: 'notifications',
      label: <span onMouseEnter={() => handleTabHover('notifications')}>Notifications</span>,
      children: loadedTabs.has('notifications') ? (
        <NotificationSettings 
          settings={settings?.notifications}
          onUpdate={updateSettings}
        />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
    {
      key: 'display',
      label: <span onMouseEnter={() => handleTabHover('display')}>Display</span>,
      children: loadedTabs.has('display') ? (
        <DisplaySettings 
          settings={settings?.display}
          onUpdate={updateSettings}
        />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
    {
      key: 'credentials',
      label: <span onMouseEnter={() => handleTabHover('credentials')}>Credentials</span>,
      children: loadedTabs.has('credentials') ? (
        <CredentialSettings 
          settings={settings?.credentials}
          blockchain={settings?.blockchain}
          learning={settings?.learning}
          onUpdate={updateSettings}
        />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
    {
      key: 'sessions',
      label: <span onMouseEnter={() => handleTabHover('sessions')}>Sessions</span>,
      children: loadedTabs.has('sessions') ? (
        <SessionManagement />
      ) : <div className="flex justify-center items-center py-8"><Spin size="large" /></div>,
    },
  ], [loadedTabs, settings, connectedAccounts, handleTabHover, updateSettings, fetchSettings, fetchConnectedAccounts]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage your account, privacy, and preferences
                </p>
              </div>
              <Card className="shadow-sm">
                <div className="flex justify-center items-center py-12">
                  <Spin size="large" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your account, privacy, and preferences
              </p>
            </div>

            <Card className="shadow-sm">
              <Tabs
                defaultActiveKey="account"
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                size="large"
                className="settings-tabs"
                tabBarStyle={{
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '24px'
                }}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}