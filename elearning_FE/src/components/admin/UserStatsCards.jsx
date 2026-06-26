import React from 'react';
import { Card, Row, Col, Typography, DatePicker } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  IdcardOutlined, 
  UserAddOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mảnh ghép cực nhỏ: 1 Thẻ thống kê
const StatCard = ({ title, value, subtext, icon, iconBg, subtextColor = '#10b981', extra }) => (
  <Card bordered={true} style={{ borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', height: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
            {title}
          </Text>
          {extra}
        </div>
        <Title level={2} style={{ margin: '8px 0 0 0', fontWeight: 700, color: '#1e293b' }}>
          {value}
        </Title>
        {subtext && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <Text style={{ color: subtextColor, fontSize: '12px', fontWeight: 500 }}>{subtext}</Text>
          </div>
        )}
      </div>
      <div style={{ 
        backgroundColor: iconBg, 
        padding: '12px', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        marginLeft: '12px'
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// Mảnh ghép gom 4 thẻ lại
const UserStatsCards = ({ stats, onlineCounts, dateRange, onDateRangeChange }) => {
  // Bỏ dữ liệu fake theo yêu cầu. Nếu chưa có API, hiển thị "--"
  const data = stats || { totalStudents: '--', activeStudents: '--', totalInstructors: '--', newStudentsThisMonth: '--' };
  const counts = onlineCounts || { students: 0, instructors: 0 };

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '24px', display: 'flex', alignItems: 'stretch' }}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Tổng số Học viên" 
          value={data.totalStudents} 
          subtext="Tất cả tài khoản học viên"
          subtextColor="#64748b"
          icon={<TeamOutlined style={{ color: '#3b82f6' }} />} 
          iconBg="#dbeafe" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="ĐANG HOẠT ĐỘNG" 
          value={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{counts.students || 0}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginRight: '8px' }}>Học viên</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{counts.instructors || 0}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Giảng viên</span>
            </div>
          } 
          subtext="Đang online ngay bây giờ"
          subtextColor="#10b981"
          icon={<UserOutlined style={{ color: '#8b5cf6' }} />} 
          iconBg="#ede9fe" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Tổng số Giảng viên" 
          value={data.totalInstructors} 
          subtext="Giảng viên đã được duyệt"
          subtextColor="#f59e0b"
          icon={<IdcardOutlined style={{ color: '#f97316' }} />} 
          iconBg="#ffedd5" 
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard 
          title="Học viên mới" 
          value={data.newStudentsThisMonth} 
          subtext={<span><ArrowUpOutlined /> Mức tăng trưởng</span>}
          subtextColor="#10b981"
          icon={<UserAddOutlined style={{ color: '#a855f7' }} />} 
          iconBg="#f3e8ff" 
          extra={
            <RangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              size="small"
              variant="borderless"
              bordered={false}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ maxWidth: '160px', fontSize: '11px', padding: 0 }}
              allowClear={true}
            />
          }
        />
      </Col>
    </Row>
  );
};

export default UserStatsCards;
