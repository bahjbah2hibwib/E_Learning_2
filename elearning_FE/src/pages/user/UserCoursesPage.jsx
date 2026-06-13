import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Card, Button, Input, Tag, Space, Spin, message, Modal
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
  PlayCircleOutlined,
  CheckCircleFilled,
  FireOutlined
} from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const UserCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [myCoursesMap, setMyCoursesMap] = useState({}); // ID khóa học -> true nếu đã đăng ký

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách khóa học public
      const courseRes = await courseService.getPublicCourses({ page: 0, size: 50, keyword: searchTerm });
      if (courseRes && courseRes.success) {
        setCourses(courseRes.data.content);
      }

      // Lấy danh sách khóa học người dùng đã đăng ký để ẩn nút Đăng ký
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        const myCourseRes = await userService.getUserCourses(user.userId);
        if (myCourseRes && myCourseRes.success) {
          const map = {};
          myCourseRes.data.forEach(mc => {
            map[mc.courseId] = true;
          });
          setMyCoursesMap(map);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách khóa học:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchData();
  };

  const handleViewDetail = (courseId) => {
    navigate(`/user/courses/${courseId}`);
  };

  return (
    <UserLayout>
      <div style={{ padding: '0 8px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>
            Khám Phá Khóa Học
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Nâng tầm kỹ năng của bạn với các khóa học chất lượng cao từ chuyên gia
          </Text>
        </div>

        {/* Search & Filter */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <Input.Search
            placeholder="Tìm kiếm khóa học theo tên..."
            allowClear
            enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: '600px' }}
          />
        </div>

        {/* Course List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {courses.length > 0 ? courses.map((course) => {
              const isEnrolled = myCoursesMap[course.courseId];
              
              return (
                <Col xs={24} sm={12} md={8} key={course.courseId}>
                  <Card
                    hoverable
                    onClick={() => handleViewDetail(course.courseId)}
                    style={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
                    cover={
                      <div style={{ position: 'relative', height: '180px', backgroundColor: '#f1f5f9' }}>
                        {course.thumbnailUrl ? (
                          <img 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                            alt={course.title} 
                            src={course.thumbnailUrl} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOutlined style={{ fontSize: '48px', color: '#cbd5e1' }} />
                          </div>
                        )}
                        {/* Price Tag */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px', 
                          background: course.isFree ? '#10b981' : '#f59e0b',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {course.isFree ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} đ`}
                        </div>
                      </div>
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ fontSize: '18px', marginBottom: '8px', minHeight: '54px' }} className="ellipsis-2-lines">
                        {course.title}
                      </Title>
                      
                      <Text type="secondary" className="ellipsis-2-lines" style={{ marginBottom: '16px', display: 'block', height: '44px' }}>
                        {course.description || 'Chưa có mô tả'}
                      </Text>

                      <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserOutlined style={{ color: '#64748b' }} />
                          <Text style={{ color: '#475569' }}>GV: <strong>{course.instructorName || 'Đang cập nhật'}</strong></Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FireOutlined style={{ color: '#ef4444' }} />
                            <Text>{course.totalStudents || 0} học viên</Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    {isEnrolled ? (
                      <Button 
                        type="primary" 
                        block 
                        size="large"
                        icon={<CheckCircleFilled />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/learning/${course.courseId}`);
                        }}
                        style={{ 
                          borderRadius: '8px', 
                          color: '#fff', 
                          borderColor: '#10b981',
                          backgroundColor: '#10b981',
                          fontWeight: '600'
                        }}
                      >
                        Đã đăng ký - Vào học
                      </Button>
                    ) : (
                      <Button 
                        type="primary" 
                        block 
                        size="large"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(course.courseId);
                        }}
                        style={{ 
                          borderRadius: '8px', 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          fontWeight: '600',
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </Card>
                </Col>
              );
            }) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <InboxOutlined style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                  <Title level={4} style={{ color: '#64748b' }}>Không tìm thấy khóa học nào</Title>
                  <Text type="secondary">Vui lòng thử lại với từ khóa khác</Text>
                </div>
              </Col>
            )}
          </Row>
        )}
      </div>

      <style jsx="true">{`
        .ellipsis-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </UserLayout>
  );
};

export default UserCoursesPage;
