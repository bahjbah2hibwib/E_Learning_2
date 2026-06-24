import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Card, Button, Input, Radio, Space, Divider, message, Spin, Select, Checkbox
} from 'antd';
import { 
  ArrowLeftOutlined, 
  WalletOutlined,
  LockOutlined
} from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import paymentService from '../../services/paymentService';
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
  const [discountCode, setDiscountCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [billingName, setBillingName] = useState('');
  const [billingPhone, setBillingPhone] = useState('');

  useEffect(() => {
    fetchCourseDetail();
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setBillingName(user.fullName || '');
      setBillingPhone(user.phone || '');
    }
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
      
      if (paymentMethod === 'momo') {
        const amount = course.price || 0;
        if (amount <= 0) {
          // Khóa học miễn phí, đăng ký thẳng
          const res = await userService.enrollCourse(user.userId, id);
          if (res && res.success) {
            message.success("Đăng ký khóa học thành công! Chúc bạn học tốt.");
            navigate('/user/dashboard');
          }
          return;
        }

        const res = await paymentService.createMoMoPayment(id, amount);
        if (res && res.success && res.payUrl) {
          // Chuyển hướng người dùng sang trang thanh toán MoMo
          window.location.href = res.payUrl;
        } else {
          message.error("Không thể lấy đường dẫn thanh toán MoMo.");
          setPayLoading(false);
        }
      } else {
        // Fallback for other methods if any
        const res = await userService.enrollCourse(user.userId, id);
        if (res && res.success) {
          message.success("Thanh toán thành công! Chúc bạn học tốt.");
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error(error.message || "Lỗi khi thanh toán khóa học");
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
      <div style={{ backgroundColor: '#fff', minHeight: 'calc(100vh - 64px)', paddingBottom: '60px' }}>
        {/* Header Section */}
        <div style={{ backgroundColor: '#1c1d1f', padding: '32px 0', color: '#fff', marginBottom: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Thanh toán bảo mật</Title>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Link to={`/user/courses/${id}`} style={{ color: '#5624d0', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
            <ArrowLeftOutlined /> Quay lại khóa học
          </Link>
          
          <Row gutter={48}>
            {/* Left Column: Payment Info & Methods */}
            <Col xs={24} lg={14}>
              <div style={{ paddingRight: '16px' }}>
                <Title level={3} style={{ marginBottom: '24px', fontWeight: 700 }}>Thông tin thanh toán</Title>
                
                <div style={{ marginBottom: '32px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Mã giảm giá (Tùy chọn)</Text>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input 
                      placeholder="Nhập mã giảm giá..." 
                      size="large" 
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      style={{ borderRadius: '0', height: '48px', flex: 1, borderColor: '#1c1d1f' }}
                    />
                    <Button size="large" style={{ backgroundColor: '#1c1d1f', color: '#fff', borderRadius: '0', fontWeight: 700, height: '48px', padding: '0 24px' }}>
                      Áp dụng
                    </Button>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Quốc gia</Text>
                  <Select 
                    defaultValue="vn"
                    size="large"
                    style={{ width: '100%', height: '48px' }}
                    options={[
                      { value: 'vn', label: 'Việt Nam' },
                      { value: 'us', label: 'Hoa Kỳ' },
                      { value: 'jp', label: 'Nhật Bản' },
                    ]}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    EduFlow được yêu cầu thu thuế giao dịch áp dụng đối với các giao dịch mua sắm tại một số khu vực tài phán nhất định.
                  </Text>
                </div>

                <Title level={3} style={{ marginBottom: '24px', fontWeight: 700, marginTop: '48px' }}>Chi tiết thanh toán</Title>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Họ và tên</Text>
                    <Input 
                      size="large" 
                      placeholder="Nhập họ và tên..." 
                      style={{ borderRadius: '0', height: '48px', borderColor: '#1c1d1f' }} 
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Số điện thoại</Text>
                    <Input 
                      size="large" 
                      placeholder="Nhập số điện thoại..." 
                      style={{ borderRadius: '0', height: '48px', borderColor: '#1c1d1f' }} 
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value)}
                    />
                  </div>
                </div>

                <Title level={3} style={{ marginBottom: '24px', fontWeight: 700, marginTop: '48px' }}>Phương thức thanh toán</Title>
                
                <div style={{ 
                  border: '1px solid #1c1d1f', 
                  borderRadius: '0',
                  padding: '24px', 
                  backgroundColor: '#f7f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <Radio checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} style={{ transform: 'scale(1.2)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
                      <Text strong style={{ fontSize: '16px', color: '#1c1d1f' }}>Ví MoMo</Text>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f7f9fa', border: '1px solid #d1d7dc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LockOutlined style={{ fontSize: '24px', color: '#1c1d1f' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Thanh toán an toàn 100%</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Thông tin của bạn được mã hóa an toàn bằng công nghệ SSL 256-bit.</Text>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} lg={10}>
              <div style={{ 
                backgroundColor: '#f7f9fa', 
                padding: '32px', 
                border: '1px solid #d1d7dc',
                position: 'sticky',
                top: '24px'
              }}>
                <Title level={3} style={{ marginBottom: '24px', fontWeight: 700 }}>Tóm tắt đơn hàng</Title>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <img 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    src={course.thumbnailUrl || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} 
                    alt="course" 
                    style={{ width: '120px', height: '68px', objectFit: 'cover', border: '1px solid #d1d7dc' }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', fontSize: '15px', lineHeight: '1.4', marginBottom: '4px', color: '#1c1d1f' }}>
                      {course.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {course.instructorName || 'Chưa cập nhật'}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: '16px', color: '#1c1d1f' }}>{formattedPrice}</Text>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0', borderColor: '#d1d7dc' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text style={{ fontSize: '16px', color: '#1c1d1f' }}>Giá gốc:</Text>
                  <Text style={{ fontSize: '16px', color: '#1c1d1f' }}>{formattedPrice}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <Text style={{ fontSize: '16px', color: '#1c1d1f' }}>Giảm giá:</Text>
                  <Text style={{ fontSize: '16px', color: '#1c1d1f' }}>- 0 ₫</Text>
                </div>

                <Divider style={{ margin: '16px 0', borderColor: '#d1d7dc' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <Text strong style={{ fontSize: '18px', color: '#1c1d1f' }}>Tổng cộng:</Text>
                  <Text strong style={{ fontSize: '24px', color: '#1c1d1f' }}>{formattedPrice}</Text>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}>
                    <Text style={{ fontSize: '14px', color: '#1c1d1f' }}>
                      Bằng việc hoàn tất giao dịch mua, bạn đồng ý với <Link to="#" style={{ color: '#5624d0', textDecoration: 'underline' }}>Điều khoản dịch vụ</Link> và <Link to="#" style={{ color: '#5624d0', textDecoration: 'underline' }}>Chính sách bảo mật</Link> của EduFlow.
                    </Text>
                  </Checkbox>
                </div>

                <Button 
                  type="primary" 
                  block 
                  loading={payLoading}
                  onClick={handlePayment}
                  disabled={!agreedToTerms}
                  style={{ 
                    height: '56px', 
                    borderRadius: '0', 
                    fontSize: '16px', 
                    fontWeight: 700,
                    background: agreedToTerms ? '#a435f0' : '#d1d7dc',
                    borderColor: agreedToTerms ? '#a435f0' : '#d1d7dc',
                    color: agreedToTerms ? '#fff' : '#6a6f73',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: agreedToTerms ? 'pointer' : 'not-allowed'
                  }}
                >
                  Hoàn tất thanh toán
                </Button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                    EduFlow cam kết bảo mật mọi thông tin thẻ tín dụng / ghi nợ của bạn bằng công nghệ mã hóa tối tân nhất.
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;
