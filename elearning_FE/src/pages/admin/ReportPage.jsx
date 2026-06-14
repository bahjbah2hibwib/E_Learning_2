import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Row, Col, Card, Typography, Tag, Table, Spin, Button, Space, DatePicker, Input, Select } from 'antd';
import { 
  TeamOutlined, 
  DownloadOutlined,
  DollarCircleOutlined,
  BookOutlined,
  SearchOutlined,
  TrophyOutlined,
  FilterOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { 
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import paymentService from '../../services/paymentService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#6366f1'];
const DONUT_COLORS = ['#10b981', '#f59e0b', '#64748b', '#ef4444'];

const StatCard = ({ icon, iconBg, iconColor, title, value, tagText, tagColor, tagBg }) => (
  <Card bordered style={{ borderRadius: '16px', borderColor: '#e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: iconBg, color: iconColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
        {icon}
      </div>
      <div style={{ backgroundColor: tagBg, color: tagColor, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
        {tagText}
      </div>
    </div>
    <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>{title}</Text>
    <Title level={2} style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{value}</Title>
  </Card>
);

const ReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Dữ liệu State từ API (Tổng quan)
  const [userTotal, setUserTotal] = useState(0);
  const [courseTotal, setCourseTotal] = useState(0);
  const [revenueTotal, setRevenueTotal] = useState(0);
  
  // Dữ liệu biểu đồ
  const [revenueData, setRevenueData] = useState([]);
  
  // Dữ liệu Table Giao dịch
  const [payments, setPayments] = useState([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');

  // Dữ liệu giả lập cho biểu đồ tròn (Khóa học)
  const courseStatusData = [
    { name: 'Đã xuất bản', value: 45, color: '#10b981' },
    { name: 'Đang soạn thảo', value: 25, color: '#f59e0b' },
    { name: 'Đang tạm dừng', value: 20, color: '#64748b' },
    { name: 'Lỗi đồng bộ', value: 10, color: '#ef4444' }
  ];

  const handleExportOverviewCSV = () => {
    const BOM = "\uFEFF";
    const csvContent = "Loại thống kê,Giá trị\n" +
      `Tổng người dùng,${userTotal}\n` +
      `Tổng khóa học,${courseTotal}\n` +
      `Tổng doanh thu,${revenueTotal}đ\n`;
    
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_Cao_Tong_Quan_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTableCSV = () => {
    const BOM = "\uFEFF";
    let csvContent = "Mã GD,Học viên,Khóa học,Số tiền,Ngày GD,Trạng thái\n";
    payments.forEach(p => {
      csvContent += `${p.transactionCode || 'N/A'},${p.studentName},${p.courseTitle},${p.amount},${p.transactionDate},${p.paymentStatus}\n`;
    });
    
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Lich_Su_Giao_Dich_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Fetch dữ liệu tổng quan
  useEffect(() => {
    const fetchDashboardStats = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const [userStatsRes, coursesRes, paymentStatsRes, allPaymentsRes] = await Promise.all([
          userService.getUserStats(),
          courseService.getAllAdminCourses({ page: 0, size: 1 }), 
          paymentService.getPaymentStats(),
          paymentService.getAllPayments(0, 1000, {}) 
        ]);

        if (userStatsRes?.success) setUserTotal(userStatsRes.data?.total || 0);
        if (coursesRes?.success) setCourseTotal(coursesRes.data?.totalElements || 0);
        if (paymentStatsRes?.success) setRevenueTotal(paymentStatsRes.data?.totalRevenue || 0);

        const allPayments = allPaymentsRes?.data?.content || [];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = Array(12).fill(0);
        
        allPayments.forEach(p => {
          if (p.paymentStatus === 'SUCCESS' && p.transactionDate) {
            const date = new Date(p.transactionDate);
            if (date.getFullYear() === currentYear) {
              monthlyRevenue[date.getMonth()] += p.amount || 0;
            }
          }
        });

        const currentMonth = new Date().getMonth();
        const revData = monthlyRevenue.slice(0, currentMonth + 1).map((val, index) => ({
          name: `T${index + 1}`,
          revenue: val
        }));
        setRevenueData(revData);

      } catch (error) {
        console.error('Lỗi khi tải báo cáo tổng quan:', error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Polling ngầm mỗi 5 giây
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch dữ liệu bảng (khi phân trang, tìm kiếm, lọc thay đổi)
  const fetchPayments = async (isPolling = false) => {
    try {
      if (!isPolling) setTableLoading(true);
      const res = await paymentService.getAllPayments(paymentPage - 1, paymentPageSize, {
        keyword: paymentSearch,
        status: paymentStatusFilter === 'ALL' ? '' : paymentStatusFilter
      });
      if (res?.success) {
        setPayments(res.data.content || []);
        setPaymentTotal(res.data.totalElements || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!isPolling) setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Polling ngầm mỗi 5 giây cho bảng
    const interval = setInterval(() => {
      fetchPayments(true);
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPage, paymentPageSize, paymentStatusFilter]);

  const paymentColumns = [
    {
      title: 'Mã GD',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: text => <Text strong style={{ color: '#3b82f6' }}>{text || 'Đang cấp'}</Text>
    },
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
      render: text => <Text strong>{text || 'Chưa cập nhật'}</Text>
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      ellipsis: true
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: val => <Text strong style={{ color: '#10b981' }}>{val ? val.toLocaleString() + 'đ' : '0đ'}</Text>
    },
    {
      title: 'Ngày GD',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: date => date ? new Date(date).toLocaleString('vi-VN') : '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: status => {
        const colors = { 'SUCCESS': 'success', 'PENDING': 'processing', 'FAILED': 'error', 'REFUNDED': 'default' };
        return <Tag color={colors[status] || 'default'} style={{ borderRadius: '12px', padding: '2px 10px' }}>{status}</Tag>;
      }
    }
  ];

  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

  return (
    <AdminLayout>
      <div style={{ padding: '0 8px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header (Bộ lọc thời gian nâng cao) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 800 }}>Dashboard Doanh Nghiệp</Title>
            <Text style={{ color: '#64748b' }}>Hệ thống quản trị tài chính & hoạt động</Text>
          </div>
          <Space size="middle" style={{ flexWrap: 'wrap' }}>
            <RangePicker size="large" style={{ borderRadius: '8px' }} />
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              size="large"
              style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              onClick={handleExportOverviewCSV}
            >
              Xuất Báo Cáo
            </Button>
          </Space>
        </div>

        {loading ? (
          <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" tip="Đang phân tích dữ liệu chuyên sâu..." />
          </div>
        ) : (
          <>
            {/* Top Cards */}
            <Row gutter={[32, 32]} style={{ marginBottom: '32px' }}>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<TeamOutlined />} iconBg="#eff6ff" iconColor="#3b82f6"
                  title="Tổng người dùng" value={userTotal.toLocaleString()}
                  tagText="Thời gian thực" tagBg="#eff6ff" tagColor="#3b82f6"
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<BookOutlined />} iconBg="#f3e8ff" iconColor="#8b5cf6"
                  title="Tổng khóa học" value={courseTotal.toLocaleString()}
                  tagText="Thời gian thực" tagBg="#f3e8ff" tagColor="#8b5cf6"
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard 
                  icon={<DollarCircleOutlined />} iconBg="#d1fae5" iconColor="#10b981"
                  title="Tổng doanh thu" value={revenueTotal.toLocaleString() + 'đ'}
                  tagText="Thời gian thực" tagBg="#d1fae5" tagColor="#10b981"
                />
              </Col>
            </Row>

            {/* Advanced Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              {/* Area Chart: Revenue */}
              <Col xs={24} lg={16}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: '100%' }}
                  bodyStyle={{ padding: '16px' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <div style={{ padding: '6px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
                        <TrophyOutlined style={{ fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Tăng trưởng doanh thu</span>
                    </div>
                  }
                >
                  <div style={{ height: '280px', marginTop: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} tickFormatter={formatCurrency} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" label={{ position: 'top', fill: '#1e293b', fontSize: 11, fontWeight: 600, formatter: (val) => val > 0 ? formatCurrency(val) : '' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* Donut Chart: Course Status */}
              <Col xs={24} lg={8}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: '100%' }}
                  bodyStyle={{ padding: '16px' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <div style={{ padding: '6px', background: '#fef3c7', borderRadius: '12px', color: '#d97706' }}>
                        <PieChartOutlined style={{ fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Trạng thái khóa học</span>
                    </div>
                  }
                >
                  <div style={{ height: '280px', marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={courseStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                          label={{ fill: '#1e293b', fontSize: 12, fontWeight: 600, formatter: (val) => val > 0 ? val : '' }}
                        >
                          {courseStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                      {courseStatusData.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Data Table Enterprise */}
            <Card 
              bordered={false} 
              style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}
              bodyStyle={{ padding: '16px' }}
            >
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Title level={4} style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>Bảng Giao Dịch Chuyên Sâu</Title>
                  <Tag color="blue" style={{ borderRadius: '12px' }}>Real-time</Tag>
                </div>
                
                <Space size="middle" style={{ flexWrap: 'wrap' }}>
                  <Input 
                    placeholder="Tìm mã GD, học viên..." 
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                    size="large" 
                    style={{ width: '250px', borderRadius: '8px' }}
                    value={paymentSearch}
                    onChange={e => setPaymentSearch(e.target.value)}
                    onPressEnter={fetchPayments}
                  />
                  <Select 
                    size="large" 
                    value={paymentStatusFilter} 
                    style={{ width: '180px' }}
                    onChange={val => setPaymentStatusFilter(val)}
                  >
                    <Option value="ALL"><FilterOutlined /> Tất cả trạng thái</Option>
                    <Option value="SUCCESS">Thành công</Option>
                    <Option value="PENDING">Đang chờ xử lý</Option>
                    <Option value="FAILED">Thất bại</Option>
                    <Option value="REFUNDED">Hoàn tiền</Option>
                  </Select>
                  <Button size="large" type="primary" onClick={fetchPayments} style={{ borderRadius: '8px', background: '#3b82f6' }}>Tìm kiếm</Button>
                  <Button size="large" icon={<DownloadOutlined />} onClick={handleExportTableCSV} style={{ borderRadius: '8px' }}>
                    Xuất CSV
                  </Button>
                </Space>
              </div>
              
              {/* Table */}
              <Table 
                columns={paymentColumns} 
                dataSource={payments} 
                rowKey="paymentId"
                loading={tableLoading}
                pagination={{
                  current: paymentPage,
                  pageSize: paymentPageSize,
                  total: paymentTotal,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng cộng ${total} bản ghi`,
                  pageSizeOptions: ['10', '20', '50'],
                  onChange: (page, size) => {
                    setPaymentPage(page);
                    setPaymentPageSize(size);
                  }
                }}
              />
            </Card>

          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportPage;
