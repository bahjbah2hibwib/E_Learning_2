import React from 'react';
import Sidebar from '../components/common/sidebar/Sidebar';
import TopBar from '../components/common/TopBar';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* 1. Gọi mảnh ghép Sidebar Cố định bên trái */}
      <Sidebar />
      
      {/* 2. Khung chứa nội dung chính ở bên phải */}
      <div style={{ 
        marginLeft: '260px', // Đẩy nội dung dịch sang phải 260px để nhường chỗ cho cái Sidebar cố định
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'calc(100vw - 260px)' // Chống tràn nội dung
      }}>
        <TopBar />
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {/* Nội dung thực sự của từng trang (Ví dụ: Danh sách User, Quản lý khóa học...) sẽ được nhét vào đây */}
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default AdminLayout;
