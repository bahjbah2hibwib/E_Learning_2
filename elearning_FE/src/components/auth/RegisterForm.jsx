import React, { useState } from 'react';
import { Form, Alert, Typography, message, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import AuthInput from '../common/AuthInput';
import AuthPassword from '../common/AuthPassword';
import AuthButton from '../common/AuthButton';

const { Text } = Typography;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null 
      };

      const response = await authService.register(data);
      message.success(response.message || 'Đăng ký tài khoản thành công!');
      
    } catch (error) {
      if (error.errorCode === 'VALIDATION_FAILED' && error.errors) {
        const msgs = Object.values(error.errors).join(' | ');
        setErrorMsg(msgs);
      } else {
        setErrorMsg(error.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: '24px' }} />}
      
      <Form 
        name="register" 
        onFinish={onFinish} 
        layout="vertical" 
        requiredMark={false} // Bỏ dấu * đỏ mặc định để giống thiết kế xịn
      >
        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Họ và tên</Text>} 
          name="fullName" 
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthInput */}
          <AuthInput icon={<UserOutlined />} placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Địa chỉ Email</Text>} 
          name="email" 
          rules={[
            { required: true, message: 'Vui lòng nhập email!' }, 
            { type: 'email', message: 'Email không đúng định dạng!' }
          ]}
        >
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthInput */}
          <AuthInput icon={<MailOutlined />} placeholder="email@domain.com" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Mật khẩu</Text>} 
          name="password" 
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' }, 
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' }
          ]} 
          help={<Text style={{ fontSize: '12px', color: '#9ca3af' }}>Mật khẩu phải có ít nhất 8 ký tự.</Text>}
        >
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthPassword */}
          <AuthPassword icon={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Xác nhận mật khẩu</Text>} 
          name="confirmPassword" 
          dependencies={['password']} 
          rules={[
            { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthPassword */}
          <AuthPassword icon={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Số điện thoại</Text>} 
          name="phone" 
          rules={[{ pattern: /^(0|\+84)[35789]\d{8}$/, message: 'Số điện thoại không hợp lệ!' }]}
        >
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthInput */}
          <AuthInput icon={<PhoneOutlined />} placeholder="Nhập số điện thoại (Tùy chọn)" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Ngày sinh</Text>} 
          name="dateOfBirth" 
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
        >
          <DatePicker 
            placeholder="Chọn ngày sinh" 
            format="DD/MM/YYYY"
            suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
            style={{ 
              width: '100%', 
              borderRadius: '6px', 
              height: '44px',
              fontSize: '14px'
            }} 
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', marginBottom: '24px' }}>
          {/* LẮP GHÉP: Sử dụng mảnh Lego AuthButton */}
          <AuthButton htmlType="submit" loading={loading}>
            Đăng ký tài khoản { !loading && <ArrowRightOutlined style={{ marginLeft: '4px' }} /> }
          </AuthButton>
        </Form.Item>

        <div style={{ textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px' }}>Đã có tài khoản? </Text>
          <Link to="/login" style={{ fontWeight: 600, color: '#0056d2', fontSize: '14px' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Form>
    </>
  );
};

export default RegisterForm;
