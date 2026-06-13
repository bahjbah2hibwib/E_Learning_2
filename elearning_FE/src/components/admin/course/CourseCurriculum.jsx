import React, { useState } from 'react';
import { Typography, Collapse, List, Tag, Empty, Space, Tooltip, Modal, Button } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, VideoCameraOutlined, FilePdfOutlined, FormOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CourseCurriculum = ({ curriculum }) => {
  const [previewModal, setPreviewModal] = useState({ visible: false, type: '', title: '', data: null });

  const openPreview = (type, lessonTitle, data) => {
    setPreviewModal({ visible: true, type, title: lessonTitle, data });
  };

  const closePreview = () => {
    setPreviewModal({ visible: false, type: '', title: '', data: null });
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Khóa học này chưa có bài giảng nào" />
      </div>
    );
  }

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
                <List.Item style={{ padding: '12px 16px', borderBottom: lessonIdx === section.lessons.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <List.Item.Meta
                    avatar={
                      lesson.type === 'VIDEO' ? 
                        <PlayCircleOutlined style={{ color: '#3b82f6', fontSize: '20px' }} /> : 
                        <FileTextOutlined style={{ color: '#10b981', fontSize: '20px' }} />
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
                      <Space size="large" style={{ marginTop: '4px' }}>
                        <Tooltip title="Xem thử Video">
                          <div style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.3s' }} onClick={() => openPreview('VIDEO', lesson.title, lesson.videos)} onMouseOver={e => e.currentTarget.style.background = '#eff6ff'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                              <VideoCameraOutlined style={{ color: '#3b82f6' }} /> {lesson.videoCount || 0} Video
                            </Space>
                          </div>
                        </Tooltip>
                        <Tooltip title="Xem trước tài liệu">
                          <div style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.3s' }} onClick={() => openPreview('DOC', lesson.title, lesson.documents)} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                              <FilePdfOutlined style={{ color: '#ef4444' }} /> {lesson.documentCount || 0} Tài liệu
                            </Space>
                          </div>
                        </Tooltip>
                        <Tooltip title="Làm thử bài tập">
                          <div style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.3s' }} onClick={() => openPreview('QUIZ', lesson.title, lesson.quizzes)} onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                              <FormOutlined style={{ color: '#10b981' }} /> {lesson.quizCount || 0} Bài tập
                            </Space>
                          </div>
                        </Tooltip>
                        <Tooltip title="Thời lượng ước tính">
                          <Space size={4} style={{ color: '#64748b', fontSize: '12px' }}>
                            <ClockCircleOutlined style={{ color: '#f59e0b' }} /> {lesson.duration || '15'} phút
                          </Space>
                        </Tooltip>
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
          <Space>
            {previewModal.type === 'VIDEO' && <VideoCameraOutlined style={{ color: '#3b82f6' }} />}
            {previewModal.type === 'DOC' && <FilePdfOutlined style={{ color: '#ef4444' }} />}
            {previewModal.type === 'QUIZ' && <FormOutlined style={{ color: '#10b981' }} />}
            <Text style={{ fontSize: '16px' }}>{previewModal.title}</Text>
          </Space>
        }
        open={previewModal.visible}
        onCancel={closePreview}
        footer={[
          <Button key="close" onClick={closePreview} size="large">Đóng</Button>
        ]}
        width={700}
        destroyOnClose
      >
        {previewModal.type === 'VIDEO' && (
          <div>
            {previewModal.data && previewModal.data.length > 0 ? previewModal.data.map((video, idx) => {
              const videoSrc = video.videoUrl?.startsWith('http') ? video.videoUrl : `http://localhost:9000/elearning/${video.videoUrl}`;
              return (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <Title level={5}>{video.title}</Title>
                  <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
                    <video 
                      src={videoSrc} 
                      controls 
                      autoPlay 
                      style={{ width: '100%', display: 'block', maxHeight: '60vh' }}
                    >
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  </div>
                </div>
              );
            }) : <Empty description="Chưa có video nào cho bài học này" />}
          </div>
        )}
        
        {previewModal.type === 'DOC' && (
          <div>
            {previewModal.data && previewModal.data.length > 0 ? previewModal.data.map((doc, idx) => {
              const docSrc = doc.fileUrl?.startsWith('http') ? doc.fileUrl : `http://localhost:9000/elearning/${doc.fileUrl}`;
              return (
                <div key={idx} style={{ background: '#f8fafc', padding: '40px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', marginTop: '16px' }}>
                  <FilePdfOutlined style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
                  <br />
                  <Title level={5} style={{ margin: 0 }}>{doc.fileName || doc.title}</Title>
                  <div style={{ marginTop: '24px' }}>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<FilePdfOutlined />}
                      href={docSrc}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tải xuống tài liệu
                    </Button>
                  </div>
                </div>
              );
            }) : <Empty description="Chưa có tài liệu đính kèm" />}
          </div>
        )}

        {previewModal.type === 'QUIZ' && (
          <div>
            {previewModal.data && previewModal.data.length > 0 ? previewModal.data.map((quiz, idx) => (
              <div key={idx} style={{ padding: '20px 0', marginTop: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <Title level={4} style={{ color: '#1e293b' }}>{quiz.title}</Title>
                {quiz.questions && quiz.questions.map((question, qIdx) => (
                  <div key={qIdx} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Tag color="blue">Câu {qIdx + 1}/{quiz.questions.length}</Tag>
                    </div>
                    <Title level={5} style={{ marginBottom: '24px' }}>{question.questionText}</Title>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {question.answers && question.answers.map((answer, aIdx) => (
                        <Button key={aIdx} block style={{ textAlign: 'left', padding: '16px', height: 'auto', borderRadius: '8px', borderColor: '#e2e8f0', display: 'flex', alignItems: 'flex-start' }}>
                          <strong style={{ marginRight: '8px', color: '#3b82f6' }}>{String.fromCharCode(65 + aIdx)}.</strong> {answer.answerText}
                        </Button>
                      ))}
                    </Space>
                  </div>
                ))}
              </div>
            )) : <Empty description="Chưa có bài tập nào" />}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseCurriculum;
