import React, { useState } from 'react';
import { Typography, Collapse, List, Tag, Empty, Space, Modal, Button, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  FileTextOutlined, 
  VideoCameraOutlined, 
  FilePdfOutlined, 
  FormOutlined, 
  ClockCircleOutlined,
  FolderOpenOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CourseCurriculum = ({ curriculum }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);

  const openLessonDetail = (lesson) => {
    setSelectedLesson(lesson);
  };

  const closeLessonDetail = () => {
    setSelectedLesson(null);
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Khóa học này chưa có bài giảng nào" />
      </div>
    );
  }

  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    return (
      <div style={{ padding: '8px 0' }}>
        <Row gutter={[32, 24]}>
          {/* CỘT TRÁI: VIDEO VÀ BÀI TẬP */}
          <Col xs={24} lg={17}>
            {/* Video Player Area */}
            <div style={{ 
              background: '#0f172a', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              aspectRatio: '16/9',
              position: 'relative',
              marginBottom: '32px'
            }}>
              {selectedLesson.videos && selectedLesson.videos.length > 0 ? (
                <video 
                  src={selectedLesson.videos[0].videoUrl?.startsWith('http') ? selectedLesson.videos[0].videoUrl : `http://localhost:9000/elearning/${selectedLesson.videos[0].videoUrl}`}
                  controls 
                  controlsList="nodownload"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                  <VideoCameraOutlined style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }} />
                  <Text style={{ color: '#94a3b8', fontSize: '16px' }}>Bài học này không có Video</Text>
                </div>
              )}
            </div>

            {/* Quizzes Area */}
            <div>
              <Title level={4} style={{ color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FormOutlined style={{ color: '#8b5cf6' }} /> Bài tập thực hành
              </Title>
              
              {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 ? selectedLesson.quizzes.map((quiz, idx) => (
                <div key={idx} style={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '24px',
                  marginBottom: '20px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <Title level={5} style={{ color: '#334155', marginBottom: '24px' }}>{quiz.title}</Title>
                  {quiz.questions && quiz.questions.map((question, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: qIdx === quiz.questions.length - 1 ? 0 : '32px' }}>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ background: '#f8fafc', color: '#475569', fontWeight: 'bold', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                          {qIdx + 1}
                        </div>
                        <Text style={{ fontSize: '15px', color: '#1e293b', fontWeight: 500, marginTop: '4px' }}>{question.questionText}</Text>
                      </div>
                      <div style={{ paddingLeft: '48px' }}>
                        <Row gutter={[12, 12]}>
                          {question.answers && question.answers.map((answer, aIdx) => (
                            <Col span={24} sm={12} key={aIdx}>
                              <div style={{ 
                                padding: '12px 16px', 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '8px',
                                display: 'flex',
                                gap: '12px',
                                transition: 'all 0.2s',
                                cursor: 'default'
                              }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f1f5f9'; }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                              >
                                <div style={{ color: '#64748b', fontWeight: 600 }}>{String.fromCharCode(65 + aIdx)}.</div>
                                <Text style={{ color: '#334155' }}>{answer.answerText}</Text>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  ))}
                </div>
              )) : (
                <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bài học này chưa có bài tập trắc nghiệm" />
                </div>
              )}
            </div>
          </Col>

          {/* CỘT PHẢI: TÀI LIỆU & THÔNG TIN */}
          <Col xs={24} lg={7}>
            <div style={{ position: 'sticky', top: '0' }}>
              {/* Tài liệu đính kèm */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: '12px', 
                padding: '24px', 
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
              }}>
                <Title level={5} style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <FolderOpenOutlined style={{ color: '#3b82f6' }} /> Tài nguyên bài học
                </Title>
                
                {selectedLesson.documents && selectedLesson.documents.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLesson.documents}
                    renderItem={(doc, idx) => {
                      const docSrc = doc.fileUrl?.startsWith('http') ? doc.fileUrl : `http://localhost:9000/elearning/${doc.fileUrl}`;
                      return (
                        <List.Item 
                          style={{ 
                            padding: '12px', 
                            background: '#fff', 
                            borderRadius: '8px', 
                            marginBottom: idx === selectedLesson.documents.length - 1 ? 0 : '12px', 
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.borderColor = '#93c5fd'}
                          onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                          <List.Item.Meta
                            avatar={<div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FilePdfOutlined style={{ fontSize: '20px', color: '#ef4444' }} /></div>}
                            title={<Text style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }} ellipsis={{ tooltip: doc.fileName || doc.title }}>{doc.fileName || doc.title}</Text>}
                            description={
                              <a href={docSrc} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                <DownloadOutlined /> Tải xuống
                              </a>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#94a3b8' }}>Không có tài liệu</span>} />
                )}
              </div>

              {/* Thông tin tổng quan */}
              <div style={{ padding: '0 8px' }}>
                <Title level={5} style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', textTransform: 'uppercase' }}>Thông tin tổng quan</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Trạng thái:</Text>
                    <Tag color={selectedLesson.isFreePreview ? 'green' : 'blue'} style={{ margin: 0, borderRadius: '4px', fontWeight: 500 }}>
                      {selectedLesson.isFreePreview ? 'Học thử miễn phí' : 'Khóa'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Thời lượng video:</Text>
                    <Text strong style={{ color: '#334155' }}>{selectedLesson.duration || 0} phút</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Số lượng bài tập:</Text>
                    <Text strong style={{ color: '#334155' }}>{selectedLesson.quizzes?.length || 0} bài</Text>
                  </div>
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%' }}>
      <Title level={5} style={{ marginBottom: '20px' }}>Nội dung bài giảng</Title>
      
      <Collapse defaultActiveKey={['0']} ghost expandIconPosition="end">
        {curriculum.map((section, index) => (
          <Panel 
            header={<Text strong style={{ fontSize: '16px' }}>Chương {index + 1}: {section.title}</Text>} 
            key={index.toString()}
            style={{ backgroundColor: '#f8fafc', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={section.lessons || []}
              renderItem={(lesson, lessonIdx) => (
                <List.Item 
                  onClick={() => openLessonDetail(lesson)}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: lessonIdx === section.lessons.length - 1 ? 'none' : '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <List.Item.Meta
                    avatar={
                      lesson.type === 'VIDEO' ? 
                        <PlayCircleOutlined style={{ color: '#3b82f6', fontSize: '20px', marginTop: '4px' }} /> : 
                        <FileTextOutlined style={{ color: '#10b981', fontSize: '20px', marginTop: '4px' }} />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <Text style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                          {lesson.title}
                        </Text>
                        <Tag color={lesson.isFreePreview ? 'green' : 'default'} style={{ margin: 0, borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                          {lesson.isFreePreview ? 'Học thử' : (lesson.duration ? `${lesson.duration} phút` : 'Khóa')}
                        </Tag>
                      </div>
                    }
                    description={
                      <Space size="middle" style={{ marginTop: '4px' }}>
                        <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                          <VideoCameraOutlined style={{ color: '#3b82f6' }} /> {lesson.videoCount || 0} Video
                        </Space>
                        <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                          <FilePdfOutlined style={{ color: '#ef4444' }} /> {lesson.documentCount || 0} Tài liệu
                        </Space>
                        <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                          <FormOutlined style={{ color: '#10b981' }} /> {lesson.quizCount || 0} Bài tập
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>

      <Modal
        title={
          selectedLesson ? (
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', paddingTop: '8px' }}>
              <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
                {selectedLesson.title}
              </Title>
            </div>
          ) : 'Chi tiết bài học'
        }
        open={!!selectedLesson}
        onCancel={closeLessonDetail}
        footer={null}
        width={1300}
        destroyOnClose
        centered
        bodyStyle={{ padding: '0 24px 24px 24px', maxHeight: '85vh', overflowY: 'auto', overflowX: 'hidden' }}
        closeIcon={<div style={{ background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</div>}
      >
        {renderLessonContent()}
      </Modal>
    </div>
  );
};

export default CourseCurriculum;
