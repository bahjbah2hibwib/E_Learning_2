import React from 'react';
import { Card, Typography } from 'antd';
import { ReadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f6fa' // Màu nền xám nhạt giống thiết kế
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '480px', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          padding: '24px 8px'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Icon Mũ cử nhân / Cuốn sách giống thiết kế */}
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: '#eef2ff', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px auto',
            color: '#0056d2',
            fontSize: '24px'
          }}>
            <ReadOutlined />
          </div>
          <Title level={3} style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1f2937' }}>{title}</Title>
          <Text style={{ fontSize: '14px', color: '#6b7280' }}>{subtitle}</Text>
        </div>
        
        {children}
      </Card>
    </div>
  );
};

export default AuthCard;
