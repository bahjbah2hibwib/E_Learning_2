import React, { useState } from 'react';
import { 
  Typography, Button, Card, Row, Col, Collapse, Space, Tooltip, Modal, Form, Input, Select, message, Spin, Upload, Tabs, List, Radio, Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HolderOutlined,
  PlayCircleFilled,
  FileTextFilled,
  QuestionCircleFilled,
  SettingOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import instructorService from '../../../services/instructorService';

const { Text, Title } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

const getLessonIcon = (type) => {
  switch (type) {
    case 'VIDEO':
      return {
        icon: <PlayCircleFilled style={{ color: '#3b82f6', fontSize: '18px' }} />,
        bg: '#eff6ff'
      };
    case 'DOCUMENT':
      return {
        icon: <FileTextFilled style={{ color: '#f97316', fontSize: '18px' }} />,
        bg: '#fff7ed'
      };
    case 'QUIZ':
      return {
        icon: <QuestionCircleFilled style={{ color: '#8b5cf6', fontSize: '18px' }} />,
        bg: '#f5f3ff'
      };
    default:
      return {
        icon: <FileTextFilled style={{ color: '#64748b', fontSize: '18px' }} />,
        bg: '#f1f5f9'
      };
  }
};

const CurriculumTab = ({ courseData, courseId, onRefresh }) => {
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [selectedLessonForSettings, setSelectedLessonForSettings] = useState(null);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [questionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // State cho Modal xem trước video
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');

  const [sectionForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [lessonUpdateForm] = Form.useForm();

  // Danh sách chương học từ API
  const curriculum = courseData?.sections || [];

  // Tính toán tóm tắt
  const totalSections = curriculum.length;
  const totalLessons = curriculum.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);
  const totalQuizzes = curriculum.reduce((acc, sec) => 
    acc + (sec.lessons?.reduce((lessonAcc, lesson) => lessonAcc + (lesson.quizzes?.length || 0), 0) || 0)
  , 0);

  const totalDurationMinutes = curriculum.reduce((acc, sec) => 
    acc + (sec.lessons?.reduce((lessonAcc, lesson) => lessonAcc + (lesson.durationMinutes || 0), 0) || 0)
  , 0);
  
  const totalDurationHours = Math.floor(totalDurationMinutes / 60);
  const remainingMinutes = totalDurationMinutes % 60;
  const durationText = totalDurationHours > 0 
    ? `${totalDurationHours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`
    : `${totalDurationMinutes}m`;

  // Xử lý tạo chương học
  const handleCreateSection = async (values) => {
    try {
      if (!courseId) {
        message.error('Không tìm thấy ID khóa học');
        return;
      }
      setLoading(true);
      await instructorService.createSection(courseId, { title: values.title });
      message.success('Thêm chương mới thành công!');
      setIsSectionModalVisible(false);
      sectionForm.resetFields();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(error.message || 'Lỗi khi tạo chương học');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo bài giảng
  const handleCreateLesson = async (values) => {
    try {
      setLoading(true);
      await instructorService.createLesson(activeSectionId, { 
        title: values.title,
        lessonType: values.lessonType || 'VIDEO'
      });
      message.success('Thêm bài giảng mới thành công!');
      setIsLessonModalVisible(false);
      lessonForm.resetFields();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(error.message || 'Lỗi khi tạo bài giảng');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal thêm bài giảng
  const openLessonModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setIsLessonModalVisible(true);
  };

  const openSettingsModal = (lesson) => {
    setSelectedLessonForSettings(lesson);
    lessonUpdateForm.setFieldsValue({
      title: lesson.title,
      description: lesson.description || ''
    });
    setIsSettingsModalVisible(true);
  };

  const handleUpdateLesson = async (values) => {
    try {
      setLoading(true);
      const res = await instructorService.updateLesson(selectedLessonForSettings.lessonId, values);
      if (res && res.success) {
        message.success('Cập nhật nội dung bài giảng thành công!');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      message.error(error.message || 'Lỗi khi cập nhật bài giảng');
    } finally {
      setLoading(false);
    }
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.max(1, Math.round(video.duration / 60))); // minutes, ít nhất 1 phút
      }
      video.onerror = function() {
        resolve(1); // Mặc định 1 phút nếu lỗi
      }
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUploadVideo = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      // Fake progress
      onProgress({ percent: 50 });
      
      // Lấy duration trước khi upload
      const durationMinutes = await getVideoDuration(file);
      
      // 1. Upload to MinIO
      const uploadRes = await instructorService.uploadFile(file);
      
      if (uploadRes && uploadRes.success) {
        onProgress({ percent: 90 });
        const fileId = uploadRes.data.fileId;
        
        // 2. Attach to Lesson
        const attachRes = await instructorService.addLessonVideo(selectedLessonForSettings.lessonId, {
          fileId: fileId,
          durationMinutes: durationMinutes
        });

        if (attachRes && attachRes.success) {
          onProgress({ percent: 100 });
          onSuccess(attachRes.data);
          message.success('Tải lên video thành công!');
          
          // Update local state to show new video immediately
          setSelectedLessonForSettings(prev => ({
            ...prev,
            videos: [...(prev.videos || []), attachRes.data]
          }));
          
          // Refresh course curriculum
          if (onRefresh) onRefresh();
        } else {
          throw new Error('Failed to attach video');
        }
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error(error);
      onError(error);
      message.error('Lỗi khi tải lên video');
    }
  };

  const handleUploadDocument = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      onProgress({ percent: 50 });
      const uploadRes = await instructorService.uploadFile(file);
      
      if (uploadRes && uploadRes.success) {
        onProgress({ percent: 90 });
        const fileId = uploadRes.data.fileId;
        
        const attachRes = await instructorService.addLessonDocument(selectedLessonForSettings.lessonId, {
          fileId: fileId
        });

        if (attachRes && attachRes.success) {
          onProgress({ percent: 100 });
          onSuccess(attachRes.data);
          message.success('Tải lên tài liệu đính kèm thành công!');
          
          setSelectedLessonForSettings(prev => ({
            ...prev,
            documents: [...(prev.documents || []), attachRes.data]
          }));
          
          if (onRefresh) onRefresh();
        } else {
          throw new Error('Failed to attach document');
        }
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error(error);
      onError(error);
      message.error('Lỗi khi tải lên tài liệu');
    }
  };

  const openQuestionModal = () => {
    questionForm.resetFields();
    questionForm.setFieldsValue({ correctAnswer: 0 }); // Mặc định đáp án A (index 0) là đúng
    setIsQuestionModalVisible(true);
  };

  const handleCreateQuestion = async () => {
    try {
      const values = await questionForm.validateFields();
      
      const payload = {
        questionText: values.questionText,
        questionType: 'MULTIPLE_CHOICE',
        points: 10,
        answers: [
          { answerText: values.answer0, isCorrect: values.correctAnswer === 0 },
          { answerText: values.answer1, isCorrect: values.correctAnswer === 1 },
          { answerText: values.answer2, isCorrect: values.correctAnswer === 2 },
          { answerText: values.answer3, isCorrect: values.correctAnswer === 3 }
        ]
      };

      setLoading(true);
      const res = await instructorService.addLessonQuestion(selectedLessonForSettings.lessonId, payload);
      
      if (res && res.success) {
        message.success('Thêm câu hỏi thành công!');
        setIsQuestionModalVisible(false);
        questionForm.resetFields();
        
        // Update local state by finding the default quiz or creating a placeholder
        setSelectedLessonForSettings(prev => {
          const quizzes = [...(prev.quizzes || [])];
          if (quizzes.length === 0) {
             quizzes.push({ quizId: Date.now(), title: 'Bài tập trắc nghiệm', questions: [res.data] });
          } else {
             quizzes[0].questions = [...(quizzes[0].questions || []), res.data];
          }
          return { ...prev, quizzes };
        });

        if (onRefresh) onRefresh();
      }
    } catch (error) {
      if (!error.errorFields) {
        message.error(error.message || 'Lỗi khi tạo câu hỏi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận xóa chương
  const showDeleteSectionConfirm = (sectionId, e) => {
    e.stopPropagation();
    confirm({
      title: 'Bạn có chắc chắn muốn xóa chương này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Tất cả bài giảng trong chương sẽ bị xóa theo.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await instructorService.deleteSection(sectionId);
          message.success('Đã xóa chương thành công');
          if (onRefresh) onRefresh();
        } catch (error) {
          message.error('Lỗi khi xóa chương');
        }
      },
    });
  };

  // Xác nhận xóa bài giảng
  const showDeleteLessonConfirm = (lessonId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa bài giảng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await instructorService.deleteLesson(lessonId);
          message.success('Đã xóa bài giảng thành công');
          if (onRefresh) onRefresh();
        } catch (error) {
          message.error('Lỗi khi xóa bài giảng');
        }
      },
    });
  };

  const renderLessonItem = (lesson) => {
    const { icon, bg } = getLessonIcon(lesson.lessonType);
    
    return (
      <div 
        key={lesson.lessonId} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 16px', 
          backgroundColor: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          marginBottom: '8px',
          transition: 'all 0.2s',
        }}
      >
        <HolderOutlined style={{ color: '#cbd5e1', fontSize: '16px', cursor: 'grab', marginRight: '16px' }} />
        
        <div 
          style={{ 
            width: '40px', height: '40px', borderRadius: '8px', backgroundColor: bg, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px',
            cursor: lesson.lessonType === 'VIDEO' && lesson.videos?.length > 0 ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (lesson.lessonType === 'VIDEO' && lesson.videos?.length > 0 && lesson.videos[0].videoUrl) {
              const url = lesson.videos[0].videoUrl;
              const fullUrl = url.startsWith('http') ? url : `http://localhost:9000/elearning/${url}`;
              setPreviewVideoUrl(fullUrl);
              setIsPreviewModalVisible(true);
            } else if (lesson.lessonType === 'VIDEO') {
              message.info('Chưa có video nào được tải lên cho bài giảng này.');
            }
          }}
        >
          {icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: '14px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>
            {lesson.title}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {lesson.lessonType} {lesson.durationMinutes ? `• ${lesson.durationMinutes} Phút` : ''}
          </Text>
        </div>
        
        <Space size="middle">
          <Tooltip title="Cài đặt bài giảng">
            <Button type="text" icon={<SettingOutlined style={{ color: '#64748b' }} />} size="small" onClick={() => openSettingsModal(lesson)} />
          </Tooltip>
          <Tooltip title="Xóa bài giảng">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => showDeleteLessonConfirm(lesson.lessonId)}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };

  const renderSectionHeader = (section) => (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <HolderOutlined style={{ color: '#94a3b8', fontSize: '16px', cursor: 'grab', marginRight: '12px' }} />
      <Text strong style={{ fontSize: '16px', color: '#0f172a', flex: 1 }}>{section.title}</Text>
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Sửa tên chương">
          <Button type="text" icon={<EditOutlined style={{ color: '#3b82f6' }} />} size="small" />
        </Tooltip>
        <Tooltip title="Xóa chương">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            size="small" 
            onClick={(e) => showDeleteSectionConfirm(section.sectionId, e)}
          />
        </Tooltip>
      </Space>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Curriculum List */}
      <div style={{ marginBottom: '24px' }}>
        {curriculum.length > 0 ? (
          <Collapse 
            defaultActiveKey={curriculum.map(s => s.sectionId)} 
            ghost 
            expandIconPosition="start"
            style={{ padding: 0 }}
          >
            {curriculum.map((section) => (
              <Panel 
                header={renderSectionHeader(section)} 
                key={section.sectionId}
                style={{ 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '0 8px' }}>
                  {section.lessons && section.lessons.map(lesson => renderLessonItem(lesson))}
                  
                  <Button 
                    type="dashed" 
                    block 
                    icon={<PlusOutlined />} 
                    onClick={() => openLessonModal(section.sectionId)}
                    style={{ 
                      height: '40px', 
                      borderRadius: '8px', 
                      color: '#64748b', 
                      borderColor: '#cbd5e1',
                      backgroundColor: 'transparent',
                      marginTop: section.lessons?.length > 0 ? '8px' : '0'
                    }}
                  >
                    Thêm bài giảng mới
                  </Button>
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <Text type="secondary">Chưa có chương học nào. Hãy bắt đầu bằng cách thêm chương mới.</Text>
          </div>
        )}
      </div>

      {/* Action Buttons for Curriculum */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '32px' }}>
        <Button icon={<EyeOutlined />} style={{ borderRadius: '6px' }}>Xem trước</Button>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ borderRadius: '6px', backgroundColor: '#0052cc' }}
          onClick={() => setIsSectionModalVisible(true)}
        >
          Thêm chương mới
        </Button>
      </div>

      {/* Summary Section */}
      <Card 
        style={{ borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Tóm tắt chương trình</Title>
          <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: '18px' }} />
        </div>
        
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Title level={3} style={{ margin: 0, color: '#0052cc' }}>{totalSections}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>Chương học</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Title level={3} style={{ margin: 0, color: '#0052cc' }}>{totalLessons}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>Bài giảng</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Title level={3} style={{ margin: 0, color: '#0052cc' }}>{durationText}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>Tổng thời lượng</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Title level={3} style={{ margin: 0, color: '#0052cc' }}>{totalQuizzes}</Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>Bài trắc nghiệm</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Modal Thêm Chương */}
      <Modal
        title="Thêm chương mới"
        open={isSectionModalVisible}
        onCancel={() => setIsSectionModalVisible(false)}
        onOk={() => sectionForm.submit()}
        confirmLoading={loading}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleCreateSection}>
          <Form.Item
            name="title"
            label="Tiêu đề chương"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề chương!' }]}
          >
            <Input placeholder="Nhập tiêu đề chương..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Bài Giảng */}
      <Modal
        title="Thêm bài giảng mới"
        open={isLessonModalVisible}
        onCancel={() => setIsLessonModalVisible(false)}
        onOk={() => lessonForm.submit()}
        confirmLoading={loading}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={lessonForm} layout="vertical" onFinish={handleCreateLesson} initialValues={{ lessonType: 'VIDEO' }}>
          <Form.Item
            name="title"
            label="Tiêu đề bài giảng"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài giảng!' }]}
          >
            <Input placeholder="Nhập tiêu đề bài giảng..." />
          </Form.Item>
          <Form.Item
            name="lessonType"
            label="Loại bài giảng"
            rules={[{ required: true, message: 'Vui lòng chọn loại bài giảng!' }]}
          >
            <Select>
              <Select.Option value="VIDEO">Video</Select.Option>
              <Select.Option value="DOCUMENT">Tài liệu đọc</Select.Option>
              <Select.Option value="QUIZ">Bài tập trắc nghiệm</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cài Đặt Bài Giảng */}
      <Modal
        title={`Cài đặt bài giảng: ${selectedLessonForSettings?.title || ''}`}
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSettingsModalVisible(false)}>Đóng</Button>
        ]}
        width={700}
        bodyStyle={{ padding: '24px 0' }}
      >
        <Tabs defaultActiveKey="0" tabPosition="left" style={{ minHeight: '350px' }}>
          <Tabs.TabPane tab={<span><InfoCircleOutlined /> Thông tin</span>} key="0">
            <div style={{ padding: '0 24px' }}>
              <Title level={5} style={{ marginTop: 0 }}>Thông tin chung</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>Cập nhật tiêu đề và nội dung chi tiết của bài giảng.</Text>
              
              <Form form={lessonUpdateForm} layout="vertical" onFinish={handleUpdateLesson}>
                <Form.Item name="title" label="Tiêu đề bài giảng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                  <Input placeholder="Nhập tiêu đề..." />
                </Form.Item>
                <Form.Item name="description" label="Nội dung chi tiết (Mô tả/Bài viết)">
                  <Input.TextArea rows={8} placeholder="Nhập nội dung chi tiết bài học tại đây (Hỗ trợ HTML cơ bản)..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Lưu thay đổi</Button>
                </Form.Item>
              </Form>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><PlayCircleFilled /> Video</span>} key="1">
            <div style={{ padding: '0 24px' }}>
              <Title level={5} style={{ marginTop: 0 }}>Tải lên Video Bài giảng</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>Hỗ trợ định dạng MP4, WebM. Kích thước tối đa 500MB.</Text>
              
              <Upload.Dragger customRequest={handleUploadVideo} showUploadList={false} maxCount={1} accept="video/*">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc nhấn để tải video lên</p>
                <p className="ant-upload-hint">Video sẽ được lưu trữ an toàn và tối ưu hóa để phát lại mượt mà trên mọi thiết bị.</p>
              </Upload.Dragger>
              
              <div style={{ marginTop: '24px' }}>
                <Text strong>Video đã tải lên:</Text>
                {selectedLessonForSettings?.videos?.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLessonForSettings.videos}
                    renderItem={item => (
                      <List.Item
                        actions={[<Button danger type="text" size="small" icon={<DeleteOutlined />} key="delete" />]}
                      >
                        <List.Item.Meta
                          avatar={<div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayCircleFilled style={{ color: '#64748b' }} /></div>}
                          title={<a href={item.videoUrl?.startsWith('http') ? item.videoUrl : `http://localhost:9000/elearning/${item.videoUrl}`} target="_blank" rel="noreferrer">{item.title}</a>}
                          description="Đã xử lý xong"
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '8px', border: '1px dashed #e2e8f0' }}>
                    <Text type="secondary">Chưa có video nào.</Text>
                  </div>
                )}
              </div>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab={<span><FileTextFilled /> Tài liệu</span>} key="2">
            <div style={{ padding: '0 24px' }}>
              <Title level={5} style={{ marginTop: 0 }}>Tài liệu đính kèm</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>Học viên có thể tải xuống các tài liệu này để tham khảo (PDF, Word, Excel, ZIP).</Text>
              
              <Upload.Dragger customRequest={handleUploadDocument} showUploadList={false} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc nhấn để tải tài liệu lên</p>
              </Upload.Dragger>
              
              <div style={{ marginTop: '24px' }}>
                <Text strong>Tài liệu hiện tại:</Text>
                {selectedLessonForSettings?.documents?.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLessonForSettings.documents}
                    renderItem={item => (
                      <List.Item
                        actions={[<Button danger type="text" size="small" icon={<DeleteOutlined />} key="delete" />]}
                      >
                        <List.Item.Meta
                          avatar={<div style={{ width: '32px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextFilled style={{ color: '#64748b' }} /></div>}
                          title={<a href={item.fileUrl?.startsWith('http') ? item.fileUrl : `http://localhost:9000/elearning/${item.fileUrl}`} target="_blank" rel="noreferrer">{item.title}</a>}
                          description="Tài liệu đính kèm"
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '8px', border: '1px dashed #e2e8f0' }}>
                    <Text type="secondary">Chưa có tài liệu nào.</Text>
                  </div>
                )}
              </div>
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab={<span><QuestionCircleFilled /> Trắc nghiệm</span>} key="3">
            <div style={{ padding: '0 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>Ngân hàng câu hỏi</Title>
                  <Text type="secondary">Tạo các câu hỏi để kiểm tra kiến thức học viên</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openQuestionModal}>Thêm câu hỏi</Button>
              </div>
              
              {selectedLessonForSettings?.quizzes?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedLessonForSettings.quizzes}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="text" size="small" icon={<EditOutlined style={{ color: '#3b82f6' }} />} key="edit" />,
                        <Button danger type="text" size="small" icon={<DeleteOutlined />} key="delete" />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<div style={{ width: '32px', height: '32px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', fontWeight: 'bold' }}>Q</div>}
                        title={item.title}
                        description={`${item.questions?.length || 0} câu hỏi`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                  <QuestionCircleFilled style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '12px' }} />
                  <p style={{ margin: 0, color: '#64748b' }}>Chưa có câu hỏi trắc nghiệm nào.</p>
                  <Button type="dashed" style={{ marginTop: '12px' }} onClick={openQuestionModal}>Tạo câu hỏi đầu tiên</Button>
                </div>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Modal>

      {/* Modal Thêm Câu Hỏi */}
      <Modal
        title="Thêm câu hỏi trắc nghiệm"
        open={isQuestionModalVisible}
        onOk={handleCreateQuestion}
        onCancel={() => setIsQuestionModalVisible(false)}
        okText="Lưu câu hỏi"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="questionText"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: Đâu là thẻ HTML dùng để tạo liên kết?" />
          </Form.Item>

          <div style={{ marginBottom: '8px' }}>
            <Text strong>Các đáp án (Chọn một đáp án đúng):</Text>
          </div>
          
          <Form.Item name="correctAnswer" style={{ marginBottom: 0 }}>
            <Radio.Group style={{ width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio value={0} />
                  <Form.Item name="answer0" noStyle rules={[{ required: true, message: 'Nhập đáp án A' }]}>
                    <Input placeholder="Đáp án A" style={{ flex: 1 }} />
                  </Form.Item>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio value={1} />
                  <Form.Item name="answer1" noStyle rules={[{ required: true, message: 'Nhập đáp án B' }]}>
                    <Input placeholder="Đáp án B" style={{ flex: 1 }} />
                  </Form.Item>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio value={2} />
                  <Form.Item name="answer2" noStyle rules={[{ required: true, message: 'Nhập đáp án C' }]}>
                    <Input placeholder="Đáp án C" style={{ flex: 1 }} />
                  </Form.Item>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio value={3} />
                  <Form.Item name="answer3" noStyle rules={[{ required: true, message: 'Nhập đáp án D' }]}>
                    <Input placeholder="Đáp án D" style={{ flex: 1 }} />
                  </Form.Item>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xem trước Video */}
      <Modal
        title={null}
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewVideoUrl('');
        }}
        footer={null}
        width={800}
        centered
        destroyOnClose
        closeIcon={<CloseCircleOutlined style={{ color: '#fff', fontSize: '24px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }} />}
        styles={{ body: { padding: 0, backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' } }}
      >
        {previewVideoUrl && (
          <video 
            src={previewVideoUrl} 
            controls 
            autoPlay 
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '80vh' }}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        )}
      </Modal>

    </div>
  );
};

export default CurriculumTab;
