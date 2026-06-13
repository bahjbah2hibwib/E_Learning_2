import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Spin, message, Badge, Tag } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AdminLayout from '../../../layouts/AdminLayout';
import CoursePreview from '../../../components/admin/course/CoursePreview';
import CourseCurriculum from '../../../components/admin/course/CourseCurriculum';
import ApprovalActionModal from '../../../components/admin/course/ApprovalActionModal';
import courseService from '../../../services/courseService';

const { Title, Text } = Typography;

const CourseApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courseDetail, setCourseDetail] = useState(null);
  
  // Modal states
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(''); // 'APPROVED' | 'HIDDEN'

  // Lấy chi tiết khóa học khi vào trang
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCourseDetail(id);
        if (response && response.success) {
          const apiData = response.data;
          setCourseDetail({
            ...apiData,
            instructorName: apiData.instructor?.fullName || 'Chưa cập nhật',
            categoryName: apiData.category?.categoryName || 'Chưa cập nhật',
            curriculum: apiData.sections && apiData.sections.length > 0 
              ? apiData.sections.map(section => ({
                  title: section.title,
                  lessons: section.lessons ? section.lessons.map(l => ({
                    ...l,
                    title: l.title,
                    type: l.lessonType || 'VIDEO',
                    isFreePreview: false,
                    duration: l.durationMinutes || null
                  })) : []
                }))
              : []
          });
        } else {
          message.error('Không thể lấy thông tin chi tiết khóa học.');
        }
      } catch (error) {
        message.error(error.message || 'Lỗi khi lấy thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const handleOpenConfirmModal = (action) => {
    setPendingAction(action);
    setIsConfirmModalVisible(true);
  };

  const handleSubmitStatus = async () => {
    try {
      setActionLoading(true);
      const response = await courseService.updateCourseStatus(id, { status: pendingAction });
      
      if (response && response.success) {
        message.success('Đã cập nhật trạng thái khóa học thành công!');
        // Cập nhật lại UI state thay vì gọi lại toàn bộ API cho nhẹ
        setCourseDetail(prev => ({
          ...prev,
          status: pendingAction
        }));
        setIsConfirmModalVisible(false);
      }
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" tip="Đang tải dữ liệu khóa học..." />
        </div>
      </AdminLayout>
    );
  }

  if (!courseDetail) return null;

  // Tính toán Badge trạng thái
  let statusBadge = { color: 'warning', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> };
  if (courseDetail.status === 'APPROVED') statusBadge = { color: 'success', text: 'Đã phê duyệt', icon: <CheckCircleOutlined /> };
  if (courseDetail.status === 'HIDDEN') statusBadge = { color: 'default', text: 'Đã ẩn', icon: <StopOutlined /> };

  return (
    <AdminLayout>
      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        backgroundColor: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/courses')} />
          <div>
            <Title level={4} style={{ margin: 0 }}>Chi tiết khóa học</Title>
            <Space size="small">
              <Text type="secondary">Mã KH: #{courseDetail.courseId}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">Giảng viên: <strong style={{ color: '#0f172a' }}>{courseDetail.instructorName}</strong></Text>
              <Tag color={statusBadge.color} icon={statusBadge.icon} style={{ marginLeft: '8px', borderRadius: '12px' }}>
                {statusBadge.text}
              </Tag>
            </Space>
          </div>
        </Space>

        <Space>
          {courseDetail.status !== 'HIDDEN' && (
            <Button 
              danger 
              size="large"
              style={{ borderRadius: '8px', fontWeight: '500' }}
              onClick={() => handleOpenConfirmModal('HIDDEN')}
            >
              Từ chối / Ẩn
            </Button>
          )}
          {courseDetail.status !== 'APPROVED' && (
            <Button 
              type="primary" 
              size="large"
              style={{ backgroundColor: '#16a34a', borderRadius: '8px', fontWeight: '500' }}
              onClick={() => handleOpenConfirmModal('APPROVED')}
            >
              Phê duyệt khóa học
            </Button>
          )}
        </Space>
      </div>

      {/* Nội dung chính */}
      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} lg={14}>
          {/* Thông tin hiển thị */}
          <CoursePreview course={courseDetail} />
        </Col>
        
        <Col xs={24} lg={10}>
          {/* Cấu trúc bài giảng */}
          <CourseCurriculum curriculum={courseDetail.curriculum} />
        </Col>
      </Row>

      {/* Modal Xác nhận */}
      <ApprovalActionModal 
        visible={isConfirmModalVisible}
        actionType={pendingAction}
        loading={actionLoading}
        courseTitle={courseDetail.title}
        onConfirm={handleSubmitStatus}
        onCancel={() => setIsConfirmModalVisible(false)}
      />
    </AdminLayout>
  );
};

export default CourseApprovalPage;
