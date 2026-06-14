import React, { useMemo } from 'react';
import { List, Typography, Button, Empty, Tag, Card } from 'antd';
import { 
  FilePdfOutlined, 
  VideoCameraOutlined, 
  DownloadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const CourseFilesTab = ({ courseData }) => {
  // Aggregate all documents from sections -> lessons and deduplicate
  const files = useMemo(() => {
    if (!courseData || !courseData.sections) return [];
    
    const allFiles = [];
    const seenUrls = new Set();

    courseData.sections.forEach(section => {
      if (section.lessons) {
        section.lessons.forEach(lesson => {
          // Only add documents and avoid duplicates based on fileUrl
          if (lesson.documents) {
            lesson.documents.forEach(doc => {
              if (doc.fileUrl && !seenUrls.has(doc.fileUrl)) {
                seenUrls.add(doc.fileUrl);
                allFiles.push({
                  type: 'document',
                  title: doc.title || `Tài liệu: ${lesson.title}`,
                  url: doc.fileUrl,
                  lessonName: lesson.title,
                  sectionName: section.title
                });
              }
            });
          }
        });
      }
    });
    return allFiles;
  }, [courseData]);

  if (files.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <Empty description="Chưa có tài liệu đính kèm nào trong khóa học này" />
      </div>
    );
  }

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:9000/elearning/${url}`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={5} style={{ marginBottom: '16px', color: '#1e293b' }}>
        Tất cả tài liệu đính kèm ({files.length})
      </Title>
      
      <List
        dataSource={files}
        renderItem={item => (
          <List.Item
            style={{
              padding: '16px',
              backgroundColor: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'border-color 0.3s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#f1f5f9'}
          >
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '8px', 
                  backgroundColor: item.type === 'video' ? '#eff6ff' : '#fef2f2',
                  color: item.type === 'video' ? '#3b82f6' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {item.type === 'video' ? <VideoCameraOutlined /> : <FilePdfOutlined />}
                </div>
                <div>
                  <Text strong style={{ fontSize: '15px', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                    {item.title}
                  </Text>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Tag color="default" style={{ border: 'none', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      Phần: {item.sectionName}
                    </Tag>
                    <Tag color="default" style={{ border: 'none', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      Bài: {item.lessonName}
                    </Tag>
                  </div>
                </div>
              </div>
              
              <Button 
                type="text" 
                icon={item.type === 'video' ? <PlayCircleOutlined /> : <DownloadOutlined />} 
                style={{ color: '#0ea5e9' }}
                onClick={() => window.open(getFullUrl(item.url), '_blank')}
              >
                {item.type === 'video' ? 'Xem video' : 'Tải xuống'}
              </Button>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CourseFilesTab;
