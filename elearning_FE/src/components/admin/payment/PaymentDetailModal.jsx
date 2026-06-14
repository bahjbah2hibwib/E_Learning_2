import React, { useEffect, useState } from 'react';
import { Modal, Tag, Typography, Spin, message, Row, Col, Space, Empty } from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined, 
  UndoOutlined,
  BankOutlined,
  UserOutlined,
  BookOutlined,
  FileImageOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import paymentService from '../../../services/paymentService';

const { Text, Title } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case 'SUCCESS':
      return <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '14px', margin: 0 }}>Thành công</Tag>;
    case 'PENDING':
      return <Tag icon={<SyncOutlined spin />} color="processing" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '14px', margin: 0 }}>Chờ xử lý</Tag>;
    case 'FAILED':
      return <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '14px', margin: 0 }}>Đã hủy</Tag>;
    case 'REFUNDED':
      return <Tag icon={<UndoOutlined />} color="default" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '14px', margin: 0 }}>Hoàn tiền</Tag>;
    default:
      return <Tag color="default" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '14px', margin: 0 }}>{status}</Tag>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('vi-VN');
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${time} - ${date}`;
};

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

  const InfoRow = ({ icon, label, value, isHighlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9' }}>
      <Space style={{ color: '#64748b' }}>
        {icon}
        <Text style={{ color: '#64748b' }}>{label}</Text>
      </Space>
      <div style={{ textAlign: 'right', maxWidth: '60%' }}>
        {isHighlight ? (
           <Text strong style={{ color: '#0ea5e9' }}>{value}</Text>
        ) : (
           <Text strong style={{ color: '#334155', wordBreak: 'break-word' }}>{value}</Text>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      centered
      bodyStyle={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}
      closeIcon={<div style={{ background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>✕</div>}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#64748b' }}>Đang tải dữ liệu...</div>
        </div>
      ) : detail ? (
        <div>
          {/* HEADER BIÊN LAI */}
          <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '40px 32px 32px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <Text style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>Biên lai thanh toán</Text>
            <Title level={1} style={{ margin: '16px 0', color: '#16a34a', fontSize: '36px' }}>
              {detail.transactionInfo?.amount ? detail.transactionInfo.amount.toLocaleString() : 0} <span style={{ fontSize: '24px' }}>VNĐ</span>
            </Title>
            <div>
              {getStatusTag(detail.transactionInfo?.paymentStatus)}
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            <Row gutter={48}>
              {/* CỘT TRÁI: GIAO DỊCH & KHÓA HỌC */}
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '32px' }}>
                  <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '20px' }}>
                    <CreditCardOutlined style={{ color: '#3b82f6' }} /> Chi tiết thanh toán
                  </Title>
                  
                  <InfoRow icon={<BarcodeOutlined />} label="Mã giao dịch" value={detail.transactionInfo?.transactionCode || 'N/A'} />
                  <InfoRow icon={<CreditCardOutlined />} label="Phương thức" value={detail.transactionInfo?.paymentMethod || 'N/A'} />
                  <InfoRow icon={<CalendarOutlined />} label="Ngày thực hiện" value={formatDate(detail.transactionInfo?.createdAt)} />
                  <InfoRow icon={<BankOutlined />} label="Nội dung CK" value={`EDUFLOW ${detail.transactionInfo?.transactionCode || 'PAYMENT'} ${detail.studentInfo?.studentId || '1'}`} isHighlight />
                </div>

                <div>
                  <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '20px' }}>
                    <BookOutlined style={{ color: '#8b5cf6' }} /> Thông tin khóa học
                  </Title>
                  <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                    <Text strong style={{ fontSize: '15px', color: '#5b21b6', display: 'block', marginBottom: '4px' }}>{detail.courseInfo?.title || 'N/A'}</Text>
                    <Text type="secondary" style={{ color: '#7c3aed' }}>Mã khóa học: #{detail.courseInfo?.courseId || 'N/A'}</Text>
                  </div>
                </div>
              </Col>

              {/* CỘT PHẢI: HỌC VIÊN & NGÂN HÀNG & BILL */}
              <Col xs={24} md={12}>
                <div style={{ marginBottom: '32px' }}>
                  <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '20px' }}>
                    <UserOutlined style={{ color: '#f59e0b' }} /> Thông tin khách hàng
                  </Title>
                  
                  <InfoRow icon={<UserOutlined />} label="Họ và tên" value={detail.studentInfo?.fullName || 'N/A'} />
                  <InfoRow icon={<BarcodeOutlined />} label="Mã học viên" value={`#${detail.studentInfo?.studentId || 'N/A'}`} />
                  <InfoRow icon={<Text style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>@</Text>} label="Email" value={detail.studentInfo?.email || 'N/A'} />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '20px' }}>
                    <BankOutlined style={{ color: '#10b981' }} /> Tài khoản thụ hưởng
                  </Title>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Text strong style={{ fontSize: '15px', color: '#1e293b', display: 'block', marginBottom: '8px' }}>Vietcombank</Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text type="secondary">Số tài khoản:</Text>
                      <Text strong copyable style={{ color: '#0ea5e9', fontSize: '15px', fontWeight: 500 }}>1903829128312</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Chủ tài khoản:</Text>
                      <Text strong>CONG TY GIAO DUC EDUFLOW</Text>
                    </div>
                  </div>
                </div>

                <div>
                  <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '16px' }}>
                    <FileImageOutlined style={{ color: '#ec4899' }} /> Ảnh hóa đơn (Bill)
                  </Title>
                  
                  <div style={{
                    width: '100%', 
                    height: '200px', 
                    backgroundColor: '#f8fafc', 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: detail.transactionInfo?.billImageUrl ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                    overflow: 'hidden'
                  }}
                  onMouseOver={e => { if (detail.transactionInfo?.billImageUrl) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; } }}
                  onMouseOut={e => { if (detail.transactionInfo?.billImageUrl) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; } }}
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
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <FileImageOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                        <div style={{ fontSize: '14px' }}>Không có ảnh đính kèm</div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty description="Không tìm thấy dữ liệu giao dịch" />
        </div>
      )}
    </Modal>
  );
};

export default PaymentDetailModal;
