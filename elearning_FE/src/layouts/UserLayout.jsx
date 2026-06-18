import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import Footer from '../components/common/Footer';
import { Typography, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/user/courses', label: 'Khám phá' },
    { key: '/user/dashboard', label: 'Học tập của tôi' }
  ];

  const leftContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {/* Logo */}
      <div 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', paddingRight: '16px' }} 
        onClick={() => navigate('/user/dashboard')}
      >
        <Title level={3} style={{ color: '#1c1d1f', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
          EduFlow.
        </Title>
      </div>

      {/* Navigation Menu */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.key || (item.key !== '/' && location.pathname.startsWith(item.key));
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: '15px',
                color: isActive ? '#5624d0' : '#1c1d1f',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#5624d0';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#1c1d1f';
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <Input
        size="large"
        placeholder="Tìm kiếm nội dung học..."
        prefix={<SearchOutlined style={{ color: '#1c1d1f' }} />}
        style={{
          borderRadius: '9999px',
          backgroundColor: '#f7f9fa',
          border: '1px solid #1c1d1f',
          width: '360px',
          marginLeft: '16px'
        }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <TopBar leftContent={leftContent} />
      <div style={{ flex: 1, minHeight: 'calc(100vh - 64px - 300px)' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;
