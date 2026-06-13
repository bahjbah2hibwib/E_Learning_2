import React, { useState, useEffect } from 'react';
import LecturerLayout from '../../layouts/LecturerLayout';
import { Row, Col, Card, Typography, Table, Tag, Avatar, Spin } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  PlayCircleOutlined,
  ArrowUpOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip
} from 'recharts';
import instructorService from '../../services/instructorService';

const { Title, Text } = Typography;

// Reusable Stat Card Component
const StatCard = ({ icon, iconBg, iconColor, title, value, badgeText }) => (
  <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: iconBg, color: iconColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
        {icon}
      </div>
      {badgeText && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowUpOutlined style={{ fontSize: '10px' }} /> {badgeText}
        </div>
      )}
    </div>
    <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>{title}</Text>
    <Title level={2} style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{value}</Title>
  </Card>
);

const LecturerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    registrationTrend: [],
    myCourses: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await instructorService.getDashboardStats();
        if (res && res.success) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch instructor dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar shape="square" size={48} src={record.thumb} style={{ borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b', fontSize: '14px' }}>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '13px' }}>{record.category}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color, text;
        if (status === 'APPROVED') { color = 'success'; text = 'ĐÃ DUYỆT'; }
        else if (status === 'PENDING') { color = 'warning'; text = 'CHỜ DUYỆT'; }
        else { color = 'default'; text = 'ĐÃ ẨN'; }
        
        return <Tag color={color} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>{text}</Tag>;
      }
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'registered',
      key: 'registered',
      align: 'center',
      render: val => <Text strong style={{ fontSize: '15px', color: '#334155' }}>{val.toLocaleString()}</Text>
    }
  ];

  return (
    <LecturerLayout>
      <div style={{ padding: '0 8px', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" tip="Đang lấy dữ liệu thống kê..." />
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<BookOutlined />} iconBg="#eff6ff" iconColor="#3b82f6"
                  title="Tổng số khóa học" value={dashboardData.totalCourses}
                  badgeText="Thời gian thực"
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<TeamOutlined />} iconBg="#f3e8ff" iconColor="#8b5cf6"
                  title="Tổng số học viên" value={dashboardData.totalStudents.toLocaleString()}
                  badgeText="Đã đăng ký"
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<PlayCircleOutlined />} iconBg="#fffbeb" iconColor="#f59e0b"
                  title="Khóa học đang hoạt động" value={dashboardData.activeCourses}
                />
              </Col>
            </Row>

            {/* Main Content Area */}
            <Row gutter={[24, 24]}>
              {/* Registration Trend Chart */}
              <Col xs={24} lg={8}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%' }}
                  bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Tình hình đăng ký</Title>
                    <MoreOutlined style={{ fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }} />
                  </div>
                  <div style={{ flex: 1, minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.registrationTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={30}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }} 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* Your Courses Table */}
              <Col xs={24} lg={16}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Khóa học của bạn</Title>
                    <a href="#" style={{ color: '#3b82f6', fontWeight: 500 }}>Xem tất cả</a>
                  </div>
                  <Table 
                    columns={columns} 
                    dataSource={dashboardData.myCourses} 
                    pagination={false}
                    rowKey="key"
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </LecturerLayout>
  );
};

export default LecturerDashboardPage;
