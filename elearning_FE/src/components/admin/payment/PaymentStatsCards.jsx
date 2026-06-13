import React from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentStatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>TỔNG DOANH THU</Text>
              <Statistic 
                value={stats.totalRevenue} 
                suffix="đ" 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }} 
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Đã ghi nhận
              </Text>
            </div>
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
              <DollarOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>GIAO DỊCH THÀNH CÔNG</Text>
              <Statistic 
                value={stats.successCount} 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }} 
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Trong tháng này
              </Text>
            </div>
            <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '12px', color: '#16a34a' }}>
              <CheckCircleOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>CHỜ XỬ LÝ</Text>
              <Statistic 
                value={stats.pendingCount} 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }} 
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Cần rà soát
              </Text>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#d97706' }}>
              <ClockCircleOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>HOÀN TIỀN</Text>
              <Statistic 
                value={stats.refundedCount} 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }} 
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Đã xử lý
              </Text>
            </div>
            <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px', color: '#dc2626' }}>
              <SyncOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentStatsCards;
