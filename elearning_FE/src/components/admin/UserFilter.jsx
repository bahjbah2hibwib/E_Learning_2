import React from 'react';
import { Select, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const UserFilter = ({ children }) => {
  return (
    <div style={{ 
      padding: '16px 24px', 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #e2e8f0', 
      display: 'flex', 
      justifyContent: 'flex-end',
      alignItems: 'center' 
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
};

export default UserFilter;
