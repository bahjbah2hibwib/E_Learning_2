import React from 'react';
import { Tabs, Table, Typography, Tag, Empty } from 'antd';

const { Text } = Typography;

const UserActivityTabs = ({ userData, activeTab, onTabChange, tabData, tabLoading }) => {
  
  // Columns cho bảng Khóa học
  const courseColumns = [
    {
      title: 'TÊN KHÓA HỌC',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text) => <Text style={{ fontWeight: 500, color: '#1e293b' }}>{text}</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>
          {status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học'}
        </Tag>
      ),
    },
    {
      title: 'NGÀY ĐĂNG KÝ',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      render: (date) => {
        if (!date) return <Text>-</Text>;
        const d = new Date(date);
        return <Text style={{ color: '#475569' }}>{d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</Text>;
      },
    },
  ];

  // Columns cho bảng Thanh toán
  const paymentColumns = [
    {
      title: 'MÃ GIAO DỊCH',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <Text style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>{text || '-'}</Text>,
    },
    {
      title: 'SỐ TIỀN',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text style={{ fontWeight: 600 }}>{amount ? amount.toLocaleString() + ' VNĐ' : '0 VNĐ'}</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'SUCCESS' ? 'success' : 'error'}>
          {status === 'SUCCESS' ? 'Thành công' : (status === 'FAILED' ? 'Thất bại' : status)}
        </Tag>
      ),
    },
    {
      title: 'NGÀY GIAO DỊCH',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => {
        if (!date) return <Text>-</Text>;
        const d = new Date(date);
        return <Text style={{ color: '#475569' }}>{d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</Text>;
      },
    },
  ];

  const renderContent = () => {
    const emptyDescription = (
      <span style={{ color: '#94a3b8' }}>
        Đang chờ API {activeTab === 'courses' ? 'danh sách khóa học' : 'lịch sử giao dịch'} từ Backend...
      </span>
    );

    return (
      <Table 
        columns={activeTab === 'courses' ? courseColumns : paymentColumns} 
        dataSource={tabData} 
        loading={tabLoading}
        rowKey={activeTab === 'courses' ? 'courseId' : 'paymentId'}
        pagination={{ pageSize: 5 }}
        locale={{ 
          emptyText: (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          ) 
        }}
        style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}
      />
    );
  };

  const items = [
    {
      key: 'courses',
      label: userData?.role === 'ROLE_INSTRUCTOR' ? 'Khóa học đang dạy' : 'Khóa học đã đăng ký',
      children: renderContent(),
    },
    {
      key: 'payments',
      label: 'Lịch sử giao dịch',
      children: renderContent(),
    },
  ];

  return (
    <div style={{ backgroundColor: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', height: '100%' }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={onTabChange} 
        items={items} 
        size="large"
        tabBarStyle={{ marginBottom: '24px' }}
      />
    </div>
  );
};

export default UserActivityTabs;
