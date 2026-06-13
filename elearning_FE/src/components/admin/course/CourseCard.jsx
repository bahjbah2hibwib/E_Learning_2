import React from 'react';
import { Card, Button, Typography, Tag, Space } from 'antd';
import { UserOutlined, CalendarOutlined, PictureOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CourseCard = ({ course, onApprove, onReject, onViewDetails }) => {
  // Trạng thái badge hiển thị
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED': return { color: 'success', text: 'Đã phê duyệt' };
      case 'HIDDEN': return { color: 'default', text: 'Đã ẩn' };
      default: return { color: 'warning', text: 'Chờ duyệt' };
    }
  };

  const statusConfig = getStatusConfig(course.status);

  return (
    <Card 
      bordered={true} 
      style={{ 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        height: '100%'
      }}
      bodyStyle={{ padding: '0', display: 'flex' }}
    >
      {/* Cột trái: Ảnh Thumbnail */}
      <div style={{ width: '200px', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        
        {/* Placeholder nếu ảnh lỗi hoặc trống */}
        <div style={{ display: course.thumbnailUrl ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
          <PictureOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>No Image</Text>
        </div>
      </div>

      {/* Cột phải: Thông tin & Nút bấm */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tiêu đề & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <Title level={4} style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 600 }}>
            {course.title}
          </Title>
          <Tag color={statusConfig.color} style={{ borderRadius: '12px', padding: '2px 10px', margin: 0 }}>
            {statusConfig.text}
          </Tag>
        </div>

        {/* Thông tin phụ */}
        <Space direction="vertical" size={4} style={{ marginBottom: '20px' }}>
          <Text style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined /> Giảng viên: {course.instructorName || 'Chưa rõ'}
          </Text>
          <Text style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined /> Ngày gửi: {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '--'}
          </Text>
        </Space>

        <div style={{ flex: 1 }} /> {/* Đẩy các nút xuống dưới cùng */}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
          <Button type="link" onClick={() => onViewDetails(course)} style={{ padding: 0, marginRight: 'auto' }}>
            Xem chi tiết
          </Button>

          {course.status === 'PENDING' && (
            <>
              <Button danger onClick={() => onReject(course)} style={{ borderRadius: '6px' }}>
                Từ chối
              </Button>
              <Button type="primary" onClick={() => onApprove(course)} style={{ borderRadius: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}>
                Phê duyệt
              </Button>
            </>
          )}

          {course.status === 'APPROVED' && (
            <Button danger onClick={() => onReject(course)} style={{ borderRadius: '6px' }}>
               Khóa / Ẩn
            </Button>
          )}

          {course.status === 'HIDDEN' && (
            <Button type="primary" onClick={() => onApprove(course)} style={{ borderRadius: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}>
               Phê duyệt / Hiện lại
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
