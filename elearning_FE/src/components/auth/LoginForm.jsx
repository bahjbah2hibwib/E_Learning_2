import React, { useState } from 'react';
import { Form, Alert, Typography, Checkbox, message } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import webSocketService from '../../services/webSocketService';
import AuthInput from '../common/AuthInput';
import AuthPassword from '../common/AuthPassword';
import AuthButton from '../common/AuthButton';

const { Title, Text } = Typography;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password
      });
      
      message.success(response.message || 'Đăng nhập thành công!');
      
      // 1. Lưu JWT vào LocalStorage
      if (response.data && response.data.accessToken) {
         localStorage.setItem('accessToken', response.data.accessToken);
         if (response.data.user) {
             localStorage.setItem('userRole', response.data.user.role || '');
             localStorage.setItem('userName', response.data.user.fullName || response.data.user.username || response.data.user.email || 'Tài khoản');
             localStorage.setItem('user', JSON.stringify(response.data.user)); // Store full user object
         }
         webSocketService.connect(response.data.accessToken);
         // TODO: Cập nhật AuthContext (setUser) ở đây khi có Context
      }

      // 2. Điều hướng dựa trên Role (như trong login.md)
      const role = response.data?.user?.role;
      if (role === 'ROLE_ADMIN' || role === 'ROLE_SUPER_ADMIN') {
         navigate('/admin/dashboard');
      } else if (role === 'ROLE_INSTRUCTOR') {
         navigate('/lecturer/dashboard');
      } else {
         navigate('/user/dashboard'); // ROLE_STUDENT
      }
      
    } catch (error) {
      // Nhận lỗi từ Backend và hiển thị
      setErrorMsg(error.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tiêu đề Form */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Đăng nhập</Title>
        <Text style={{ color: '#6b7280', fontSize: '15px' }}>
          Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
        </Text>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: '24px' }} />}

      {/* Khung Form */}
      <Form 
        name="login" 
        onFinish={onFinish} 
        layout="vertical" 
        requiredMark={false} // Tắt dấu sao đỏ
        initialValues={{ remember: false }}
      >
        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Địa chỉ Email</Text>} 
          name="email" 
          rules={[
            { required: true, message: 'Vui lòng nhập email!' }, 
            { type: 'email', message: 'Email không đúng định dạng!' }
          ]}
        >
          {/* Tái sử dụng mảnh Lego AuthInput */}
          <AuthInput icon={<MailOutlined />} placeholder="name@example.com" />
        </Form.Item>

        <Form.Item 
          label={<Text style={{ color: '#4b5563', fontSize: '13px', fontWeight: 600 }}>Mật khẩu</Text>} 
          name="password" 
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          {/* Tái sử dụng mảnh Lego AuthPassword */}
          <AuthPassword icon={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>

        {/* Hàng chứa Checkbox và Quên mật khẩu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: '#4b5563' }}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: '#0056d2', fontWeight: 600, fontSize: '14px' }}>
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút bấm Submit */}
        <Form.Item style={{ marginBottom: '24px' }}>
          {/* Tái sử dụng mảnh Lego AuthButton */}
          <AuthButton htmlType="submit" loading={loading}>
             { !loading && <LoginOutlined style={{ marginRight: '8px' }} /> } Đăng nhập
          </AuthButton>
        </Form.Item>

        {/* Điều hướng Đăng ký */}
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px' }}>Chưa có tài khoản? </Text>
          <Link to="/register" style={{ fontWeight: 600, color: '#0056d2', fontSize: '14px' }}>
            Đăng ký ngay
          </Link>
        </div>
      </Form>
    </>
  );
};

export default LoginForm;
