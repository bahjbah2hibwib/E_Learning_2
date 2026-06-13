import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ApprovalActionModal = ({ 
  visible, 
  actionType, 
  loading, 
  onConfirm, 
  onCancel, 
  courseTitle 
}) => {
  
  const isApprove = actionType === 'APPROVED';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isApprove ? '#16a34a' : '#dc2626' }}>
          <ExclamationCircleOutlined />
          <span>Xác nhận {isApprove ? 'Phê duyệt' : 'Từ chối / Ẩn'}</span>
        </div>
      }
      open={visible}
      onOk={onConfirm}
      confirmLoading={loading}
      onCancel={onCancel}
      okText={isApprove ? 'Đồng ý phê duyệt' : 'Xác nhận từ chối'}
      cancelText="Hủy bỏ"
      okButtonProps={{ danger: !isApprove, style: isApprove ? { backgroundColor: '#16a34a' } : {} }}
    >
      <div style={{ marginTop: '16px' }}>
        Bạn có chắc chắn muốn {isApprove ? <strong style={{ color: '#16a34a' }}>phê duyệt</strong> : <strong style={{ color: '#dc2626' }}>từ chối / ẩn</strong>} khóa học này không?
        <br />
        <br />
        Khóa học: <Text strong>{courseTitle}</Text>
        <br />
        <br />
        {isApprove ? (
          <Text type="secondary">Khóa học sẽ được hiển thị công khai trên hệ thống và người dùng có thể mua.</Text>
        ) : (
          <Text type="secondary">Khóa học sẽ bị ẩn khỏi hệ thống và không ai có thể mua được.</Text>
        )}
      </div>
    </Modal>
  );
};

export default ApprovalActionModal;
