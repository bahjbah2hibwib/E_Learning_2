import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Row, Col, Typography, Button, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import AdminLayout from '../../components/common/sidebar/AdminLayout';
import UserProfileCard from '../../components/admin/UserProfileCard';
import UserActivityTabs from '../../components/admin/UserActivityTabs';
import userService from '../../services/userService';

const { Title } = Typography;

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State quản lý dữ liệu
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // State quản lý Tabs
  const [activeTab, setActiveTab] = useState('courses');
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch dữ liệu người dùng khi mới vào trang
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        if (response.success) {
          setUserData(response.data);
          // Mặc định load data cho Tab Khóa học sau khi có thông tin User
          fetchTabData('courses', response.data.role);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
        // Nếu lỗi 403 hoặc 404, có thể redirect về trang danh sách
        message.error(error.message || 'Không thể lấy thông tin người dùng');
        if (error.errorCode === 'FORBIDDEN_ACCESS' || error.errorCode === 'USER_NOT_FOUND') {
          navigate('/admin/users');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id, navigate]);

  // Hàm mô phỏng lấy dữ liệu cho Tabs (Vì Backend chưa có API này)
  const fetchTabData = (tabKey, role) => {
    setTabLoading(true);
    
    // Giả lập delay mạng
    setTimeout(() => {
      if (tabKey === 'courses') {
        // Dữ liệu giả lập Khóa học
        setTabData([
          { courseId: 1, courseName: 'Java Spring Boot Masterclass', status: 'COMPLETED', enrollDate: '2025-10-15' },
          { courseId: 2, courseName: 'React JS Thực chiến', status: 'LEARNING', enrollDate: '2026-02-20' },
        ]);
      } else if (tabKey === 'payments') {
        // Dữ liệu giả lập Lịch sử thanh toán
        setTabData([
          { paymentId: 101, transactionId: 'TXN-98273645', amount: 1500000, status: 'SUCCESS', paymentDate: '2025-10-15' },
          { paymentId: 102, transactionId: 'TXN-11223344', amount: 850000, status: 'FAILED', paymentDate: '2026-02-20' },
        ]);
      }
      setTabLoading(false);
    }, 800);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchTabData(key, userData?.role);
  };

  const handleEdit = () => {
    message.info('Tính năng Chỉnh sửa đang được phát triển!');
  };

  const handleToggleLock = () => {
    message.info('Tính năng Khóa/Mở khóa đang được phát triển!');
  };

  return (
    <AdminLayout>
      <div style={{ padding: '0 0 24px 0' }}>
        {/* Breadcrumb và Nút quay lại */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/users')}
            style={{ fontSize: '16px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}
          />
          <div>
            <Breadcrumb
              items={[
                { href: '/admin/dashboard', title: <><HomeOutlined /> Trang chủ</> },
                { href: '/admin/users', title: <><UserOutlined /> Quản lý người dùng</> },
                { title: userData ? userData.fullName : 'Chi tiết' },
              ]}
              style={{ marginBottom: '4px', fontSize: '13px' }}
            />
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Hồ sơ người dùng</Title>
          </div>
        </div>

        {/* Nội dung chính */}
        <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
          {userData && (
            <Row gutter={[24, 24]}>
              {/* Cột trái: Thông tin cá nhân */}
              <Col xs={24} lg={8} xl={7}>
                <UserProfileCard 
                  userData={userData} 
                  onEdit={handleEdit}
                  onToggleLock={handleToggleLock}
                />
              </Col>
              
              {/* Cột phải: Tabs Hoạt động */}
              <Col xs={24} lg={16} xl={17}>
                <UserActivityTabs 
                  userData={userData}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  tabData={tabData}
                  tabLoading={tabLoading}
                />
              </Col>
            </Row>
          )}
        </Spin>
      </div>
    </AdminLayout>
  );
};

export default UserDetailPage;
