import React from 'react';
import AuthSplitLayout from '../../components/common/AuthSplitLayout';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    // Lắp cái khung chia đôi màn hình
    <AuthSplitLayout>
      {/* Nhét cái form nhập liệu vào chính giữa nửa bên phải */}
      <LoginForm />
    </AuthSplitLayout>
  );
};

export default LoginPage;
