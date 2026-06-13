import React, { useEffect, useState } from 'react';
import { Modal, Tag, Typography, Spin, message } from 'antd';
import paymentService from '../../../services/paymentService';

const { Text, Title } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case 'SUCCESS':
      return <Tag color="success" style={{ borderRadius: '12px', padding: '2px 10px' }}>Thành công</Tag>;
    case 'PENDING':
      return <Tag color="warning" style={{ borderRadius: '12px', padding: '2px 10px' }}>Chờ xử lý</Tag>;
    case 'FAILED':
      return <Tag color="error" style={{ borderRadius: '12px', padding: '2px 10px' }}>Đã hủy</Tag>;
    case 'REFUNDED':
      return <Tag color="default" style={{ borderRadius: '12px', padding: '2px 10px' }}>Hoàn tiền</Tag>;
    default:
      return <Tag color="default" style={{ borderRadius: '12px', padding: '2px 10px' }}>{status}</Tag>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-GB');
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${time} - ${date}`;
};

// --- CÁC THÀNH PHẦN NGUYÊN TỬ (ATOMIC COMPONENTS) ---

const DetailCell = ({ label, value, isFullWidth, hideRightBorder }) => (
  <div style={{ 
    display: 'flex', 
    flex: isFullWidth ? '1 1 100%' : '1 1 50%',
    width: isFullWidth ? '100%' : '50%',
    borderRight: hideRightBorder || isFullWidth ? 'none' : '1px solid #f0f0f0'
  }}>
    <div style={{ 
      width: '150px', 
      minWidth: '150px',
      backgroundColor: '#f8fafc', 
      padding: '12px 16px',
      fontWeight: 500,
      color: '#1e293b',
      borderRight: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center'
    }}>
      {label}
    </div>
    <div style={{ 
      flex: 1, 
      backgroundColor: '#fff', 
      padding: '12px 16px',
      color: '#334155',
      display: 'flex',
      alignItems: 'center',
      wordBreak: 'break-word'
    }}>
      {value}
    </div>
  </div>
);

const DetailRow = ({ children, isLast }) => {
  const childrenArray = React.Children.toArray(children);
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%',
      borderBottom: isLast ? 'none' : '1px solid #f0f0f0'
    }}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          hideRightBorder: index === childrenArray.length - 1
        });
      })}
    </div>
  );
};

const DetailTable = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <Title level={5} style={{ color: '#1e293b', marginBottom: 16 }}>{title}</Title>
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {children}
    </div>
  </div>
);

// ----------------------------------------------------

const PaymentDetailModal = ({ visible, paymentId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (visible && paymentId) {
      fetchDetail(paymentId);
    } else {
      setDetail(null);
    }
  }, [visible, paymentId]);

  const fetchDetail = async (id) => {
    try {
      setLoading(true);
      const res = await paymentService.getPaymentDetail(id);
      if (res.success && res.data) {
        setDetail(res.data);
      }
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải chi tiết giao dịch');
      onClose(); // close if error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết giao dịch</Title>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={550}
      bodyStyle={{ padding: '24px 0 0' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : detail ? (
        <div>
          <DetailTable title="Thông tin giao dịch">
            <DetailRow>
              <DetailCell 
                label="Mã giao dịch" 
                value={<Text strong>{detail.transactionInfo?.transactionCode || 'N/A'}</Text>} 
                isFullWidth 
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Số tiền" 
                value={
                  <Text strong style={{ color: '#16a34a' }}>
                    {detail.transactionInfo?.amount ? detail.transactionInfo.amount.toLocaleString() : 0} VNĐ
                  </Text>
                }
                isFullWidth 
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Phương thức" 
                value={detail.transactionInfo?.paymentMethod || 'N/A'} 
                isFullWidth
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Trạng thái" 
                value={getStatusTag(detail.transactionInfo?.paymentStatus)} 
                isFullWidth
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Ngày tạo" 
                value={formatDate(detail.transactionInfo?.createdAt)} 
                isFullWidth
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Tài khoản nhận" 
                value={
                  <div>
                    <Text strong>Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)</Text><br/>
                    <Text>Số TK: <Text copyable style={{ color: '#0ea5e9', fontWeight: 500 }}>1903829128312</Text></Text><br/>
                    <Text>Tên: CONG TY GIAO DUC EDUFLOW</Text>
                  </div>
                } 
                isFullWidth
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Nội dung CK" 
                value={<Text copyable style={{ color: '#0ea5e9' }}>EDUFLOW {detail.transactionInfo?.transactionCode || 'PAYMENT'} {detail.studentInfo?.studentId || '1'}</Text>} 
                isFullWidth
              />
            </DetailRow>
            <DetailRow isLast>
              <DetailCell 
                label="Ảnh hóa đơn (Bill)" 
                value={
                  <div style={{ padding: '8px 0' }}>
                    <div style={{
                      width: '120px', 
                      height: '160px', 
                      backgroundColor: '#f1f5f9', 
                      border: '1px dashed #cbd5e1', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: detail.transactionInfo?.billImageUrl ? 'pointer' : 'default',
                      transition: 'border-color 0.3s',
                      overflow: 'hidden'
                    }}
                    onMouseOver={e => { if (detail.transactionInfo?.billImageUrl) e.currentTarget.style.borderColor = '#3b82f6'; }}
                    onMouseOut={e => { if (detail.transactionInfo?.billImageUrl) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onClick={() => {
                        if (detail.transactionInfo?.billImageUrl) {
                            window.open(detail.transactionInfo.billImageUrl, '_blank');
                        }
                    }}
                    >
                      {detail.transactionInfo?.billImageUrl ? (
                        <img 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Bill+Image'; }}
                          src={detail.transactionInfo.billImageUrl} 
                          alt="Bill" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', margin: '0 auto 8px' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <div style={{ fontSize: '12px' }}>Không có ảnh</div>
                        </div>
                      )}
                    </div>
                  </div>
                } 
                isFullWidth
              />
            </DetailRow>
          </DetailTable>

          <DetailTable title="Thông tin học viên">
            <DetailRow>
              <DetailCell 
                label="Họ và tên" 
                value={detail.studentInfo?.fullName || 'N/A'} 
                isFullWidth 
              />
            </DetailRow>
            <DetailRow>
              <DetailCell 
                label="Mã học viên" 
                value={detail.studentInfo?.studentId || 'N/A'} 
                isFullWidth
              />
            </DetailRow>
            <DetailRow isLast>
              <DetailCell 
                label="Email" 
                value={detail.studentInfo?.email || 'N/A'} 
                isFullWidth
              />
            </DetailRow>
          </DetailTable>

          <DetailTable title="Thông tin khóa học">
            <DetailRow>
              <DetailCell 
                label="Tên khóa học" 
                value={<Text strong>{detail.courseInfo?.title || 'N/A'}</Text>} 
                isFullWidth 
              />
            </DetailRow>
            <DetailRow isLast>
              <DetailCell 
                label="Mã khóa học" 
                value={detail.courseInfo?.courseId || 'N/A'} 
                isFullWidth 
              />
            </DetailRow>
          </DetailTable>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Không có dữ liệu</Text>
        </div>
      )}
    </Modal>
  );
};

export default PaymentDetailModal;
