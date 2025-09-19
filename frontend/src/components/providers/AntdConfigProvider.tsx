"use client";

import { ConfigProvider } from 'antd';
import { ReactNode } from 'react';

interface AntdConfigProviderProps {
  children: ReactNode;
}

export default function AntdConfigProvider({ children }: AntdConfigProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // You can customize Ant Design theme here if needed
          colorPrimary: '#0ea5e9', // Tailwind sky-500
          borderRadius: 8,
        },
        components: {
          // Component-specific theme customization
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 12,
          },
          Tabs: {
            borderRadius: 8,
          },
        },
      }}
      // Suppress React 19 compatibility warning
      warning={{
        strict: false,
      }}
    >
      {children}
    </ConfigProvider>
  );
}