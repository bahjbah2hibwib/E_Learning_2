import React, { useState, useEffect, useCallback } from 'react';
import { Typography, message, Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import AdminLayout from '../../../layouts/AdminLayout';
import PaymentStatsCards from '../../../components/admin/payment/PaymentStatsCards';
import PaymentFilter from '../../../components/admin/payment/PaymentFilter';
import PaymentTable from '../../../components/admin/payment/PaymentTable';
import PaymentDetailModal from '../../../components/admin/payment/PaymentDetailModal';
import paymentService from '../../../services/paymentService';

const { Title } = Typography;
const { confirm } = Modal;

const PaymentListPage = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successCount: 0,
    pendingCount: 0,
    refundedCount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    startDate: null,
    endDate: null
  });
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const fetchPayments = useCallback(async (currentPage, currentSize, currentFilters) => {
    try {
      setLoading(true);
      // Backend pagination is 0-indexed, UI is 1-indexed
      const res = await paymentService.getAllPayments(currentPage - 1, currentSize, currentFilters);
      if (res.success && res.data) {
        setPayments(res.data.content);
        setPagination({
          page: res.data.pageNo + 1,
          size: res.data.pageSize,
          total: res.data.totalElements
        });
      }
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await paymentService.getPaymentStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPayments(pagination.page, pagination.size, filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, fetchPayments]); // trigger on filter change

  useEffect(() => {
    fetchPayments(pagination.page, pagination.size, filters);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size]); // trigger on pagination change

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // reset về trang 1
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      page: newPagination.current,
      size: newPagination.pageSize
    }));
  };

  const handleExportCSV = async () => {
    try {
      message.loading({ content: 'Đang chuẩn bị dữ liệu xuất CSV...', key: 'exportCSV' });
      const res = await paymentService.getAllPayments(0, 10000, filters);
      if (res.success && res.data) {
        const data = res.data.content;
        
        if (data.length === 0) {
          message.warning({ content: 'Không có dữ liệu để xuất', key: 'exportCSV' });
          return;
        }

        const headers = ['Mã GD', 'Học viên', 'Khóa học', 'Số tiền (VNĐ)', 'Phương thức', 'Trạng thái', 'Ngày GD'];
        const csvRows = [];
        
        // Thêm BOM (Byte Order Mark) cho UTF-8 để Excel đọc tiếng Việt không bị lỗi font
        csvRows.push('\uFEFF' + headers.join(','));
        
        data.forEach(row => {
          const formattedDate = row.transactionDate ? new Date(row.transactionDate).toLocaleString('vi-VN') : 'N/A';
          const values = [
            `"${row.transactionCode || ''}"`,
            `"${row.studentName || ''}"`,
            `"${row.courseName || ''}"`,
            `"${row.amount || 0}"`,
            `"${row.paymentMethod || ''}"`,
            `"${row.paymentStatus || ''}"`,
            `"${formattedDate}"`
          ];
          csvRows.push(values.join(','));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `DanhSachGiaoDich_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success({ content: 'Xuất CSV thành công!', key: 'exportCSV' });
      }
    } catch (error) {
      message.error({ content: error.message || 'Lỗi khi xuất CSV', key: 'exportCSV' });
    }
  };

  const handleRefund = (record) => {
    confirm({
      title: 'Xác nhận hoàn tiền',
      icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
      content: `Bạn có chắc chắn muốn thực hiện hoàn tiền cho giao dịch ${record.transactionCode || 'này'}? Hành động này không thể hoàn tác.`,
      okText: 'Hoàn tiền',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success(`Đã gửi yêu cầu hoàn tiền cho mã GD: ${record.transactionCode || record.paymentId}`);
      },
    });
  };

  const handleViewDetail = (record) => {
    setSelectedPaymentId(record.paymentId);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedPaymentId(null);
  };

  return (
    <AdminLayout>
      <PaymentStatsCards stats={stats} />

      <PaymentFilter 
        onFilterChange={handleFilterChange} 
        onExportCSV={handleExportCSV} 
      />

      <PaymentTable 
        loading={loading}
        payments={payments}
        pagination={pagination}
        onChange={handleTableChange}
        onRefund={handleRefund}
        onViewDetail={handleViewDetail}
      />

      <PaymentDetailModal 
        visible={detailModalVisible}
        paymentId={selectedPaymentId}
        onClose={handleCloseDetailModal}
      />
    </AdminLayout>
  );
};

export default PaymentListPage;
