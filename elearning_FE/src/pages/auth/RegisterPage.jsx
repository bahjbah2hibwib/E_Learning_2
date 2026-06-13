import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import AuthCard from '../../components/common/AuthCard';

const RegisterPage = () => {
  return (
    // LẮP GHÉP: Sử dụng cái Khung AuthCard bên ngoài
    // Truyền tựa đề và mô tả vào như thiết kế cậu gửi
    <AuthCard 
      title="Tạo tài khoản EduFlow" 
      subtitle="Bắt đầu hành trình học tập và phát triển của bạn."
    >
      {/* LẮP GHÉP: Đút cái RegisterForm (các ô input) vào giữa cái khung */}
      <RegisterForm />
    </AuthCard>
  );
};

export default RegisterPage;
