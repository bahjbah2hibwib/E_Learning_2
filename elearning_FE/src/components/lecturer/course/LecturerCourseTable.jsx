import React, { useRef, useState } from 'react';
import { Table, Tag, Button, Avatar, Typography, Space, Tooltip, Input } from 'antd';
import { SearchOutlined, EyeOutlined, PictureOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LecturerCourseTable = ({ data, loading, pagination, onPageChange, onViewDetails, onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${title}...`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED': return { color: '#dcfce7', textColor: '#15803d', text: 'Đã phê duyệt' };
      case 'HIDDEN': return { color: '#f1f5f9', textColor: '#64748b', text: 'Đã ẩn' };
      case 'PENDING': return { color: '#fef3c7', textColor: '#d97706', text: 'Chờ duyệt' };
      case 'DRAFT': return { color: '#e0e7ff', textColor: '#4338ca', text: 'Bản nháp' };
      default: return { color: '#f1f5f9', textColor: '#64748b', text: 'Không xác định' };
    }
  };

  const columns = [
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>THAO TÁC</Text>,
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined style={{ color: '#64748b' }}/>} onClick={() => onViewDetails && onViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa khóa học">
            <Button type="text" icon={<EditOutlined style={{ color: '#3b82f6' }}/>} onClick={() => onEdit && onEdit(record)} />
          </Tooltip>
          {record.status !== 'APPROVED' && (
            <Tooltip title="Xóa khóa học">
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete && onDelete(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>KHÓA HỌC</Text>,
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
      ...getColumnSearchProps('title', 'tên khóa học'),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {record.thumbnailUrl ? (
            <img
              src={record.thumbnailUrl}
              alt="Course Thumbnail"
              style={{
                width: "72px",
                height: "40px",
                objectFit: "cover",
                backgroundColor: "#e2e8f0",
                borderRadius: "4px",
                border: "1px solid #e2e8f0"
              }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "40px",
                backgroundColor: "#e2e8f0",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8"
              }}
            >
              <PictureOutlined />
            </div>
          )}
          <Text style={{ fontWeight: 600, color: '#1e293b' }}>
            {text?.length > 40 ? text.substring(0, 40) + '...' : text}
          </Text>
        </div>
      ),
    },
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>HỌC VIÊN</Text>,
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      sorter: (a, b) => (a.totalStudents || 0) - (b.totalStudents || 0),
      render: (total) => (
        <Tag color="#eff6ff" style={{ color: '#2563eb', fontWeight: 600, border: 'none', borderRadius: '12px', padding: '2px 10px' }}>
          {total || 0} học viên
        </Tag>
      )
    },
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>DOANH THU</Text>,
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      sorter: (a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0),
      render: (rev) => (
        <Text style={{ color: '#10b981', fontWeight: 600 }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rev || 0)}
        </Text>
      )
    },
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TRẠNG THÁI</Text>,
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Đã phê duyệt', value: 'APPROVED' },
        { text: 'Đã ẩn', value: 'HIDDEN' },
        { text: 'Bản nháp', value: 'DRAFT' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} style={{ color: config.textColor, fontWeight: 600, border: 'none', borderRadius: '12px', padding: '2px 12px' }}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CẬP NHẬT GẦN ĐÂY</Text>,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
      render: (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return <Text style={{ color: '#475569' }}>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>;
      }
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="courseId" 
        loading={loading}
        pagination={pagination ? {
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bản ghi`,
          onChange: (page, pageSize) => onPageChange && onPageChange(page - 1, pageSize)
        } : false}
      />
    </div>
  );
};

export default LecturerCourseTable;
