import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1c1d1f', color: '#fff', padding: '32px 48px 48px 48px', marginTop: '48px' }}>
      <Row gutter={[32, 32]} style={{ maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid #3e4143', paddingBottom: '32px' }}>
        <Col xs={24} md={6}>
          <Space direction="vertical" size={8}>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>EduFlow Business</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Giảng dạy trên EduFlow</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Tải ứng dụng</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Về chúng tôi</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Liên hệ với chúng tôi</Link>
          </Space>
        </Col>
        <Col xs={24} md={6}>
          <Space direction="vertical" size={8}>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Nghề nghiệp</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Blog</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Trợ giúp và Hỗ trợ</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Tiếp thị liên kết</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Nhà đầu tư</Link>
          </Space>
        </Col>
        <Col xs={24} md={6}>
          <Space direction="vertical" size={8}>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Điều khoản</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Chính sách bảo mật</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Cài đặt cookie</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Sơ đồ trang web</Link>
            <Link href="#" style={{ color: '#fff', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c0c4fc'} onMouseLeave={(e) => e.target.style.color = '#fff'}>Tuyên bố về khả năng tiếp cận</Link>
          </Space>
        </Col>
        <Col xs={24} md={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid #fff', padding: '8px 16px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <GlobalOutlined style={{ fontSize: '16px' }} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Tiếng Việt</span>
          </div>
        </Col>
      </Row>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '32px' }}>
        <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
          EduFlow.
        </Title>
        <Text style={{ color: '#fff', fontSize: '12px' }}>© {new Date().getFullYear()} EduFlow, Inc.</Text>
      </div>
    </footer>
  );
};

export default Footer;
