import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, Upload, Button, message, Spin, Row, Col } from 'antd';
import { LoadingOutlined, PlusOutlined, UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import userService from '../../services/userService';
import fileService from '../../services/fileService';
import dayjs from 'dayjs';

const { Option } = Select;

const UserFormModal = ({ visible, onClose, onSuccess, editingUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarFileId, setAvatarFileId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const isEditMode = !!editingUser;

  // Cập nhật form khi có dữ liệu editingUser
  React.useEffect(() => {
    if (visible && isEditMode && editingUser) {
      form.setFieldsValue({
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        status: editingUser.status,
        dateOfBirth: editingUser.dateOfBirth ? dayjs(editingUser.dateOfBirth) : null,
        password: '', // Mật khẩu luôn để trống khi edit
      });
      setPreviewImage(editingUser.avatarUrl || '');
      setSelectedFile(null);
      setAvatarFileId(null);
    } else if (visible && !isEditMode) {
      form.resetFields();
      setPreviewImage('');
      setAvatarFileId(null);
      setSelectedFile(null);
    }
  }, [visible, editingUser, isEditMode, form]);

  // Xử lý khi đóng form
  const handleCancel = () => {
    form.resetFields();
    setAvatarFileId(null);
    setSelectedFile(null);
    setPreviewImage('');
    onClose();
  };

  // Custom hàm upload ảnh: Chỉ lưu file vào state, không gọi API ngay
  const handleUploadAvatar = (options) => {
    const { file, onSuccess: onAntSuccess } = options;
    setSelectedFile(file); // Lưu file object
    setAvatarFileId(null); // Reset ID nếu trước đó có
    
    // Tạo preview URL tĩnh để hiển thị ngay
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    onAntSuccess('ok');
  };

  // Nút Upload Image (Giao diện hiển thị)
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  // Xử lý Submit Form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      let finalAvatarFileId = avatarFileId;

      // Nếu có file mới được chọn, gọi API upload TRƯỚC KHI tạo user
      if (selectedFile) {
        const fileRes = await fileService.uploadFile(selectedFile);
        if (fileRes && fileRes.success) {
          finalAvatarFileId = fileRes.data.fileId;
        } else {
          throw new Error('Không thể tải ảnh lên, vui lòng thử lại.');
        }
      }

      // Ép kiểu DatePicker về định dạng YYYY-MM-DD
      let dateOfBirthStr = null;
      if (values.dateOfBirth) {
        dateOfBirthStr = values.dateOfBirth.format('YYYY-MM-DD');
      }

      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password || null, // Gửi null nếu không đổi mật khẩu
        phone: values.phone || null,
        dateOfBirth: dateOfBirthStr,
        role: values.role,
        status: values.status !== undefined ? values.status : true,
        // Chỉ gửi avatarFileId nếu có ID
        ...(finalAvatarFileId && { avatarFileId: finalAvatarFileId })
      };

      let res;
      if (isEditMode) {
        res = await userService.updateUser(editingUser.userId, payload);
      } else {
        res = await userService.createUser(payload);
      }
      
      if (res && res.success) {
        message.success(isEditMode ? 'Cập nhật tài khoản thành công!' : 'Tạo tài khoản thành công!');
        handleCancel();
        onSuccess(); // Báo cho trang cha load lại danh sách
      }
    } catch (error) {
      console.error("Lỗi tạo user:", error);
      // Fallback lấy toàn bộ chuỗi JSON để xem lỗi thực tế là gì
      const errorMsg = error.message || error.response?.data?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#3b82f6' }} />
          {isEditMode ? "Chỉnh sửa tài khoản" : "Thêm người dùng mới"}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button key="back" size="large" onClick={handleCancel} style={{ borderRadius: '8px', fontWeight: 500, border: '1px solid #cbd5e1', color: '#475569' }}>
            Hủy bỏ
          </Button>
          <Button key="submit" type="primary" size="large" loading={loading} onClick={() => form.submit()} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
            {isEditMode ? "Lưu thay đổi" : "Khởi tạo tài khoản"}
          </Button>
        </div>
      }
      width={700}
      destroyOnClose
      closeIcon={null}
      bodyStyle={{ padding: '24px 0' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          role: 'ROLE_STUDENT',
          status: true,
        }}
        style={{ marginTop: '16px' }}
      >
        {/* Ảnh đại diện ở giữa */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <Form.Item style={{ margin: 0 }}>
            <Upload
              name="avatar"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={handleUploadAvatar}
              accept="image/*"
            >
              {previewImage ? (
                <img 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Avatar'; }}
                  src={previewImage} 
                  alt="avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.getFieldValue('fullName') || 'User')}&background=e2e8f0&color=475569`;
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                  {uploading ? <LoadingOutlined style={{ fontSize: '28px', color: '#3b82f6' }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}><PlusOutlined style={{ fontSize: '20px', color: '#94a3b8' }} /></div>}
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </div>

        {/* Grid chia 2 cột */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: '4px' }} />} size="large" placeholder="Ví dụ: Nguyễn Văn A" style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Địa chỉ Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' }
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: '4px' }} />} size="large" placeholder="user@example.com" autoComplete="new-password" style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu</span>}
              extra={isEditMode ? <span style={{ fontSize: '12px', color: '#94a3b8' }}>Bỏ trống nếu không muốn đổi mật khẩu</span> : ""}
              rules={[
                { required: !isEditMode, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: '4px' }} />} size="large" placeholder={isEditMode ? "Bỏ trống để giữ nguyên" : "Nhập mật khẩu bí mật"} autoComplete="new-password" style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Số điện thoại</span>}
            >
              <Input prefix={<PhoneOutlined style={{ color: '#94a3b8', marginRight: '4px' }} />} size="large" placeholder="Nhập số điện thoại" style={{ borderRadius: '8px' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="role"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Vai trò</span>}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select size="large" placeholder="Chọn vai trò">
                <Option value="ROLE_STUDENT"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></div> Học viên</div></Option>
                <Option value="ROLE_INSTRUCTOR"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div> Giảng viên</div></Option>
                {localStorage.getItem('userRole') === 'ROLE_SUPER_ADMIN' && (
                  <>
                    <Option value="ROLE_ADMIN"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> Quản trị viên</div></Option>
                    <Option value="ROLE_SUPER_ADMIN"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div> Super Admin</div></Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label={<span style={{ fontWeight: 600, color: '#334155' }}>Ngày sinh</span>}
            >
              <DatePicker size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="Chọn ngày sinh" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {/* Trạng thái hoạt động */}
        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>Trạng thái tài khoản</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Cho phép hoặc chặn người dùng truy cập hệ thống</div>
          </div>
          <Form.Item
            name="status"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Đã khóa" style={{ minWidth: '90px' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
