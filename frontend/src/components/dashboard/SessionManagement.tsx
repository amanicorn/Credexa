import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Modal, 
  Tag, 
  App,
  Row, 
  Col, 
  Statistic,
  Typography,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  DesktopOutlined, 
  MobileOutlined, 
  TabletOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { useApp } = App;

interface DeviceInfo {
  type?: string;
  browser?: string;
  os?: string;
}

interface LocationInfo {
  city?: string;
  country?: string;
}

interface Session {
  id: string;
  device?: DeviceInfo;
  location?: LocationInfo;
  ipAddress?: string;
  createdAt: string;
  lastActivity: string;
  isCurrent?: boolean;
}

interface SessionStats {
  activeSessions?: number;
  totalSessions?: number;
  uniqueDevices?: number;
  uniqueLocations?: number;
  deviceTypes?: string[];
  countries?: string[];
}

const SessionManagementComponent = () => {
  const { message, modal } = App.useApp();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats>({});
  const [loading, setLoading] = useState(false);

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || 'desktop';
    if (type.includes('mobile') || type.includes('phone')) {
      return <MobileOutlined />;
    } else if (type.includes('tablet')) {
      return <TabletOutlined />;
    }
    return <DesktopOutlined />;
  };

  const getDeviceTypeColor = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || 'desktop';
    if (type.includes('mobile') || type.includes('phone')) {
      return 'green';
    } else if (type.includes('tablet')) {
      return 'orange';
    }
    return 'blue';
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔍 Fetching sessions with token:', token ? 'Token exists' : 'No token found');
      console.log('🔗 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sessions data:', data);
        setSessions(data.sessions);
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        message.error(`Failed to fetch sessions: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      message.error('Error fetching sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching session stats:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        message.success('Session terminated successfully');
        fetchSessions();
        fetchStats();
      } else {
        message.error('Failed to terminate session');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      message.error('Error terminating session');
    }
  };

  const terminateAllOtherSessions = async () => {
    modal.confirm({
      title: 'Terminate All Other Sessions',
      icon: <ExclamationCircleOutlined />,
      content: 'This will log you out of all other devices. Are you sure?',
      okText: 'Yes, Terminate All',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/terminate-others`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            message.success(`${data.terminatedCount} sessions terminated successfully`);
            fetchSessions();
            fetchStats();
          } else {
            message.error('Failed to terminate sessions');
          }
        } catch (error) {
          console.error('Error terminating sessions:', error);
          message.error('Error terminating sessions');
        }
      },
    });
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3} style={{ marginBottom: '20px' }}>
        <SecurityScanOutlined /> Session Management
      </Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={stats.activeSessions || 0}
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sessions"
              value={stats.totalSessions || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unique Devices"
              value={stats.uniqueDevices || 0}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Countries"
              value={stats.uniqueLocations || 0}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button onClick={fetchSessions} loading={loading}>
            Refresh Sessions
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={terminateAllOtherSessions}
            disabled={sessions.length <= 1}
          >
            Terminate All Other Sessions
          </Button>
        </Space>
      </div>

      {/* Sessions List */}
      <Card title="Active Sessions">
        <List
          loading={loading}
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              actions={[
                session.isCurrent ? (
                  <Tag color="green">Current Session</Tag>
                ) : (
                  <Popconfirm
                    title="Terminate this session?"
                    description="This will log out this device immediately."
                    onConfirm={() => terminateSession(session.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Terminate
                    </Button>
                  </Popconfirm>
                )
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>
                    {getDeviceIcon(session.device?.type)}
                  </div>
                }
                title={
                  <Space>
                    <span>{session.device?.browser || 'Unknown Browser'}</span>
                    <Tag color={getDeviceTypeColor(session.device?.type)}>
                      {session.device?.type || 'Desktop'}
                    </Tag>
                    {session.isCurrent && <Tag color="green">Current</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <div>
                      <Text type="secondary">
                        <EnvironmentOutlined /> {session.location?.city || 'Unknown City'}, {session.location?.country || 'Unknown Country'}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">IP: {session.ipAddress}</Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        <ClockCircleOutlined /> Last activity: {moment(session.lastActivity).fromNow()}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        Created: {moment(session.createdAt).format('MMM DD, YYYY HH:mm')}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {sessions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No active sessions found</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

const SessionManagement = () => (
  <App>
    <SessionManagementComponent />
  </App>
);

export default SessionManagement;