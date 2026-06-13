import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarItem from '../components/common/sidebar/SidebarItem';
import SidebarLogo from '../components/common/sidebar/SidebarLogo';
import {
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/user/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/user/courses', icon: <BookOutlined />, label: 'Khám phá khóa học' }
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      <SidebarLogo />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.key || (item.key !== '/' && location.pathname.startsWith(item.key))}
            onClick={() => navigate(item.key)}
          />
        ))}
      </div>
    </div>
  );
};

import TopBar from '../components/common/TopBar';

const UserLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <UserSidebar />
      <div style={{ 
        marginLeft: '260px',
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'calc(100vw - 260px)'
      }}>
        <TopBar />
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
