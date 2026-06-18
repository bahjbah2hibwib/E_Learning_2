import React from 'react';
import Sidebar from '../components/common/sidebar/Sidebar';
import TopBar from '../components/common/TopBar';
import {
  AppstoreOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';

const LecturerLayout = ({ children, title = '' }) => {
  // Menu dành riêng cho giảng viên
  const lecturerMenuItems = [
    { key: '/lecturer/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/lecturer/courses', icon: <BookOutlined />, label: 'Quản lý khóa học' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* 1. Gọi mảnh ghép Sidebar Cố định bên trái và truyền menu riêng của giảng viên */}
      <Sidebar menuItems={lecturerMenuItems} />
      
      {/* 2. Khung chứa nội dung chính ở bên phải */}
      <div style={{ 
        marginLeft: '260px', // Đẩy nội dung dịch sang phải 260px để nhường chỗ cho cái Sidebar cố định
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'calc(100vw - 260px)' // Chống tràn nội dung
      }}>
        {/* Thanh TopBar được tái sử dụng, truyền thông tin giảng viên */}
        <TopBar userRole="Giảng viên" userName="Tài khoản Giảng viên" />
        
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {title && <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{title}</h2>}
          {/* Nội dung thực sự của từng trang (Ví dụ: Dashboard, Quản lý khóa học...) */}
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default LecturerLayout;
