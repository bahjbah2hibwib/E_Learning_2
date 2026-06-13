import React from 'react';
import { Input, Button, Space, Typography } from 'antd';
import { SearchOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CourseFilterBar = ({ keyword, onKeywordChange, totalElements, onSortNewest }) => {

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Hàng 1: Thanh tìm kiếm dài */}
      <Input
        size="large"
        placeholder="Search courses, instructors..."
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        style={{ 
          borderRadius: '8px', 
          maxWidth: '800px', 
          marginBottom: '20px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      />

      {/* Hàng 2: Các nút lọc và kết quả */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<SortAscendingOutlined />} onClick={onSortNewest} style={{ borderRadius: '6px' }}>
            Sắp xếp mới nhất
          </Button>
        </Space>

      </div>
    </div>
  );
};

export default CourseFilterBar;
