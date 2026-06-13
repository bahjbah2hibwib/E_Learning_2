import React from 'react';
import { Typography } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import authBg from '../../assets/images/auth-bg.png'; // Sử dụng hình ảnh vừa generate

const { Title, Text } = Typography;

const AuthSplitLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* CỘT TRÁI: Hình ảnh và Branding (Chiếm 50% màn hình) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Lớp nền hình ảnh thư viện */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${authBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}></div>

        {/* Lớp phủ màu xanh đen đậm (Gradient Overlay) giống thiết kế */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.7) 100%)'
        }}></div>

        {/* Nội dung chữ trên nền ảnh */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          textAlign: 'center', 
          padding: '0 40px',
          color: 'white' 
        }}>
          <ReadOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '16px', fontWeight: 700 }}>EduFlow</Title>
          <Text style={{ 
            color: '#cbd5e1', 
            fontSize: '16px', 
            maxWidth: '400px', 
            display: 'inline-block',
            lineHeight: 1.6
          }}>
            Nền tảng quản lý học tập hiện đại, tối ưu hóa trải nghiệm giáo dục với sự chính xác và chuyên nghiệp.
          </Text>
        </div>
      </div>

      {/* CỘT PHẢI: Chứa Form nhập liệu (Chiếm 50% màn hình) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthSplitLayout;
