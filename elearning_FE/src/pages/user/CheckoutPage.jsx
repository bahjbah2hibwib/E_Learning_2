import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Card, Button, Input, Radio, Space, Divider, message, Spin
} from 'antd';
import { 
  ArrowLeftOutlined, 
  WalletOutlined,
  LockOutlined
} from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import { useParams, useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [note, setNote] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await courseService.getPublicCourseDetail(id);
      if (res && res.success) {
        setCourse(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết khóa học:", error);
      message.error("Không thể lấy thông tin khóa học");
      navigate('/user/courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.userId) {
        message.warning("Vui lòng đăng nhập để thanh toán");
        navigate('/login');
        return;
      }

      setPayLoading(true);
      
      // Temporary: Directly enroll like before (until Momo is integrated)
      const res = await userService.enrollCourse(user.userId, id);
      if (res && res.success) {
        message.success("Thanh toán thành công! Chúc bạn học tốt.");
        navigate('/user/dashboard');
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi thanh toán khóa học");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
      </UserLayout>
    );
  }

  if (!course) return null;

  const price = course.price || 0;
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <UserLayout>
      <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <Link to={`/user/courses/${id}`} style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeftOutlined /> Trở lại khóa học
            </Link>
            <Title level={2} style={{ margin: '16px 0 8px 0', color: '#1e293b' }}>Thanh toán Khóa học</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>Hoàn tất đăng ký để bắt đầu học ngay.</Text>
          </div>

          <Row gutter={32}>
            {/* Left Column: Payment Info & Methods */}
            <Col xs={24} md={14}>
              <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Title level={4} style={{ marginBottom: '20px' }}>Thông tin thanh toán</Title>
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ marginBottom: '20px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Mã giảm giá (Nếu có)</Text>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Input 
                      placeholder="Nhập mã..." 
                      size="large" 
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                    <Button size="large" style={{ backgroundColor: '#e2e8f0', borderColor: '#e2e8f0', borderRadius: '6px', fontWeight: 500 }}>
                      Áp dụng
                    </Button>
                  </div>
                </div>

                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Ghi chú (Tùy chọn)</Text>
                  <TextArea 
                    rows={4} 
                    placeholder="Ghi chú thêm về đơn hàng..." 
                    style={{ borderRadius: '6px' }}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
              </Card>

              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Title level={4} style={{ marginBottom: '20px' }}>Phương thức thanh toán</Title>
                <Divider style={{ margin: '16px 0' }} />
                
                <Radio.Group onChange={e => setPaymentMethod(e.target.value)} value={paymentMethod} style={{ width: '100%' }}>
                  <div style={{ 
                    border: paymentMethod === 'momo' ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'momo' ? '#eff6ff' : '#fff'
                  }} onClick={() => setPaymentMethod('momo')}>
                    <Radio value="momo" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '8px', 
                        backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', color: '#64748b'
                      }}>
                        <WalletOutlined />
                      </div>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '15px' }}>Ví điện tử Momo</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Quét mã QR thanh toán nhanh</Text>
                      </div>
                    </div>
                  </div>
                </Radio.Group>
              </Card>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} md={10}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Title level={4} style={{ marginBottom: '20px' }}>Đơn hàng của bạn</Title>
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <img 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    src={course.thumbnailUrl || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} 
                    alt="course" 
                    style={{ width: '100px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '15px', lineHeight: '1.4', marginBottom: '4px' }}>
                      {course.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      Giảng viên: {course.instructorName || 'Chưa cập nhật'}
                    </Text>
                    <Text strong style={{ color: '#2563eb', fontSize: '16px' }}>{formattedPrice}</Text>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text type="secondary">Tạm tính</Text>
                  <Text strong>{formattedPrice}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text style={{ color: '#10b981' }}>Giảm giá</Text>
                  <Text style={{ color: '#10b981' }}>-0 đ</Text>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>
                  <Title level={3} style={{ margin: 0, color: '#2563eb' }}>{formattedPrice}</Title>
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  loading={payLoading}
                  onClick={handlePayment}
                  style={{ 
                    height: '50px', 
                    borderRadius: '8px', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    background: '#1d4ed8',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LockOutlined /> Thanh toán ngay
                </Button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Bằng việc thanh toán, bạn đồng ý với <Link to="#">Điều khoản dịch vụ</Link> của chúng tôi.
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

        </div>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;
