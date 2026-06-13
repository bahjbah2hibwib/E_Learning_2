import React, { useState, useEffect } from 'react';
import { Button, Typography, message } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import UserStatsCards from '../../components/admin/UserStatsCards';
import UserFilter from '../../components/admin/UserFilter';
import UserTable from '../../components/admin/UserTable';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailModal from '../../components/admin/UserDetailModal';
import userService from '../../services/userService';
import webSocketService from '../../services/webSocketService';

const { Title, Text } = Typography;

const UserListPage = () => {
  const navigate = useNavigate();

  // --- B. Quản lý Trạng thái (State Management) ---
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  // --- C. Vòng đời và Hành động (Lifecycle & Actions) ---
  
  // Sự kiện 1: Tải dữ liệu từ Backend
  const fetchData = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      // Chạy song song 2 API: Lấy số lượng thẻ (Stats) và Lấy danh sách bảng (Users)
      const [statsRes, usersRes] = await Promise.all([
        userService.getUserStats().catch(() => null), // Tạm thời bỏ qua lỗi nếu Backend chưa có API này
        userService.getAllUsers({
          page: pagination.page,
          size: pagination.size,
          // Chỉ gửi lên param role/status nếu nó có giá trị thật sự
          ...(filters.role && { role: filters.role }),
          ...(filters.status !== '' && { status: filters.status })
        })
      ]);

      if (statsRes && statsRes.success) {
        setStatsData(statsRes.data);
      }

      if (usersRes && usersRes.success) {
        setUserList(usersRes.data.content); // Đổ mảng người dùng vào Table
        setPagination(prev => ({ ...prev, total: usersRes.data.totalElements })); // Lấy tổng số dòng để vẽ thanh phân trang
      }
    } catch (error) {
      if (error.response?.status === 403) {
        if (!isPolling) message.error('Bạn không có quyền truy cập trang này! (Lỗi 403 Forbidden)');
      } else {
        if (!isPolling) message.error(error.message || 'Lỗi khi tải danh sách người dùng');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  // Tự động gọi fetchData mỗi khi đổi trang, đổi số dòng, hoặc chọn lại bộ lọc
  useEffect(() => {
    fetchData();
    
    // Lấy danh sách online ban đầu
    userService.getOnlineUsers().then(res => {
      if (res && res.success) {
        setOnlineUserIds(res.data);
      }
    }).catch(err => console.log('Lỗi lấy online users', err));

    // Đăng ký nghe WebSocket
    const unsubscribe = webSocketService.subscribe('/topic/online-users', (userIds) => {
      setOnlineUserIds(userIds);
    });

    // Tự động refresh dữ liệu ngầm mỗi 5 giây
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, filters.role, filters.status]);

  // Sự kiện 2: Khi user thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Lưu ý: Khi đổi bộ lọc (vd đang ở trang 5 mà lọc ra chỉ có 2 trang), ta phải bắt buộc reset về trang số 0
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Sự kiện 3: Chuyển trang trên bảng
  const handlePageChange = (page, size) => {
    setPagination({ ...pagination, page, size });
  };

  // Sự kiện mở Pop-up Edit
  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const response = await userService.getUserById(record.userId);
      if (response.success) {
        setEditingUser(response.data);
        setIsModalVisible(true);
      }
    } catch (error) {
      message.error("Lỗi khi lấy thông tin chi tiết để sửa");
    } finally {
      setLoading(false);
    }
  };

  // Sự kiện đóng Modal Thêm/Sửa
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  // Sự kiện Khóa tài khoản
  const handleLock = async (record) => {
    try {
      setLoading(true);
      // Fetch current full details first to not lose data like dateOfBirth
      const detailRes = await userService.getUserById(record.userId);
      if (detailRes && detailRes.success) {
        const fullUser = detailRes.data;
        const newStatus = !fullUser.status;
        const payload = {
          fullName: fullUser.fullName,
          email: fullUser.email,
          phone: fullUser.phone || null,
          role: fullUser.role,
          status: newStatus,
          dateOfBirth: fullUser.dateOfBirth
        };
        const updateRes = await userService.updateUser(record.userId, payload);
        if (updateRes && updateRes.success) {
          message.success(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${record.fullName} thành công!`);
          fetchData(true); // Silent reload
        }
      }
    } catch (error) {
      message.error(`Lỗi khi khóa/mở khóa tài khoản ${record.fullName}`);
    } finally {
      setLoading(false);
    }
  };

  // Sự kiện chuyển sang màn hình chi tiết (dạng Modal)
  const handleView = (record) => {
    setSelectedUserId(record.userId);
    setDetailModalVisible(true);
  };

  // Sự kiện Xuất CSV (Frontend tự xử lý)
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      // Cố tình gọi API lấy 10,000 user để đảm bảo lấy hết dữ liệu (giả lập xuất toàn bộ)
      const response = await userService.getAllUsers({ page: 0, size: 10000 });
      if (response && response.success) {
        const users = response.data.content;
        
        // Tạo dòng tiêu đề
        let csvContent = "ID,Họ và tên,Email,Số điện thoại,Vai trò,Trạng thái,Ngày tham gia\n";
        
        // Thêm dữ liệu
        users.forEach(user => {
          const role = user.role === 'ROLE_ADMIN' ? 'Admin' : (user.role === 'ROLE_INSTRUCTOR' ? 'Giảng viên' : 'Học viên');
          const status = user.status ? 'Hoạt động' : 'Đã khóa';
          const date = new Date(user.createdAt).toLocaleDateString('vi-VN');
          
          // Xử lý các chuỗi có thể chứa dấu phẩy
          const name = `"${user.fullName || ''}"`;
          const email = `"${user.email || ''}"`;
          const phone = `"${user.phone || ''}"`;
          
          csvContent += `${user.userId},${name},${email},${phone},${role},${status},${date}\n`;
        });

        // Tạo file Blob với Encoding UTF-8 (BOM) để Excel đọc tiếng Việt không bị lỗi font
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Tự động tải xuống
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `danh_sach_nguoi_dung_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success("Xuất file CSV thành công!");
      }
    } catch (error) {
      message.error("Lỗi khi xuất CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Bọc toàn bộ trang bằng cái Khung Admin (Có Sidebar xám mờ)
    <AdminLayout>
      {/* Khối 1: Header - Đã chuyển nút xuống bộ lọc */}

      {/* Khối 2: 4 Thẻ thống kê */}
      <UserStatsCards stats={statsData} />

      {/* Khối lớn chứa Bảng và Bộ lọc (Có viền mỏng và bo góc chung) */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        
        {/* Khối 3: Bộ lọc (Role & Status) và Nút */}
        <UserFilter filters={filters} onFilterChange={handleFilterChange}>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>Xuất CSV</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: '#1d4ed8' }}
            onClick={() => setIsModalVisible(true)}
          >
            Thêm người dùng
          </Button>
        </UserFilter>
        
        {/* Khối 4 & 5: Bảng dữ liệu Ant Design và Phân trang */}
        <UserTable 
          data={userList} 
          loading={loading} 
          pagination={pagination} 
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onLock={handleLock}
          onView={handleView}
          onlineUserIds={onlineUserIds}
        />
      </div>

      {/* Khối 6: Modal Thêm Người Dùng */}
      <UserFormModal 
        visible={isModalVisible} 
        editingUser={editingUser}
        onClose={handleCloseModal} 
        onSuccess={() => {
          fetchData(); // Tải lại danh sách sau khi thêm thành công
        }} 
      />

      {/* Khối 7: Modal Xem Chi Tiết Người Dùng */}
      <UserDetailModal
        visible={detailModalVisible}
        userId={selectedUserId}
        onClose={() => setDetailModalVisible(false)}
        onOpenEdit={(userData) => {
          setEditingUser(userData);
          setIsModalVisible(true);
        }}
      />
    </AdminLayout>
  );
};

export default UserListPage;
