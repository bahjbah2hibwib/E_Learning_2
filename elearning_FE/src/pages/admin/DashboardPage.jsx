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
  PieChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { 
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar
} from 'recharts';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import paymentService from '../../services/paymentService';
import webSocketService from '../../services/webSocketService';

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

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Dữ liệu State từ API (Tổng quan)
  const [userTotal, setUserTotal] = useState(0);
  const [courseTotal, setCourseTotal] = useState(0);
  const [revenueTotal, setRevenueTotal] = useState(0);
  
  // Dữ liệu biểu đồ
  const [revenueData, setRevenueData] = useState([]);
  const [studentGrowthData, setStudentGrowthData] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [courseStatusData, setCourseStatusData] = useState([]);
  const [dailyStatsData, setDailyStatsData] = useState([]);
  
  // Dữ liệu Table Giao dịch
  const [payments, setPayments] = useState([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');



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
      csvContent += `${p.transactionCode || 'N/A'},${p.studentName},${p.courseTitle},${p.amount},${formatDateTime(p.transactionDate)},${p.paymentStatus}\n`;
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
        const [userStatsRes, coursesRes, paymentStatsRes, allPaymentsRes, allUsersRes] = await Promise.all([
          userService.getUserStats(),
          courseService.getAllAdminCourses({ page: 0, size: 100 }), 
          paymentService.getPaymentStats(),
          paymentService.getAllPayments(0, 1000, {}),
          userService.getAllUsers({ page: 0, size: 1000 })
        ]);

        const parseDateVal = (dateVal) => {
          if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
          }
          return new Date(dateVal);
        };

        if (userStatsRes?.success) setUserTotal(userStatsRes.data?.total || 0);
        
        if (allUsersRes?.success) {
          const roleCount = {};
          const currentYear = new Date().getFullYear();
          const monthlyStudents = Array(12).fill(0);

          (allUsersRes.data?.content || []).forEach(u => {
            roleCount[u.role] = (roleCount[u.role] || 0) + 1;
            
            if (u.role === 'ROLE_STUDENT' && u.createdAt) {
              const d = parseDateVal(u.createdAt);
              if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
                monthlyStudents[d.getMonth()] += 1;
              }
            }
          });
          
          setUserRoleData([
            { name: 'Học viên', value: roleCount['ROLE_STUDENT'] || 0, color: '#3b82f6' },
            { name: 'Giảng viên', value: roleCount['ROLE_INSTRUCTOR'] || 0, color: '#10b981' },
            { name: 'Quản trị viên', value: roleCount['ROLE_ADMIN'] || 0, color: '#f59e0b' }
          ].filter(item => item.value > 0));

          const currentMonth = new Date().getMonth();
          const studentData = monthlyStudents.slice(0, currentMonth + 1).map((val, index) => ({
            name: `T${index + 1}`,
            students: val
          }));
          setStudentGrowthData(studentData);
        }

        if (coursesRes?.success) {
          setCourseTotal(coursesRes.data?.totalElements || 0);
          setCourseStats(coursesRes.data?.content || []);
          
          const statusCount = {};
          (coursesRes.data?.content || []).forEach(c => {
            statusCount[c.status] = (statusCount[c.status] || 0) + 1;
          });
          setCourseStatusData([
            { name: 'Đang hoạt động', value: statusCount['APPROVED'] || 0, color: '#10b981' },
            { name: 'Chờ duyệt', value: statusCount['PENDING'] || 0, color: '#f59e0b' },
            { name: 'Đang ẩn', value: statusCount['HIDDEN'] || 0, color: '#64748b' }
          ].filter(item => item.value > 0));
        }
        if (paymentStatsRes?.success) setRevenueTotal(paymentStatsRes.data?.totalRevenue || 0);

        const allPayments = allPaymentsRes?.data?.content || [];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = Array(12).fill(0);

        allPayments.forEach(p => {
          if (p.paymentStatus === 'SUCCESS' && p.transactionDate) {
            const date = parseDateVal(p.transactionDate);
            if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
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

        // Tính toán thống kê theo ngày (Khóa học mới, Giao dịch mới)
        const dailyMap = {};
        const getDayStr = (dateVal) => {
          const d = parseDateVal(dateVal);
          if (isNaN(d.getTime())) return '01/01'; // Fallback an toàn
          return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        };

        (coursesRes?.data?.content || []).forEach(c => {
          if (c.createdAt) {
            const dStr = getDayStr(c.createdAt);
            if (!dailyMap[dStr]) dailyMap[dStr] = { date: dStr, courses: 0, enrollments: 0, timestamp: parseDateVal(c.createdAt).setHours(0,0,0,0) };
            dailyMap[dStr].courses += 1;
          }
        });

        allPayments.forEach(p => {
          if (p.paymentStatus === 'SUCCESS' && p.transactionDate) {
            const dStr = getDayStr(p.transactionDate);
            if (!dailyMap[dStr]) dailyMap[dStr] = { date: dStr, courses: 0, enrollments: 0, timestamp: parseDateVal(p.transactionDate).setHours(0,0,0,0) };
            dailyMap[dStr].enrollments += 1;
          }
        });

        const sortedDailyStats = Object.values(dailyMap).sort((a, b) => a.timestamp - b.timestamp);
        setDailyStatsData(sortedDailyStats.slice(-14));

      } catch (error) {
        console.error('Lỗi khi tải báo cáo tổng quan:', error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchDashboardStats();
    
    let unsubscribe = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.userId) {
          // Khi có notification (vd: có người mua khóa học, đăng ký mới), lập tức tải lại Dashboard
          unsubscribe = webSocketService.subscribe(`/topic/notifications/${userObj.userId}`, () => {
            fetchDashboardStats(true);
          });
        }
      }
    } catch (e) {}
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
    
    let unsubscribe = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.userId) {
          unsubscribe = webSocketService.subscribe(`/topic/notifications/${userObj.userId}`, () => {
            fetchPayments(true);
          });
        }
      }
    } catch (e) {}
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      render: date => formatDateTime(date)
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

  const courseStatsColumns = [
    {
      title: 'Khóa học',
      dataIndex: 'title',
      key: 'title',
      render: text => <Text strong style={{ color: '#1e293b' }}>{text}</Text>
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructorName',
      key: 'instructorName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const colors = { 'APPROVED': 'success', 'PENDING': 'processing', 'REJECTED': 'error', 'DRAFT': 'default' };
        const texts = { 'APPROVED': 'Đã duyệt', 'PENDING': 'Chờ duyệt', 'REJECTED': 'Đã từ chối', 'DRAFT': 'Bản nháp' };
        return <Tag color={colors[status] || 'default'} style={{ borderRadius: '12px' }}>{texts[status] || status}</Tag>;
      }
    },
    {
      title: 'Người đăng ký',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      align: 'center',
      render: val => <Text strong>{val || 0}</Text>
    },
    {
      title: 'Người đã trả tiền',
      dataIndex: 'paidStudents',
      key: 'paidStudents',
      align: 'center',
      render: val => <Text strong style={{ color: '#3b82f6' }}>{val || 0}</Text>
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: val => <Text strong style={{ color: '#10b981' }}>{val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '0 ₫'}</Text>
    }
  ];

  return (
    <AdminLayout title="Tổng quan (Dashboard)">
      <div style={{ padding: '0 8px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header (Bộ lọc thời gian nâng cao) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <Space size="middle" style={{ flexWrap: 'wrap' }}>
            <RangePicker size="large" style={{ borderRadius: '8px' }} placeholder={['Từ ngày', 'Đến ngày']} />
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


            {/* Advanced Charts Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              {/* Area Chart: Revenue */}
              <Col xs={24} lg={12}>
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

              {/* Area Chart: Student Growth */}
              <Col xs={24} lg={12}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: '100%' }}
                  bodyStyle={{ padding: '16px' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <div style={{ padding: '6px', background: '#dcfce7', borderRadius: '12px', color: '#16a34a' }}>
                        <UserOutlined style={{ fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Tăng trưởng sinh viên</span>
                    </div>
                  }
                >
                  <div style={{ height: '280px', marginTop: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentGrowthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} allowDecimals={false} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="students" name="Sinh viên mới" fill="#10b981" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 600, formatter: (val) => val > 0 ? val : '' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              {/* Donut Chart: User Roles */}
              <Col xs={24} lg={12}>
                <Card 
                  bordered={false} 
                  style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: '100%' }}
                  bodyStyle={{ padding: '16px' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0' }}>
                      <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
                        <PieChartOutlined style={{ fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Thành phần người dùng</span>
                    </div>
                  }
                >
                  <div style={{ height: '280px', marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={userRoleData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                          label={{ fill: '#1e293b', fontSize: 12, fontWeight: 600, formatter: (val) => val > 0 ? val : '' }}
                        >
                          {userRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                      {userRoleData.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Donut Chart: Course Status */}
              <Col xs={24} lg={12}>
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




          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
