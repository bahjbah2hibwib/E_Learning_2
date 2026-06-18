import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Progress, Button, Spin, Rate, Badge } from 'antd';
import { PlayCircleFilled, CheckCircleFilled, StarFilled } from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UserDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.fullName || 'Học viên';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user && user.userId) {
          const [dashboardRes, publicRes] = await Promise.all([
            userService.getStudentDashboard(user.userId),
            courseService.getPublicCourses({ page: 0, size: 8 })
          ]);
          
          if (dashboardRes && dashboardRes.success) {
            setData(dashboardRes.data);
          }
          if (publicRes && publicRes.success) {
            setRecommendedCourses(publicRes.data.content || []);
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

  const { learningCourse, myCourses } = dashboardData;

  return (
    <UserLayout>
      {/* Premium Hero Section */}
      <div style={{ backgroundColor: '#f7f9fa', padding: '0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 32px' }}>
          <Row align="middle" style={{ minHeight: '400px' }}>
            <Col xs={24} md={12} style={{ padding: '48px 0', zIndex: 2 }}>
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '32px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)',
                maxWidth: '480px'
              }}>
                <Title level={1} style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: 'SuisseWorks, Georgia, Times, times new roman, serif', color: '#1c1d1f' }}>
                  Học không giới hạn.
                </Title>
                <Text style={{ fontSize: '16px', color: '#1c1d1f', display: 'block', marginBottom: '24px', lineHeight: 1.5 }}>
                  Chào <strong>{userName}</strong>. Khám phá hàng ngàn khóa học chất lượng từ các chuyên gia hàng đầu. Nâng cao kỹ năng và đạt được mục tiêu của bạn ngay hôm nay.
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/user/courses')}
                  style={{ 
                    backgroundColor: '#1c1d1f', 
                    borderColor: '#1c1d1f', 
                    borderRadius: 0, 
                    fontWeight: 700, 
                    height: '48px', 
                    padding: '0 24px',
                    fontSize: '16px'
                  }}
                >
                  Khám phá ngay
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12} style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
               <img 
                 src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                 alt="Students learning" 
                 style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'center' }}
               />
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '64px 32px' }}>
        
        {/* Recommended Courses Section (Marketplace feel) */}
        <div style={{ marginBottom: '64px' }}>
          <Title level={2} style={{ fontSize: '24px', fontWeight: 700, color: '#1c1d1f', marginBottom: '8px' }}>
            Khóa học hàng đầu dành cho bạn
          </Title>
          <Text style={{ fontSize: '16px', color: '#6a6f73', display: 'block', marginBottom: '24px' }}>
            Lựa chọn dựa trên sở thích và xu hướng học tập hiện tại.
          </Text>
          
          <Row gutter={[16, 32]}>
            {recommendedCourses.map((course, index) => {
              const isEnrolled = myCourses?.some(mc => mc.courseId === course.courseId);
              // Randomly assign bestseller badge for visual demo
              const isBestseller = index === 0 || index === 2; 

              return (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={course.courseId || index}>
                  <div 
                    className="course-card-premium"
                    onClick={() => isEnrolled ? navigate(`/user/learning/${course.courseId}`) : navigate(`/user/courses/${course.courseId}`)}
                  >
                    <div className="course-image-container">
                      <img 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x170?text=No+Image'; }}
                        alt={course.title} 
                        src={course.thumbnailUrl || 'https://via.placeholder.com/300'} 
                      />
                      <div className="course-overlay"></div>
                    </div>
                    
                    <div className="course-content">
                      <Title level={4} className="course-title" ellipsis={{ rows: 2 }}>
                        {course.title}
                      </Title>
                      <Text className="course-instructor" ellipsis>
                        {course.instructorName || 'Đặng Lê Nguyên Vũ'}
                      </Text>
                      
                      <div className="course-rating">
                        <span className="rating-score">4.8</span>
                        <div className="stars">
                          <StarFilled />
                          <StarFilled />
                          <StarFilled />
                          <StarFilled />
                          <StarFilled />
                        </div>
                        <span className="rating-count">(1,234)</span>
                      </div>
                      
                      <div className="course-price">
                        {course.isFree ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} đ`}
                      </div>

                      {isBestseller && (
                        <div className="course-badge">
                          Được yêu thích
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Active Course Section */}
        {learningCourse && (
          <div style={{ marginBottom: '64px' }}>
            <Title level={2} style={{ fontSize: '24px', fontWeight: 700, color: '#1c1d1f', marginBottom: '24px' }}>
              Hãy tiếp tục học
            </Title>
            <div 
              className="active-course-premium"
              onClick={() => navigate(`/user/learning/${learningCourse.courseId}`)}
            >
              <Row align="middle" gutter={0}>
                <Col xs={24} md={6} lg={5}>
                  <div className="active-image-container">
                    <img 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x220?text=No+Image'; }}
                      src={learningCourse?.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                      alt="course cover" 
                    />
                    <div className="active-overlay">
                      <PlayCircleFilled />
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={18} lg={19} style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <Title level={3} style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#1c1d1f' }}>
                          {learningCourse.courseName}
                        </Title>
                        <Text style={{ color: '#6a6f73', fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                          Bài học tiếp theo: <strong style={{ color: '#1c1d1f' }}>{learningCourse.currentChapter || 'Bắt đầu học'}</strong>
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        size="large" 
                        className="btn-continue"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/learning/${learningCourse.courseId}`);
                        }}
                      >
                        Tiếp tục học
                      </Button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto' }}>
                      <Progress 
                        percent={learningCourse.progressPercentage || 0} 
                        showInfo={false} 
                        strokeColor="#5624d0" 
                        trailColor="#d1d7dc"
                        strokeWidth={6}
                        style={{ flex: 1, margin: 0 }}
                      />
                      <Text style={{ color: '#1c1d1f', fontWeight: 600, fontSize: '14px' }}>
                        {learningCourse.progressPercentage || 0}% hoàn thành
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}

        {/* My Courses Grid */}
        <div style={{ paddingBottom: '32px' }}>
          <Title level={2} style={{ fontSize: '24px', fontWeight: 700, color: '#1c1d1f', marginBottom: '24px' }}>
            Khóa học của tôi
          </Title>
          
          <Row gutter={[16, 32]}>
            {myCourses?.length > 0 ? myCourses.map((course, index) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={course.courseId || index}>
                <div 
                  className="my-course-card"
                  onClick={() => navigate(`/user/learning/${course.courseId}`)}
                >
                  <div className="course-image-container">
                    <img 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x170?text=No+Image'; }}
                      alt="course" 
                      src={course.thumbnailUrl || 'https://via.placeholder.com/300'} 
                    />
                    <div className="course-overlay">
                      <PlayCircleFilled className="play-icon" />
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <Title level={4} className="course-title" ellipsis={{ rows: 2 }}>
                      {course.courseName}
                    </Title>
                    <Text className="course-instructor" ellipsis>
                      {course.instructorName || 'Giảng viên EduFlow'}
                    </Text>

                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <Progress 
                        percent={course.progressPercentage} 
                        showInfo={false} 
                        strokeColor={course.progressPercentage === 100 ? '#10b981' : '#5624d0'}
                        trailColor="#d1d7dc"
                        strokeWidth={4}
                        style={{ marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '12px', color: '#1c1d1f', fontWeight: 600 }}>
                          {course.progressPercentage}% hoàn thành
                        </Text>
                        {course.progressPercentage === 100 && (
                           <CheckCircleFilled style={{ color: '#10b981', fontSize: '16px' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            )) : (
              <Col span={24}>
                <div style={{ padding: '64px 0', textAlign: 'center', border: '1px solid #d1d7dc', backgroundColor: '#f7f9fa' }}>
                  <Title level={4} style={{ color: '#1c1d1f', marginBottom: '8px' }}>Bạn chưa đăng ký khóa học nào</Title>
                  <Text style={{ color: '#6a6f73', fontSize: '16px', display: 'block', marginBottom: '24px' }}>
                    Khám phá hàng ngàn khóa học đang chờ bạn.
                  </Text>
                  <Button type="primary" size="large" onClick={() => navigate('/user/courses')} style={{ backgroundColor: '#1c1d1f', borderColor: '#1c1d1f', fontWeight: 700, borderRadius: '0' }}>
                    Khám phá ngay
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </div>
      
      {/* Styles for Premium Look */}
      <style>{`
        /* Recommended Course Card */
        .course-card-premium {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.2s ease;
          border-radius: 0;
          background: transparent;
        }
        .course-card-premium:hover {
          transform: translateY(-2px);
        }
        .course-card-premium:hover .course-overlay {
          opacity: 1;
        }

        /* My Course Card */
        .my-course-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #d1d7dc;
          transition: all 0.2s ease;
        }
        .my-course-card:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08);
        }
        .my-course-card:hover .course-overlay {
          opacity: 1;
        }

        /* Image Container */
        .course-image-container {
          position: relative;
          padding-top: 56.25%;
          border: 1px solid #d1d7dc;
          background-color: #f7f9fa;
          overflow: hidden;
        }
        .course-card-premium .course-image-container {
          border: 1px solid transparent;
          border-bottom: 1px solid #d1d7dc;
        }
        .course-image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .course-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(28,29,31,0.2);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .play-icon {
          font-size: 48px;
          color: #fff;
          opacity: 0.9;
        }

        /* Content */
        .course-content {
          margin-top: 8px;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 4px;
        }
        .my-course-card .course-content {
          padding: 16px;
        }
        .course-title {
          margin: 0 0 4px 0 !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #1c1d1f !important;
          line-height: 1.4 !important;
        }
        .course-instructor {
          color: #6a6f73;
          font-size: 12px;
          display: block;
          margin-bottom: 4px;
        }
        .course-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
        }
        .rating-score {
          color: #b4690e;
          font-weight: 700;
          font-size: 14px;
        }
        .stars {
          color: #b4690e;
          font-size: 12px;
          display: flex;
          gap: 2px;
        }
        .rating-count {
          color: #6a6f73;
          font-size: 12px;
        }
        .course-price {
          font-weight: 700;
          color: #1c1d1f;
          font-size: 16px;
          margin-top: 4px;
        }
        .course-badge {
          background-color: #eceb98;
          color: #3d3c0a;
          font-weight: 700;
          font-size: 12px;
          padding: 4px 8px;
          align-self: flex-start;
          margin-top: 8px;
        }

        /* Active Course */
        .active-course-premium {
          border: 1px solid #d1d7dc;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;
        }
        .active-course-premium:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08);
        }
        .active-image-container {
          position: relative;
          height: 100%;
          min-height: 200px;
          border-right: 1px solid #d1d7dc;
        }
        @media (max-width: 768px) {
          .active-image-container {
            border-right: none;
            border-bottom: 1px solid #d1d7dc;
          }
        }
        .active-image-container img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .active-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .active-overlay .anticon {
          font-size: 64px;
          color: #fff;
          opacity: 0.9;
        }
        .btn-continue {
          background-color: #a435f0;
          border-color: #a435f0;
          border-radius: 0;
          font-weight: 700;
        }
        .btn-continue:hover {
          background-color: #8710d8 !important;
          border-color: #8710d8 !important;
        }
      `}</style>
    </UserLayout>
  );
};

export default UserDashboardPage;
