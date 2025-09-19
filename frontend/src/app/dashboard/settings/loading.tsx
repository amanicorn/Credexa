'use client';

import { Spin } from 'antd';
import Sidebar from '@/components/dashboard/Sidebar';

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Loading your settings...
              </p>
            </div>
            
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}