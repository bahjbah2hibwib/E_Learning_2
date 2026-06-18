import React, { useState, useEffect } from 'react';
import { Dropdown, Avatar, Space, Badge, Spin, Typography } from 'antd';
import { 
  BellOutlined, 
  QuestionCircleOutlined, 
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const { Text } = Typography;

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

const TopBar = ({ userRole = 'Admin', userName = 'Tài khoản', leftContent }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu người dùng từ localStorage
  const [localUserName, setLocalUserName] = useState(userName);
  const [localUserRole, setLocalUserRole] = useState(userRole);

  useEffect(() => {
    fetchNotifications(true); // Lần đầu tiên load thì hiện loading
    
    // Đọc thông tin từ localStorage
    const storedName = localStorage.getItem('userName');
    if (storedName) setLocalUserName(storedName);
    
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
       if (storedRole === 'ROLE_SUPER_ADMIN') setLocalUserRole('Super Admin');
       else if (storedRole === 'ROLE_ADMIN') setLocalUserRole('Quản trị viên');
       else if (storedRole === 'ROLE_INSTRUCTOR') setLocalUserRole('Giảng viên');
       else if (storedRole === 'ROLE_STUDENT') setLocalUserRole('Học viên');
       else setLocalUserRole(storedRole);
    }
    
    // Polling ngầm mỗi 10 giây một lần (Không hiện loading để tránh giật lag UI)
    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [countRes, listRes] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications({ page: 0, size: 5 })
      ]);
      
      if (countRes?.success) setUnreadCount(countRes.data || 0);
      if (listRes?.success) setNotifications(listRes.data?.content || []);
    } catch (error) {
      console.error('Lỗi khi lấy thông báo từ API:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
    // Handle other actions like settings if needed
  };

  const items = [
    {
      key: 'settings',
      label: 'Cài đặt tài khoản',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // Dynamic Notification Items from API
  const notificationItems = notifications.length > 0 ? notifications.map(notif => ({
    key: notif.id || Math.random().toString(),
    label: (
      <div 
        style={{ padding: '8px 0', minWidth: '300px', opacity: notif.isRead ? 0.6 : 1 }}
        onClick={(e) => !notif.isRead && handleMarkAsRead(notif.id, e)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: notif.type === 'PAYMENT' ? '#16a34a' : (notif.type === 'ERROR' ? '#ef4444' : '#3b82f6') }}>
            {notif.title || 'Thông báo'}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {notif.createdAt ? formatDateTime(notif.createdAt) : 'Vừa xong'}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#475569', whiteSpace: 'normal' }}>
          {/* Hỗ trợ in đậm/in nghiêng do BE gửi bằng HTML nhỏ */}
          <span dangerouslySetInnerHTML={{ __html: notif.message }} />
        </div>
      </div>
    )
  })).reduce((acc, curr) => [...acc, curr, { type: 'divider' }], []) : [
    {
      key: 'empty',
      label: (
        <div style={{ padding: '16px', textAlign: 'center', minWidth: '250px' }}>
          {loading ? <Spin size="small" /> : <Text type="secondary">Chưa có thông báo nào</Text>}
        </div>
      )
    },
    { type: 'divider' }
  ];

  notificationItems.push({
    key: 'actions',
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
        <span 
          style={{ color: '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={handleMarkAllAsRead}
        >
          <CheckOutlined /> Đánh dấu đã đọc tất cả
        </span>
        <span style={{ color: '#3b82f6', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}>
          Xem tất cả
        </span>
      </div>
    ),
  });

  return (
    <div style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between', // Aligns items to the right
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 999
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {leftContent}
      </div>
      <Space size={24} align="center">
        {/* Help or Language Icon */}
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', transition: 'color 0.3s' }} className="hover-text-blue">
          {localUserRole === 'Học viên' || localUserRole === 'ROLE_STUDENT' ? (
            <GlobalOutlined style={{ fontSize: '20px' }} />
          ) : (
            <QuestionCircleOutlined style={{ fontSize: '20px' }} />
          )}
        </div>

        {/* Notification Bell */}
        <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', transition: 'color 0.3s' }} className="hover-text-blue">
            <Badge count={unreadCount} size="small" offset={[2, 0]}>
              <BellOutlined style={{ fontSize: '20px', color: 'inherit' }} />
            </Badge>
          </div>
        </Dropdown>

        {/* User Dropdown */}
        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', lineHeight: '1.2' }}>{localUserName}</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{localUserRole}</span>
            </div>
            <Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: '#3b82f6', border: '2px solid #eff6ff' }} />
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

export default TopBar;
