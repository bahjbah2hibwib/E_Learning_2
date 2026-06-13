import React from 'react';
import { Input } from 'antd';

const AuthInput = React.forwardRef(({ icon, ...props }, ref) => {
  return (
    <Input 
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

export default AuthInput;
