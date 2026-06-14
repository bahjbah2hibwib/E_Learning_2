import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Typography, Progress, Button, Spin, message, Space, Breadcrumb, Divider, Radio, Card
} from 'antd';
import { 
  PlayCircleOutlined, 
  FileTextOutlined, 
  CheckCircleFilled, 
  LeftOutlined,
  CheckOutlined,
  DownloadOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const LearningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  useEffect(() => {
    fetchLearningData();
  }, [id]);

  const fetchLearningData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.userId) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const res = await userService.getLearningData(user.userId, id);
      if (res && res.success) {
        const { course, completedLessonIds } = res.data;
        setCourseData(course);
        setCompletedLessons(completedLessonIds || []);
        
        // Find first incomplete lesson or just first lesson to set active
        if (course.sections && course.sections.length > 0) {
          let found = false;
          for (const section of course.sections) {
            if (section.lessons && section.lessons.length > 0) {
              for (const lesson of section.lessons) {
                if (!completedLessonIds?.includes(lesson.lessonId)) {
                  setActiveLesson(lesson);
                  setActiveModule(section);
                  found = true;
                  break;
                }
              }
            }
            if (found) break;
          }
          if (!found) {
            // All completed, set the first one
            setActiveLesson(course.sections[0].lessons[0]);
            setActiveModule(course.sections[0]);
          }
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu bài học");
      navigate('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await userService.completeLesson(user.userId, activeLesson.lessonId);
      if (res && res.success) {
        message.success("Đã hoàn thành bài học!");
        setCompletedLessons([...completedLessons, activeLesson.lessonId]);
        goToNextLesson();
      }
    } catch (error) {
      message.error("Lỗi khi đánh dấu hoàn thành");
    }
  };

  const goToNextLesson = () => {
    if (!courseData?.sections) return;
    
    let currentFound = false;
    for (const section of courseData.sections) {
      for (const lesson of section.lessons || []) {
        if (currentFound) {
          setActiveLesson(lesson);
          setActiveModule(section);
          setSelectedAnswers({});
          setQuizResults({});
          return;
        }
        if (lesson.lessonId === activeLesson.lessonId) {
          currentFound = true;
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <Spin size="large" tip="Đang tải bài học..." />
      </div>
    );
  }

  if (!courseData) return null;

  const totalLessons = courseData.sections?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);

  // Generate Menu Items for Sidebar
  const menuItems = courseData.sections?.map((section, index) => ({
    key: `section-${section.sectionId}`,
    label: (
      <div style={{ padding: '8px 0' }}>
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
          MODULE {index + 1}: NỀN TẢNG
        </Text>
        <Text strong style={{ fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.4' }}>{section.title}</Text>
      </div>
    ),
    children: section.lessons?.map((lesson, idx) => {
      const isCompleted = completedLessons.includes(lesson.lessonId);
      const isActive = activeLesson?.lessonId === lesson.lessonId;
      
      let icon = <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1', marginTop: 4 }}></div>;
      if (isCompleted) {
        icon = <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 4 }} />;
      } else if (isActive) {
        icon = <PlayCircleOutlined style={{ color: '#3b82f6', fontSize: 16, marginTop: 4 }} />;
      }

      return {
        key: `lesson-${lesson.lessonId}`,
        label: (
          <div style={{ display: 'flex', gap: '12px', padding: '8px 0', alignItems: 'flex-start' }} onClick={() => { setActiveLesson(lesson); setActiveModule(section); setSelectedAnswers({}); setQuizResults({}); }}>
            {icon}
            <div>
              <Text strong={isActive} style={{ color: isActive ? '#1e293b' : '#64748b', display: 'block', whiteSpace: 'normal', lineHeight: '1.4' }}>
                {idx + 1}. {lesson.title}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {lesson.lessonType === 'VIDEO' ? <><PlayCircleOutlined /> {lesson.durationMinutes || 0} phút</> : <><FileTextOutlined /> Bài đọc</>}
              </Text>
            </div>
          </div>
        )
      };
    }) || []
  })) || [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={350} 
        theme="light" 
        collapsed={collapsed}
        collapsedWidth={0}
        style={{ borderRight: '1px solid #e2e8f0', height: '100vh', overflow: 'auto' }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <Button type="link" icon={<LeftOutlined />} onClick={() => navigate(`/user/courses/${id}`)} style={{ padding: 0, marginBottom: '16px', color: '#3b82f6' }}>
            Tổng quan khóa học
          </Button>
          <Title level={4} style={{ margin: '0 0 16px 0', color: '#1e293b' }}>{courseData.title}</Title>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>TIẾN ĐỘ KHÓA HỌC</Text>
            <Text strong style={{ color: '#3b82f6' }}>{progressPercent}%</Text>
          </div>
          <Progress percent={progressPercent} showInfo={false} strokeColor="#3b82f6" trailColor="#f1f5f9" />
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
            {completedLessons.length} trên {totalLessons} bài học đã hoàn thành
          </Text>
        </div>

        <Menu
          mode="inline"
          defaultOpenKeys={courseData.sections?.map(s => `section-${s.sectionId}`)}
          selectedKeys={[`lesson-${activeLesson?.lessonId}`]}
          items={menuItems}
          style={{ borderRight: 'none' }}
          className="learning-menu"
        />
        <style>
          {`
            .learning-menu .ant-menu-item {
              height: auto !important;
              line-height: normal !important;
              padding-top: 12px !important;
              padding-bottom: 12px !important;
              white-space: normal !important;
            }
            .learning-menu .ant-menu-submenu-title {
              height: auto !important;
              line-height: normal !important;
              padding-top: 12px !important;
              padding-bottom: 12px !important;
              white-space: normal !important;
            }
            .learning-menu .ant-menu-item-selected {
              background-color: #eff6ff !important;
            }
          `}
        </style>
      </Sider>

      <Layout>
        <Content style={{ background: '#f8fafc', height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Toggle */}
          <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '18px' }} />
          </div>

          <div style={{ flex: 1, padding: '32px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            
            {/* Video Player Area */}
            {activeLesson?.lessonType === 'VIDEO' ? (
              <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 {activeLesson.videos && activeLesson.videos.length > 0 ? (
                    <video 
                      controls 
                      controlsList="nodownload"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}
                      src={activeLesson.videos[0].videoUrl?.startsWith('http') ? activeLesson.videos[0].videoUrl : `http://localhost:9000/elearning/${activeLesson.videos[0].videoUrl}`}
                    >
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                 ) : (
                   <div style={{ color: '#fff', textAlign: 'center' }}>
                      <PlayCircleOutlined style={{ fontSize: '64px', color: '#3b82f6', marginBottom: '16px', cursor: 'pointer' }} />
                      <Title level={4} style={{ color: '#fff', margin: 0 }}>{activeLesson.title}</Title>
                   </div>
                 )}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', marginBottom: '32px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '16px', background: '#eff6ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FileTextOutlined style={{ fontSize: 32, color: '#3b82f6' }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: '0 0 8px 0' }}>Tài liệu đọc</Title>
                  <Text type="secondary">Hãy đọc kỹ tài liệu này trước khi tiếp tục làm bài kiểm tra.</Text>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <Space style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                      {activeLesson?.lessonType === 'VIDEO' ? 'BÀI HỌC VIDEO' : 'BÀI ĐỌC'}
                    </div>
                    <Text type="secondary">Module {courseData.sections?.findIndex(s => s.sectionId === activeModule?.sectionId) + 1}</Text>
                  </Space>
                  <Title level={2} style={{ margin: '0 0 16px 0', color: '#1e293b' }}>{activeLesson?.title}</Title>
                  <Paragraph style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6' }}>
                    Trong bài học này, chúng ta sẽ tìm hiểu về {activeLesson?.title}. Đây là một kiến thức rất quan trọng trong tổng quan {activeModule?.title}.
                  </Paragraph>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                  {!completedLessons.includes(activeLesson?.lessonId) ? (
                    <Button type="primary" size="large" icon={<CheckOutlined />} onClick={handleCompleteLesson} style={{ background: '#1d4ed8', borderRadius: '8px', fontWeight: 600 }}>
                      Đánh dấu hoàn thành
                    </Button>
                  ) : (
                    <Button size="large" disabled style={{ background: '#f1f5f9', color: '#10b981', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
                      <CheckCircleFilled /> Đã hoàn thành
                    </Button>
                  )}
                  <Button size="large" onClick={goToNextLesson} style={{ borderRadius: '8px', fontWeight: 500 }}>
                    Bài tiếp theo
                  </Button>
                </div>
              </div>

              <Divider style={{ margin: '32px 0' }} />
              
              {/* Real Content for Reading */}
              {activeLesson?.description ? (
                <div 
                  style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8' }} 
                  dangerouslySetInnerHTML={{ __html: activeLesson.description }}
                />
              ) : (
                <div style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8' }}>
                  <Title level={4}>Nội dung chi tiết</Title>
                  <Paragraph>
                    Giảng viên chưa cập nhật nội dung chi tiết cho bài học này.
                  </Paragraph>
                </div>
              )}

              {/* Attachments */}
              {activeLesson?.documents && activeLesson.documents.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                  <Title level={5} style={{ marginBottom: '16px' }}>Tài liệu đính kèm ({activeLesson.documents.length})</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {activeLesson.documents.map((doc) => (
                      <div key={doc.documentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Space>
                          <FileTextOutlined style={{ fontSize: '20px', color: '#64748b' }} />
                          <Text strong style={{ color: '#334155' }}>{doc.title || doc.fileName}</Text>
                        </Space>
                        <Button type="link" icon={<DownloadOutlined />} href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `http://localhost:9000/elearning/${doc.fileUrl}`} target="_blank">
                          Tải xuống
                        </Button>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Quizzes / Exercises */}
              {activeLesson?.quizzes && activeLesson.quizzes.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                  <Title level={5} style={{ marginBottom: '16px' }}>Bài tập / Trắc nghiệm ({activeLesson.quizzes.length})</Title>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {activeLesson.quizzes.map((quiz, qzIdx) => (
                      <Card key={quiz.quizId} title={quiz.title} bordered={true} style={{ borderColor: '#e2e8f0' }}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {quiz.questions?.map((question, qIdx) => (
                            <div key={question.questionId} style={{ marginBottom: '16px' }}>
                              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                Câu {qIdx + 1}: {question.questionText}
                              </Text>
                              <Radio.Group 
                                onChange={(e) => {
                                  setSelectedAnswers({
                                    ...selectedAnswers,
                                    [question.questionId]: e.target.value
                                  });
                                }} 
                                value={selectedAnswers[question.questionId]}
                                style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}
                              >
                                {question.answers?.map((ans) => {
                                  let style = {};
                                  if (quizResults[quiz.quizId]) {
                                    if (ans.isCorrect) style = { color: '#10b981', fontWeight: 'bold' };
                                    else if (selectedAnswers[question.questionId] === ans.answerId && !ans.isCorrect) {
                                      style = { color: '#ef4444', textDecoration: 'line-through' };
                                    }
                                  }
                                  return (
                                    <Radio key={ans.answerId} value={ans.answerId} style={style}>
                                      {ans.answerText}
                                    </Radio>
                                  );
                                })}
                              </Radio.Group>
                            </div>
                          ))}
                          <Button 
                            type="primary" 
                            onClick={() => {
                              // Chấm điểm quiz này
                              let correctCount = 0;
                              quiz.questions?.forEach(q => {
                                const selectedId = selectedAnswers[q.questionId];
                                const correctAns = q.answers?.find(a => a.isCorrect);
                                if (correctAns && selectedId === correctAns.answerId) {
                                  correctCount++;
                                }
                              });
                              setQuizResults({
                                ...quizResults,
                                [quiz.quizId]: { checked: true, score: correctCount, total: quiz.questions?.length || 0 }
                              });
                              message.info(`Bạn đã làm đúng ${correctCount}/${quiz.questions?.length || 0} câu.`);
                            }}
                            disabled={quizResults[quiz.quizId]?.checked}
                          >
                            Kiểm tra kết quả
                          </Button>
                          {quizResults[quiz.quizId]?.checked && (
                            <Text strong style={{ color: quizResults[quiz.quizId].score === quizResults[quiz.quizId].total ? '#10b981' : '#f59e0b' }}>
                              Kết quả: {quizResults[quiz.quizId].score} / {quizResults[quiz.quizId].total}
                            </Text>
                          )}
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}
            </div>

          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LearningPage;
