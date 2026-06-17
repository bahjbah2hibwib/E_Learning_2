import React from "react";
import { Typography } from "antd";
import AuthSplitLayout from "../../components/common/AuthSplitLayout";
import RegisterForm from "../../components/auth/RegisterForm";

const { Title, Text } = Typography;

const RegisterPage = () => {
  return (
    <AuthSplitLayout>
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{ fontWeight: 700, margin: "0 0 8px 0", color: "#1f2937" }}
        >
          Tạo tài khoản
        </Title>
        <Text style={{ color: "#6b7280", fontSize: "15px" }}>
          Bắt đầu hành trình học tập và phát triển của bạn.
        </Text>
      </div>
      <RegisterForm />
    </AuthSplitLayout>
  );
};

export default RegisterPage;
