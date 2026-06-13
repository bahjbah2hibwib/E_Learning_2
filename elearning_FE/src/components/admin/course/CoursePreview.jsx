import React from 'react';
import { Typography, Card, Tag, Space, Divider } from 'antd';
import { PlayCircleOutlined, DollarOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CoursePreview = ({ course }) => {
  if (!course) return null;

  return (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%' }}>
      {/* Video hoặc Ảnh Thumbnail */}
      <div style={{ 
        width: '100%', 
        height: '400px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '24px'
      }}>
        {course.thumbnailUrl ? (
          <img 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
            src={course.thumbnailUrl} 
            alt={course.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div style={{ display: course.thumbnailUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
          <PlayCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <Text type="secondary">Video Giới Thiệu Khóa Học</Text>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <Title level={4}>{course.title || 'Đang cập nhật tên khóa học'}</Title>
      
      <Space size="large" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', color: course.isFree ? '#16a34a' : '#0f172a' }}>
          <DollarOutlined /> 
          {course.isFree ? 'Miễn phí' : `${course.price?.toLocaleString()} VND`}
        </Text>
        <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <BookOutlined /> Thuộc danh mục: <Tag color="blue">{course.categoryName || 'Chưa phân loại'}</Tag>
        </Text>
      </Space>

      <Divider />

      {/* Mô tả khóa học */}
      <div>
        <Title level={5} style={{ marginBottom: '12px' }}>Mô tả chi tiết</Title>
        <Paragraph style={{ color: '#475569', lineHeight: '1.8' }}>
          {course.description || 'Chưa có mô tả cho khóa học này.'}
        </Paragraph>
      </div>
    </Card>
  );
};

export default CoursePreview;
