import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Result, Button, Card, Spin, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';

const { Title, Text } = Typography;

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message');
    
    if (resultCode === '0') {
      setStatus('success');
    } else if (resultCode) {
      setStatus('error');
    } else {
      // Not a Momo return?
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <UserLayout>
      <div style={{ backgroundColor: '#f7f9fa', minHeight: 'calc(100vh - 64px)', padding: '60px 24px' }}>
        <Card style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {status === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <Title level={4} style={{ marginTop: '24px' }}>Đang xử lý kết quả thanh toán...</Title>
            </div>
          )}

          {status === 'success' && (
            <Result
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title={<Title level={2} style={{ margin: 0 }}>Thanh toán thành công!</Title>}
              subTitle={
                <div style={{ marginTop: '16px' }}>
                  <Text style={{ fontSize: '16px' }}>
                    Cảm ơn bạn đã mua khóa học. Giao dịch đã được xác nhận và khóa học đã được thêm vào tài khoản của bạn.
                  </Text>
                </div>
              }
              extra={[
                <Button 
                  type="primary" 
                  key="dashboard" 
                  size="large"
                  onClick={() => navigate('/user/dashboard')}
                  style={{ backgroundColor: '#a435f0', borderColor: '#a435f0', fontWeight: 600 }}
                >
                  Đến bảng điều khiển học tập
                </Button>,
                <Button 
                  key="courses" 
                  size="large"
                  onClick={() => navigate('/user/courses')}
                >
                  Khám phá thêm khóa học
                </Button>,
              ]}
            />
          )}

          {status === 'error' && (
            <Result
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              title={<Title level={2} style={{ margin: 0 }}>Thanh toán thất bại</Title>}
              subTitle={
                <div style={{ marginTop: '16px' }}>
                  <Text style={{ fontSize: '16px' }}>
                    Giao dịch của bạn không thành công hoặc đã bị hủy. Lỗi: {searchParams.get('message') || 'Không rõ nguyên nhân'}
                  </Text>
                </div>
              }
              extra={[
                <Button 
                  type="primary" 
                  key="retry" 
                  size="large"
                  onClick={() => navigate(-1)} // Quay lại trang trước (thường là trang checkout)
                  style={{ backgroundColor: '#a435f0', borderColor: '#a435f0', fontWeight: 600 }}
                >
                  Thử lại
                </Button>,
                <Button 
                  key="home" 
                  size="large"
                  onClick={() => navigate('/user/courses')}
                >
                  Về trang chủ
                </Button>,
              ]}
            />
          )}
        </Card>
      </div>
    </UserLayout>
  );
};

export default PaymentReturnPage;
