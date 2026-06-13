import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Card, Button, Space, Spin, message, Breadcrumb, Collapse, List, Avatar, Divider, Tag
} from 'antd';
import { 
  StarFilled, 
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import UserLayout from '../../layouts/UserLayout';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import { useParams, useNavigate, Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
    checkEnrollmentStatus();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await courseService.getPublicCourseDetail(id);
      if (res && res.success) {
        setCourse(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết khóa học:", error);
      message.error("Không thể tải thông tin khóa học hoặc khóa học không tồn tại.");
      navigate('/user/courses');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        const res = await userService.getUserCourses(user.userId);
        if (res && res.success) {
          const enrolled = res.data.some(c => c.courseId === Number(id));
          setIsEnrolled(enrolled);
        }
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái đăng ký:", error);
    }
  };

  const handleEnroll = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
      message.warning("Vui lòng đăng nhập để đăng ký khóa học");
      navigate('/login');
      return;
    }
    
    // Điều hướng sang trang thanh toán thay vì gọi API đăng ký ngay
    navigate(`/user/checkout/${id}`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" />
        </div>
      </UserLayout>
    );
  }

  if (!course) return null;

  // Tính tổng số lượng bài học, video
  let totalLessons = 0;
  let totalVideos = 0;
  let totalDuration = 0;

  course.sections?.forEach(s => {
    if (s.lessons) {
      totalLessons += s.lessons.length;
      s.lessons.forEach(l => {
        totalVideos += l.videoCount || 0;
        totalDuration += l.durationMinutes || 0;
      });
    }
  });

  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const durationText = hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;

  return (
    <UserLayout>
      <div style={{ padding: '0 16px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Breadcrumb */}
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/user/dashboard">Dashboard</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/user/courses">Khóa học</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{course.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[32, 32]}>
          {/* Main Content (Left) */}
          <Col xs={24} lg={16}>
            <Title level={1} style={{ marginBottom: '16px' }}>{course.title}</Title>
            <Paragraph style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>
              {course.description || "Khóa học này sẽ cung cấp cho bạn những kiến thức từ cơ bản đến nâng cao, giúp bạn tự tin ứng dụng vào thực tế."}
            </Paragraph>

            <Space size="large" style={{ marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ fontSize: '16px', color: '#6b7280' }} />
                <Text>{course.totalStudents || 0} học viên</Text>
              </div>
            </Space>

            {/* What you will learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.trim() !== '' && (
              <Card title="Những gì bạn sẽ học được" style={{ marginBottom: '32px', borderRadius: '12px' }} bordered={false} className="shadow-sm">
                <Row gutter={[16, 16]}>
                  {course.whatYouWillLearn.split('\n').filter(item => item.trim() !== '').map((item, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CheckCircleOutlined style={{ color: '#10b981', marginTop: '4px', fontSize: '16px' }} />
                        <Text style={{ fontSize: '15px' }}>{item}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Curriculum */}
            <div style={{ marginBottom: '32px' }}>
              <Title level={3} style={{ marginBottom: '16px' }}>Nội dung khóa học</Title>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#6b7280' }}>
                <Text>{course.sections?.length || 0} chương • {totalLessons} bài học • Thời lượng {durationText}</Text>
              </div>

              <Collapse defaultActiveKey={['0']} expandIconPosition="end" style={{ borderRadius: '8px', background: '#fff' }}>
                {course.sections?.map((section, idx) => (
                  <Panel 
                    header={<Text strong>{`Chương ${idx + 1}: ${section.title}`}</Text>} 
                    key={idx.toString()}
                    extra={<Text type="secondary">{section.lessons?.length || 0} bài học</Text>}
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={section.lessons}
                      renderItem={lesson => (
                        <List.Item
                          style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                          actions={[<Text type="secondary">{lesson.durationMinutes ? `${lesson.durationMinutes} phút` : ''}</Text>]}
                        >
                          <List.Item.Meta
                            avatar={<PlayCircleOutlined style={{ fontSize: '18px', color: '#3b82f6', marginTop: '4px' }} />}
                            title={<Text style={{ fontSize: '15px' }}>{lesson.title}</Text>}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>
            </div>

            {/* Instructor */}
            <div>
              <Title level={3} style={{ marginBottom: '24px' }}>Giảng viên</Title>
              <Card bordered={false} className="shadow-sm" style={{ borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <Avatar size={100} icon={<UserOutlined />} src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" />
                  <div>
                    <Title level={4} style={{ margin: '0 0 8px 0', color: '#2563eb' }}>{course.instructorName || 'Đang cập nhật'}</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>Chuyên gia / Kỹ sư phần mềm cấp cao</Text>
                    <Space size="middle" style={{ marginBottom: '12px' }}>
                      <Text><UserOutlined /> {course.totalStudents || 0} Học viên</Text>
                    </Space>
                    <Paragraph style={{ margin: 0, color: '#4b5563' }}>
                      Là một chuyên gia có nhiều năm kinh nghiệm thực chiến trong ngành công nghiệp. 
                      Giảng viên luôn mang đến những bài giảng dễ hiểu, bám sát thực tế và sẵn sàng hỗ trợ học viên giải đáp mọi thắc mắc.
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </div>

          </Col>

          {/* Sidebar (Right) */}
          <Col xs={24} lg={8}>
            <div style={{ 
              position: 'sticky', 
              top: '20px',
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9'
            }}>
              {/* Thumbnail */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }} style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{ background: '#f1f5f9', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: '48px', color: '#cbd5e1' }} />
                  </div>
                )}
                {/* Play Overlay */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <PlayCircleOutlined style={{ fontSize: '64px', color: '#fff' }} />
                </div>
              </div>

              {/* Price & Action */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: '0 0 16px 0', color: '#111827' }}>
                  {course.isFree ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} VND`}
                </Title>

                {isEnrolled ? (
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    icon={<CheckCircleFilled />}
                    onClick={() => navigate('/user/dashboard')}
                    style={{ 
                      height: '50px', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      borderRadius: '8px',
                      background: '#10b981',
                      borderColor: '#10b981'
                    }}
                  >
                    Đã đăng ký - Vào học
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    loading={enrollLoading}
                    onClick={handleEnroll}
                    style={{ 
                      height: '50px', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      borderRadius: '8px',
                      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                      border: 'none'
                    }}
                  >
                    Đăng ký ngay
                  </Button>
                )}
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
                  Đăng ký để truy cập trọn đời
                </Text>
              </div>

              <Divider />

              {/* Course Includes */}
              <div>
                <Title level={5} style={{ marginBottom: '16px' }}>Khóa học bao gồm:</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <VideoCameraOutlined style={{ fontSize: '16px', color: '#64748b' }} />
                    <Text>{durationText} video bài giảng</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileTextOutlined style={{ fontSize: '16px', color: '#64748b' }} />
                    <Text>{course.sections?.length || 0} bài tập thực hành</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TrophyOutlined style={{ fontSize: '16px', color: '#64748b' }} />
                    <Text>Truy cập không giới hạn</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '16px', color: '#64748b' }} />
                    <Text>Giấy chứng nhận hoàn thành</Text>
                  </div>
                </Space>
              </div>

            </div>
          </Col>
        </Row>
      </div>

      <style jsx="true">{`
        .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
      `}</style>
    </UserLayout>
  );
};

export default CourseDetailPage;
