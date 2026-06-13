import React, { useState, useEffect } from 'react';
import { Table, Spin, Empty, message, Tag, Typography, Input } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined, MailOutlined } from '@ant-design/icons';
import instructorService from '../../../services/instructorService';

const { Text } = Typography;

const StudentStatsTab = ({ courseId }) => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchStudents = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await instructorService.getCourseStudents(courseId);
      if (res && res.success) {
        setStudents(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách học viên:", error);
      message.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const filteredStudents = students ? students.filter(student => 
    (student.fullName && student.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
    (student.email && student.email.toLowerCase().includes(searchText.toLowerCase()))
  ) : [];

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: '#eff6ff', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: '#3b82f6' 
          }}>
            <UserOutlined />
          </div>
          <div>
            <Text strong>{text || 'Chưa cập nhật'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: '4px' }} />
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      render: (text) => (
        <Text>
          <ClockCircleOutlined style={{ marginRight: '6px', color: '#64748b' }} />
          {text ? new Date(text).toLocaleDateString('vi-VN') : 'Không rõ'}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let label = 'Đang học';
        if (status === 'COMPLETED') {
          color = 'blue';
          label = 'Hoàn thành';
        } else if (status === 'INACTIVE') {
          color = 'red';
          label = 'Đã hủy';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <Text strong style={{ fontSize: '16px' }}>Tổng số: </Text>
          <Text style={{ fontSize: '16px', color: '#3b82f6', fontWeight: 'bold' }}>
            {students?.length || 0} học viên
          </Text>
        </div>
        <Input 
          placeholder="Tìm kiếm học viên..." 
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          style={{ width: '300px', borderRadius: '6px' }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredStudents} 
        rowKey="studentId" 
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Chưa có học viên nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    </div>
  );
};

export default StudentStatsTab;
