import React from 'react';

const SidebarItem = ({ icon, label, isActive, onClick, isDanger }) => {
  // Xác định màu sắc dựa trên trạng thái (Active / Danger / Normal)
  const baseColor = isDanger ? '#ef4444' : (isActive ? '#2563eb' : '#475569');
  const bgColor = isActive ? '#e0e7ff' : 'transparent'; // Màu nền xanh nhạt khi active
  const hoverBg = isDanger ? '#fee2e2' : (isActive ? '#e0e7ff' : '#f1f5f9');
  const borderLeft = isActive ? '3px solid #2563eb' : '3px solid transparent';

  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        cursor: 'pointer',
        backgroundColor: bgColor,
        color: baseColor,
        borderLeft: borderLeft,
        transition: 'all 0.2s ease',
        fontWeight: isActive ? 600 : 500,
        fontSize: '14px',
      }}
      // Hiệu ứng Hover đơn giản bằng sự kiện onMouseEnter
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ marginRight: '16px', fontSize: '18px', display: 'flex' }}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
};

export default SidebarItem;
