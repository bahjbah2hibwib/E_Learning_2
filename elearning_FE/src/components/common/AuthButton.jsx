import React from 'react';
import { Button } from 'antd';

const AuthButton = ({ children, icon, ...props }) => {
  return (
    <Button 
      type="primary" 
      block 
      icon={icon}
      style={{ 
        height: '44px', 
        borderRadius: '6px', 
        fontWeight: 600, 
        backgroundColor: '#0056d2', 
        boxShadow: 'none',
        ...props.style 
      }} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default AuthButton;
