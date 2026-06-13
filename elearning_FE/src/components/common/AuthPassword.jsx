import React from 'react';
import { Input } from 'antd';

const AuthPassword = React.forwardRef(({ icon, ...props }, ref) => {
  return (
    <Input.Password 
      ref={ref}
      prefix={icon ? React.cloneElement(icon, { style: { color: '#bfbfbf', marginRight: '4px' } }) : null} 
      style={{ 
        borderRadius: '6px', 
        height: '44px',
        fontSize: '14px'
      }} 
      {...props} 
    />
  );
});

export default AuthPassword;
