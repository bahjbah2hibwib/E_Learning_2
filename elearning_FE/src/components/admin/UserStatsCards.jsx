import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  IdcardOutlined, 
  UserAddOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mảnh ghép cực nhỏ: 1 Thẻ thống kê
const StatCard = ({ title, value, subtext, icon, iconBg, subtextColor = '#10b981' }) => (
  <Card bordered={true} style={{ borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
          {title}
        </Text>
        <Title level={2} style={{ margin: '8px 0 0 0', fontWeight: 700, color: '#1e293b' }}>
          {value}
        </Title>
      </div>
      <div style={{ 
        backgroundColor: iconBg, 
        padding: '12px', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// Mảnh ghép gom 4 thẻ lại
const UserStatsCards = ({ stats }) => {
  // Bỏ dữ liệu fake theo yêu cầu. Nếu chưa có API, hiển thị "--"
  const data = stats || { total: '--', activeStudents: '--', totalInstructors: '--', newUsers: '--' };

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Tổng người dùng" 
          value={data.total} 
          icon={<TeamOutlined style={{ color: '#3b82f6' }} />} 
          iconBg="#dbeafe" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Học viên hoạt động" 
          value={data.activeStudents} 
          icon={<UserOutlined style={{ color: '#8b5cf6' }} />} 
          iconBg="#ede9fe" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Tổng giảng viên" 
          value={data.totalInstructors} 
          icon={<IdcardOutlined style={{ color: '#f97316' }} />} 
          iconBg="#ffedd5" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Đăng ký mới" 
          value={data.newUsers} 
          icon={<UserAddOutlined style={{ color: '#a855f7' }} />} 
          iconBg="#f3e8ff" 
        />
      </Col>
    </Row>
  );
};

export default UserStatsCards;
