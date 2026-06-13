import React from 'react';
import { Card, Avatar, Typography, Tag, Button, Divider, Space } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, UnlockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserProfileCard = ({ userData, onEdit, onToggleLock }) => {
  if (!userData) return null;

  const isLocked = userData.status === false;

  const getRoleInfo = (role) => {
    switch (role) {
      case 'ROLE_INSTRUCTOR': return { color: '#ffedd5', textColor: '#c2410c', label: 'Giảng viên' };
      case 'ROLE_ADMIN': return { color: '#dcfce7', textColor: '#15803d', label: 'Quản trị viên' };
      case 'ROLE_SUPER_ADMIN': return { color: '#fee2e2', textColor: '#b91c1c', label: 'Super Admin' };
      default: return { color: '#f3e8ff', textColor: '#7e22ce', label: 'Học viên' };
    }
  };

  const roleInfo = getRoleInfo(userData.role);

  return (
    <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', height: '100%', overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
      {/* Nửa trên với background gradient mượt mà */}
      <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', padding: '40px 24px 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <div style={{ 
          padding: '6px', 
          background: '#ffffff', 
          borderRadius: '50%', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          marginBottom: '16px',
          transform: 'translateY(20px)',
          position: 'relative',
          zIndex: 2
        }}>
          <Avatar 
            size={110} 
            src={userData.avatarUrl} 
            style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '42px', fontWeight: 'bold' }} 
          >
            {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
        </div>
      </div>

      {/* Phần thông tin bên dưới */}
      <div style={{ padding: '40px 24px 32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <Title level={3} style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0f172a' }}>{userData.fullName}</Title>
        <Text style={{ marginBottom: '16px', fontSize: '15px', color: '#64748b', fontWeight: 500 }}>
          ID: {userData.role === 'ROLE_STUDENT' ? 'STU' : 'INS'}-{new Date(userData.createdAt).getFullYear()}-{userData.userId?.toString().padStart(3, '0')}
        </Text>
        
        <Space style={{ marginBottom: '24px' }}>
          <Tag color={roleInfo.color} style={{ color: roleInfo.textColor, border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '14px', fontWeight: 600 }}>
            {roleInfo.label}
          </Tag>
          <Tag color={isLocked ? 'error' : 'success'} style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '14px', fontWeight: 600, border: 'none', backgroundColor: isLocked ? '#fef2f2' : '#ecfdf5', color: isLocked ? '#ef4444' : '#10b981' }}>
            {isLocked ? 'Đã khóa' : 'Hoạt động'}
          </Tag>
        </Space>

        {(() => {
          const currentUserRole = localStorage.getItem('userRole') || '';
          const isAdmin = currentUserRole === 'ROLE_ADMIN';
          const cannotEdit = isAdmin && (userData.role === 'ROLE_ADMIN' || userData.role === 'ROLE_SUPER_ADMIN');

          return !cannotEdit ? (
            <div style={{ display: 'flex', width: '100%' }}>
              <Button type="primary" size="large" icon={<EditOutlined />} style={{ flex: 1, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', height: '48px', fontSize: '16px', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }} onClick={onEdit}>
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          ) : null;
        })()}

        <Divider style={{ margin: '32px 0 24px 0', borderColor: '#f1f5f9' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', textAlign: 'left', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MailOutlined style={{ color: '#3b82f6', fontSize: '18px' }} />
            </div>
            <Text ellipsis={{ tooltip: userData.email }} style={{ color: '#334155', fontSize: '16px', flex: 1, minWidth: 0, fontWeight: 500 }}>
              {userData.email}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneOutlined style={{ color: '#10b981', fontSize: '18px' }} />
            </div>
            <Text style={{ color: '#334155', fontSize: '16px', fontWeight: 500 }}>{userData.phone || 'Chưa cập nhật'}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
            </div>
            <Text style={{ color: '#334155', fontSize: '16px', fontWeight: 500 }}>
              {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </Text>
          </div>
        </div>
        
        <Divider style={{ margin: '24px 0 20px 0', borderColor: '#f1f5f9' }} />
        
        <div style={{ textAlign: 'center', width: '100%', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <Text style={{ fontSize: '14px', color: '#64748b' }}>
            Ngày tham gia: <span style={{ fontWeight: 600, color: '#334155' }}>{userData.createdAt ? new Date(userData.createdAt).toLocaleString('vi-VN') : '--'}</span>
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default UserProfileCard;
