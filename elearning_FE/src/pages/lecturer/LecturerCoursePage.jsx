import React, { useState, useEffect } from 'react';
import LecturerLayout from '../../layouts/LecturerLayout';
import { 
  Typography, Card, Button, Input, Select, Space, message, Row, Col, 
  Tabs, Form, Upload, Radio, Empty, Tag, Spin, Divider, Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import instructorService from '../../services/instructorService';
import fileService from '../../services/fileService';
import CurriculumTab from './components/CurriculumTab';
import StudentStatsTab from './components/StudentStatsTab';
import CourseFilesTab from './components/CourseFilesTab';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Reusable Stat Card Component for the Top Row
const StatCard = ({ icon, iconBg, iconColor, title, value }) => (
  <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: '16px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: iconBg, color: iconColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
        {icon}
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>{title}</Text>
        <Title level={3} style={{ margin: 0, color: '#1e293b' }}>{value}</Title>
      </div>
    </div>
  </Card>
);

const LecturerCoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // States for Image Upload
  const [thumbnailFileId, setThumbnailFileId] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [form] = Form.useForm();

  const fetchDashboardStats = async () => {
    try {
      const res = await instructorService.getDashboardStats();
      if (res && res.success) {
        setStats({
          total: res.data.totalCourses || 0,
          active: res.data.activeCourses || 0,
          pending: (res.data.totalCourses || 0) - (res.data.activeCourses || 0) // Approximation
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await instructorService.getCategories();
      if (res && res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Không thể lấy danh mục:', error);
    }
  };

  const fetchCourses = async (keyword = '') => {
    try {
      setLoading(true);
      const res = await instructorService.getInstructorCourses({ page: 0, size: 50, keyword });
      if (res && res.success && res.data) {
        setCourses(res.data.content);
        if (res.data.content.length > 0 && !selectedCourse && !isCreating) {
          handleSelectCourse(res.data.content[0]);
        } else if (res.data.content.length === 0 && !isCreating) {
          setSelectedCourse(null);
        }
      }
    } catch (error) {
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchCategories();
    fetchCourses();
  }, []);

  // Tự động làm mới dữ liệu khi Giảng viên quay lại tab này (Giả lập cập nhật realtime khi Admin duyệt)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardStats();
        fetchCourses(searchText);
        if (selectedCourse?.courseId) {
          fetchCourseDetail(selectedCourse.courseId);
          
          // Cập nhật lại form status
          const updatedCourse = courses.find(c => c.courseId === selectedCourse.courseId);
          if (updatedCourse) {
            form.setFieldsValue({ status: updatedCourse.status });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [searchText, selectedCourse, courses, form]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    fetchCourses(val);
  };

  const fetchCourseDetail = async (courseId) => {
    try {
      const res = await instructorService.getCourseDetail(courseId);
      if (res.success) {
        setCourseDetail(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch course details', error);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setIsCreating(false);
    setThumbnailFileId(course.thumbnailFileId || null);
    setThumbnailPreviewUrl(course.thumbnailUrl || null);
    
    // Fetch chi tiết khóa học bao gồm sections và lessons
    fetchCourseDetail(course.courseId);
    
    form.setFieldsValue({
      title: course.title,
      description: course.description || '',
      whatYouWillLearn: course.whatYouWillLearn || '',
      categoryId: course.categoryId || null,
      status: course.status,
      type: course.price > 0 ? 'paid' : 'free',
      price: course.price || 0
    });
  };

  const handleCreateNew = () => {
    setSelectedCourse(null);
    setIsCreating(true);
    setThumbnailFileId(null);
    setThumbnailPreviewUrl(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'DRAFT',
      type: 'free',
      price: 0
    });
  };

  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    try {
      setIsUploadingImage(true);
      const res = await fileService.uploadFile(file);
      if (res && res.success) {
        setThumbnailFileId(res.data.fileId);
        setThumbnailPreviewUrl(res.data.fileUrl);
        message.success('Tải ảnh lên thành công!');
        onSuccess(res.data);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error(error);
      message.error('Tải ảnh lên thất bại!');
      onError(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description || '',
        whatYouWillLearn: values.whatYouWillLearn || '',
        categoryId: values.categoryId,
        status: values.status,
        price: values.type === 'free' ? 0 : (values.price || 0),
        thumbnailFileId: thumbnailFileId
      };

      if (isCreating) {
        await instructorService.createCourse(payload);
        message.success('Tạo khóa học thành công!');
      } else {
        await instructorService.updateCourse(selectedCourse.courseId, payload);
        message.success('Cập nhật khóa học thành công!');
      }
      
      // Reload lists
      fetchDashboardStats();
      fetchCourses(searchText);
      setIsCreating(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu khóa học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    try {
      setIsSubmitting(true);
      await instructorService.deleteCourse(selectedCourse.courseId);
      message.success('Xóa khóa học thành công!');
      setSelectedCourse(null);
      fetchDashboardStats();
      fetchCourses(searchText);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa khóa học. Vui lòng chuyển sang Đã ẩn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    if (status === 'APPROVED') return <Tag color="success" style={{ borderRadius: '12px' }}>Đã duyệt</Tag>;
    if (status === 'PENDING') return <Tag color="warning" style={{ borderRadius: '12px' }}>Chờ duyệt</Tag>;
    if (status === 'HIDDEN') return <Tag color="default" style={{ borderRadius: '12px' }}>Đã ẩn</Tag>;
    return <Tag color="processing" style={{ borderRadius: '12px' }}>Bản nháp</Tag>;
  };

  return (
    <LecturerLayout>
      <div style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            style={{ borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 12px rgba(22, 119, 255, 0.2)' }}
            onClick={handleCreateNew}
          >
            Tạo Khóa Học Mới
          </Button>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={8}>
            <StatCard icon={<BookOutlined />} iconBg="#eff6ff" iconColor="#3b82f6" title="Tổng số khóa học" value={stats.total} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard icon={<CheckCircleOutlined />} iconBg="#dcfce7" iconColor="#10b981" title="Đã duyệt (Active)" value={stats.active} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard icon={<ClockCircleOutlined />} iconBg="#fef3c7" iconColor="#f59e0b" title="Chờ duyệt" value={stats.pending} />
          </Col>
        </Row>

        {/* Main Content Split View */}
        <Row gutter={[24, 24]}>
          
          {/* Left Column: Course List */}
          <Col xs={24} lg={7}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minHeight: '600px' }}>
              <Title level={5} style={{ marginTop: 0, marginBottom: '16px' }}>Danh sách khóa học</Title>
              <Input 
                placeholder="Tìm kiếm khóa học..." 
                prefix={<SearchOutlined style={{ color: '#94a3b8' }}/>} 
                value={searchText}
                onChange={handleSearch}
                style={{ borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f8fafc' }}
                size="large"
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                ) : courses.length === 0 ? (
                  <Empty description="Chưa có khóa học nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  courses.map(course => (
                    <div 
                      key={course.courseId}
                      onClick={() => handleSelectCourse(course)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        border: selectedCourse?.courseId === course.courseId && !isCreating ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: selectedCourse?.courseId === course.courseId && !isCreating ? '#eff6ff' : '#ffffff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        <img 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                          src={course.thumbnailUrl || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} 
                          alt={course.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {e.target.src = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}}
                        />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text strong style={{ fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                            {course.title}
                          </Text>
                          {renderStatusTag(course.status)}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '4px' }}>
                          {course.category || 'Khóa học dành cho người mới...'}
                        </Text>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Col>

          {/* Right Column: Course Details Form */}
          <Col xs={24} lg={17}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minHeight: '600px', overflow: 'hidden' }}>
              {!selectedCourse && !isCreating && courses.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '600px' }}>
                  <Empty 
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{ height: 120 }}
                    description={<span style={{ color: '#64748b', fontSize: '16px' }}>Bạn chưa có khóa học nào. Hãy bắt đầu bằng cách tạo mới!</span>}
                  >
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreateNew} style={{ borderRadius: '8px' }}>Tạo Khóa Học Mới</Button>
                  </Empty>
                </div>
              ) : !selectedCourse && !isCreating ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '600px' }}>
                  <Text type="secondary" style={{ fontSize: '16px' }}>Vui lòng chọn một khóa học ở danh sách bên trái hoặc tạo mới.</Text>
                </div>
              ) : (
                <>
                  <Tabs 
                    defaultActiveKey="1" 
                    tabBarStyle={{ padding: '0 24px', margin: 0, backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
                    items={[
                      {
                        key: '1',
                        label: <span style={{ fontWeight: 500, fontSize: '15px' }}>Thông tin chung</span>,
                        children: (
                          <div style={{ padding: '24px' }}>
                            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                              <Form.Item label={<Text strong>Ảnh đại diện (Thumbnail)</Text>}>
                                <div style={{ border: '1px dashed #d9d9d9', borderRadius: '12px', padding: '8px', textAlign: 'center', backgroundColor: '#fafafa', position: 'relative', height: '280px', overflow: 'hidden' }}>
                                  <img 
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                    src={thumbnailPreviewUrl || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'} 
                                    alt="thumbnail" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                  <Upload showUploadList={false} customRequest={handleUploadImage} accept="image/*">
                                    <Button icon={<UploadOutlined />} loading={isUploadingImage} style={{ position: 'absolute', bottom: '16px', right: '16px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>Thay đổi ảnh</Button>
                                  </Upload>
                                </div>
                              </Form.Item>

                              <Form.Item 
                                label={<Text strong>Tiêu đề khóa học</Text>} 
                                name="title"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề khóa học!' }]}
                              >
                                <Input size="large" style={{ borderRadius: '6px' }} />
                              </Form.Item>

                              <Form.Item label={<Text strong>Mô tả khóa học</Text>} name="description">
                                <TextArea rows={3} style={{ borderRadius: '6px' }} />
                              </Form.Item>

                              <Form.Item 
                                label={<Text strong>Những gì học viên sẽ học được</Text>} 
                                name="whatYouWillLearn"
                                help="Mỗi mục trên 1 dòng"
                              >
                                <TextArea rows={4} placeholder="Ví dụ:&#10;Hiểu rõ các khái niệm cốt lõi...&#10;Có khả năng tự duy trì và phát triển..." style={{ borderRadius: '6px' }} />
                              </Form.Item>

                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item 
                                    label={<Text strong>Danh mục</Text>} 
                                    name="categoryId"
                                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                  >
                                    <Select size="large" placeholder="Chọn danh mục">
                                      {categories.map(c => (
                                        <Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item label={<Text strong>Trạng thái khóa học</Text>} name="status">
                                    <Select size="large">
                                      <Option value="DRAFT">Bản nháp (Draft)</Option>
                                      <Option value="PENDING">Chờ duyệt (Pending)</Option>
                                      <Option value="HIDDEN">Đã ẩn (Hidden)</Option>
                                      <Option value="APPROVED" disabled>Đã duyệt (Chỉ Admin)</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                              </Row>

                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item label={<Text strong>Loại khóa học</Text>} name="type">
                                    <Select size="large">
                                      <Option value="free">Miễn phí (Free)</Option>
                                      <Option value="paid">Trả phí (Paid)</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Form.Item
                                  noStyle
                                  shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                                >
                                  {({ getFieldValue }) =>
                                    getFieldValue('type') === 'paid' ? (
                                      <Col span={12}>
                                        <Form.Item label={<Text strong>Giá khóa học</Text>} name="price" rules={[{ required: true, message: 'Vui lòng nhập giá khóa học' }]}>
                                          <Input size="large" suffix="VNĐ" type="number" style={{ borderRadius: '6px' }} />
                                        </Form.Item>
                                      </Col>
                                    ) : null
                                  }
                                </Form.Item>
                              </Row>

                              <div style={{ display: 'none' }}>
                                <Button id="hidden-submit-btn" htmlType="submit" />
                              </div>
                            </Form>
                          </div>
                        )
                      },
                      { 
                        key: '2', 
                        label: <span style={{ fontWeight: 500, fontSize: '15px' }}>Chương trình học</span>, 
                        children: <CurriculumTab courseData={courseDetail} courseId={selectedCourse?.courseId} onRefresh={() => fetchCourseDetail(selectedCourse.courseId)} /> 
                      },
                      { key: '3', label: <span style={{ fontWeight: 500, fontSize: '15px' }}>Tài liệu</span>, children: <CourseFilesTab courseData={courseDetail} /> },
                      { key: '4', label: <span style={{ fontWeight: 500, fontSize: '15px' }}>Thống kê học viên</span>, children: <StudentStatsTab courseId={selectedCourse?.courseId} /> },
                    ]}
                  />
                  
                  <div style={{ padding: '20px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  {!isCreating && selectedCourse && (
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa khóa học này không?"
                      onConfirm={handleDeleteCourse}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, loading: isSubmitting }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>Xóa khóa học</Button>
                    </Popconfirm>
                  )}
                  {(!selectedCourse || isCreating) && <div></div>}
                  <Space>
                    <Button size="large" style={{ borderRadius: '6px' }} onClick={() => {
                      if (isCreating) {
                        setIsCreating(false);
                        if (courses.length > 0) handleSelectCourse(courses[0]);
                      } else {
                        handleSelectCourse(selectedCourse); // Reset form
                      }
                    }}>Hủy thay đổi</Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      loading={isSubmitting} 
                      style={{ borderRadius: '6px', backgroundColor: '#0052cc' }}
                      onClick={() => {
                        // Kích hoạt submit form ẩn
                        document.getElementById('hidden-submit-btn')?.click();
                      }}
                    >Lưu cập nhật</Button>
                  </Space>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </LecturerLayout>
  );
};

export default LecturerCoursePage;
