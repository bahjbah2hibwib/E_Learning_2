import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Progress, Button, Spin, Tag } from 'antd';
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  ArrowRightOutlined,
  CodeOutlined
} from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UserDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.fullName || 'Học viên';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user && user.userId) {
          const res = await userService.getStudentDashboard(user.userId);
          if (res && res.success) {
            setData(res.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <UserLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" />
        </div>
      </UserLayout>
    );
  }

  const dashboardData = data || {
    learningCourse: null,
    totalEnrolled: 0,
    totalCompletedLessons: 0,
    myCourses: []
  };

  const { learningCourse, totalEnrolled, totalCompletedLessons, myCourses } = dashboardData;

  return (
    <UserLayout>
      <div style={{ padding: '0 32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} style={{ marginBottom: 4 }}>Chào mừng trở lại, {userName}</Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>Dưới đây là tiến độ học tập của bạn hôm nay.</Text>
        </div>

        {/* Top Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {/* Active Course Card */}
          <Col xs={24} lg={16}>
            <Card 
              bodyStyle={{ padding: 0 }} 
              style={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0',
                height: '100%'
              }}
            >
              <Row style={{ height: '100%' }}>
                <Col xs={24} md={10} style={{ position: 'relative', minHeight: '200px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 1,
                    fontWeight: 500,
                    fontSize: '13px'
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: learningCourse ? '#1677ff' : '#9ca3af' }}></div>
                    {learningCourse ? 'Đang học' : 'Gợi ý'}
                  </div>
                  <img 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    src={learningCourse?.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                    alt="course cover" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Col>
                <Col xs={24} md={14} style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#1677ff', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <CodeOutlined style={{ marginRight: 6 }}/>
                    {learningCourse?.categoryName || 'Khám phá ngay'}
                  </Text>
                  
                  <Title level={2} style={{ marginTop: 0, marginBottom: '16px', fontSize: '26px' }}>
                    {learningCourse?.courseName || 'Bạn chưa đăng ký khóa học nào'}
                  </Title>
                  
                  <Text type="secondary" style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: 'auto' }}>
                    {learningCourse ? 'Tiếp tục quá trình rèn luyện để hoàn thành mục tiêu học tập của bạn. Mỗi ngày một bài học mới.' 
                      : 'Hãy bắt đầu hành trình học tập của bạn bằng cách đăng ký một khóa học mới nhé.'}
                  </Text>

                  <div style={{ marginTop: '32px' }}>
                    {learningCourse && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text strong style={{ color: '#4b5563' }}>{learningCourse?.currentChapter || 'Đang học'}</Text>
                          <Text strong style={{ color: '#1677ff' }}>{learningCourse?.progressPercentage || 0}%</Text>
                        </div>
                        <Progress 
                          percent={learningCourse?.progressPercentage || 0} 
                          showInfo={false} 
                          strokeColor="#1677ff" 
                          trailColor="#f1f5f9"
                          strokeWidth={8}
                        />
                      </>
                    )}
                    
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ marginTop: '24px', borderRadius: '8px', padding: '0 24px', fontWeight: 500 }}
                      onClick={() => learningCourse ? navigate(`/user/learning/${learningCourse.courseId}`) : navigate('/user/courses')}
                    >
                      {learningCourse ? 'Tiếp tục học ' : 'Xem danh sách khóa học '} <ArrowRightOutlined />
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Stats Cards */}
          <Col xs={24} lg={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
              <Card 
                style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  border: '1px solid #f0f0f0',
                  flex: 1
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ background: '#e0e7ff', color: '#4f46e5', width: 48, height: 48, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 24 }}>
                    <BookOutlined />
                  </div>
                  <Tag color="success" style={{ borderRadius: 12, fontWeight: 600 }}>+ 2</Tag>
                </div>
                <div style={{ marginTop: 24 }}>
                  <Title level={1} style={{ margin: 0, fontSize: '42px', fontWeight: 700 }}>{totalEnrolled || 0}</Title>
                  <Text type="secondary" style={{ fontSize: '15px' }}>Khóa học đã đăng ký</Text>
                </div>
              </Card>

              <Card 
                style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  border: '1px solid #f0f0f0',
                  flex: 1
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ background: '#ffedd5', color: '#ea580c', width: 48, height: 48, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 24 }}>
                  <CheckCircleOutlined />
                </div>
                <div style={{ marginTop: 24 }}>
                  <Title level={1} style={{ margin: 0, fontSize: '42px', fontWeight: 700 }}>{totalCompletedLessons || 0}</Title>
                  <Text type="secondary" style={{ fontSize: '15px' }}>Bài học đã hoàn thành</Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* My Courses Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Khóa học của tôi</Title>
            <Text type="secondary">Theo dõi các khóa học đang tham gia và tiến độ của bạn.</Text>
          </div>
          <Button type="link" onClick={() => navigate('/user/courses')} style={{ fontWeight: 500 }}>
            Xem tất cả <ArrowRightOutlined />
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {myCourses?.slice(0, 3).map((course, index) => (
            <Col xs={24} md={8} key={course.courseId || index}>
              <Card
                hoverable
                onClick={() => navigate(`/user/learning/${course.courseId}`)}
                style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer' }}
                bodyStyle={{ padding: '20px' }}
                cover={
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                      alt="course" 
                      src={course.thumbnailUrl || 'https://via.placeholder.com/300'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <Tag color={index === 0 ? 'purple' : index === 1 ? 'orange' : 'blue'} style={{ borderRadius: 4, border: 'none' }}>
                    {course.categoryName || 'Khóa học'}
                  </Tag>
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '18px' }} ellipsis={{ rows: 2 }}>
                  {course.courseName}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 20, minHeight: 44 }} ellipsis={{ rows: 2 }}>
                  Tiếp tục rèn luyện kỹ năng và nâng cao kiến thức của bạn với khóa học này.
                </Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Hoàn thành {course.progressPercentage}%
                  </Text>
                  {course.progressPercentage === 100 && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                </div>
                <Progress 
                  percent={course.progressPercentage} 
                  showInfo={false} 
                  strokeColor={course.progressPercentage === 100 ? '#10b981' : '#3b82f6'}
                  trailColor="#f1f5f9"
                  strokeWidth={6}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </UserLayout>
  );
};

export default UserDashboardPage;
