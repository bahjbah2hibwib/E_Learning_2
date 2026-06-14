import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Tabs, Row, Col, Spin, Pagination, message } from 'antd';
import AdminLayout from '../../../layouts/AdminLayout';
import CourseTable from '../../../components/admin/course/CourseTable';
import ApprovalActionModal from '../../../components/admin/course/ApprovalActionModal';
import courseService from '../../../services/courseService';

const { Title } = Typography;

const CourseListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courseList, setCourseList] = useState([]);
  
  // Bộ lọc
  const [filters, setFilters] = useState({
    keyword: '',
    status: '' // Rỗng là lấy tất cả
  });

  // Phân trang
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10, // Thay đổi từ 6 (grid) thành 10 (table)
    total: 0
  });

  // Modal states
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState({ action: '', course: null });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        keyword: filters.keyword,
        status: filters.status
      };
      
      const response = await courseService.getAllAdminCourses(params);
      if (response && response.success) {
        setCourseList(response.data.content);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements
        }));
      }
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu mỗi khi page, status hoặc keyword thay đổi (có thể thêm debounce cho keyword)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500); // 500ms debounce cho ô tìm kiếm
    
    return () => clearTimeout(timer);
  }, [pagination.page, filters.status, filters.keyword]);


  // Các nút hành động trên thẻ
  const handleApprove = (course) => {
    setPendingAction({ action: 'APPROVED', course });
    setIsConfirmModalVisible(true);
  };

  const handleReject = (course) => {
    setPendingAction({ action: 'HIDDEN', course });
    setIsConfirmModalVisible(true);
  };

  const handleSubmitStatus = async () => {
    if (!pendingAction.course) return;
    try {
      setActionLoading(true);
      const response = await courseService.updateCourseStatus(pendingAction.course.courseId, { status: pendingAction.action });
      
      if (response && response.success) {
        message.success('Đã cập nhật trạng thái khóa học thành công!');
        fetchCourses(); // Tải lại danh sách
        setIsConfirmModalVisible(false);
      }
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (course) => {
    navigate(`/admin/courses/${course.courseId}`);
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <CourseTable 
          data={courseList}
          loading={loading}
          pagination={pagination}
          onPageChange={(page, size) => setPagination(prev => ({ ...prev, page, size }))}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Modal Xác nhận */}
      <ApprovalActionModal 
        visible={isConfirmModalVisible}
        actionType={pendingAction.action}
        loading={actionLoading}
        courseTitle={pendingAction.course?.title}
        onConfirm={handleSubmitStatus}
        onCancel={() => setIsConfirmModalVisible(false)}
      />
    </AdminLayout>
  );
};

export default CourseListPage;
