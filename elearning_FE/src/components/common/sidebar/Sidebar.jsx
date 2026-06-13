import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import SidebarLogo from './SidebarLogo';
import {
  AppstoreOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  FundOutlined
} from '@ant-design/icons';

const Sidebar = ({ menuItems: customMenuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Danh sách các menu chính mặc định (dành cho Admin)
  const defaultMenuItems = [
    { key: '/admin/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Quản lý người dùng' },
    { key: '/admin/courses', icon: <BookOutlined />, label: 'Quản lý khóa học' },
    { key: '/admin/payments', icon: <FundOutlined />, label: 'Quản lý giao dịch' },
  ];

  const menuItems = customMenuItems || defaultMenuItems;

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
      {/* Khối Logo ở trên cùng */}
      <SidebarLogo />

      {/* Vùng danh sách các nút điều hướng chính */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            // Active nếu URL hiện tại trùng khớp hoặc bắt đầu bằng đường dẫn (ví dụ: đang ở /admin/users/123 thì menu Users vẫn sáng)
            isActive={location.pathname === item.key || (item.key !== '/' && location.pathname.startsWith(item.key))}
            onClick={() => navigate(item.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
