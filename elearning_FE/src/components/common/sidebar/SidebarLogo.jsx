import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const SidebarLogo = ({ title = "EduFlow", subtitle = "Bảng quản trị" }) => {
  return (
    <div style={{ padding: '24px', marginBottom: '16px' }}>
      <Title level={3} style={{ color: '#1e3a8a', margin: 0, fontWeight: 700 }}>
        {title}
      </Title>
      <Text style={{ color: '#64748b', fontSize: '13px' }}>
        {subtitle}
      </Text>
    </div>
  );
};

export default SidebarLogo;
