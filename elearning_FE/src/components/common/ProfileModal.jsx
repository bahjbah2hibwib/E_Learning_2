import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, DatePicker, message, Avatar, Spin } from 'antd';
import { UserOutlined, UploadOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import userService from '../../services/userService';
import fileService from '../../services/fileService';

const ProfileModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFileId, setAvatarFileId] = useState(null);

  useEffect(() => {
    if (visible) {
      loadUserProfile();
    } else {
      form.resetFields();
      setAvatarUrl(null);
      setAvatarFileId(null);
    }
  }, [visible]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.userId) {
          const res = await userService.getUserById(userObj.userId);
          if (res && res.success) {
            const data = res.data;
            form.setFieldsValue({
              fullName: data.fullName,
              phone: data.phone,
              email: data.email, // email is readonly usually, but display it
              dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
            });
            if (data.avatarUrl) {
              setAvatarUrl(data.avatarUrl);
            }
          }
        }
      }
    } catch (error) {
      message.error("Lỗi tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      const res = await fileService.uploadFile(file);
      if (res && res.success) {
        setAvatarFileId(res.data.id);
        const reader = new FileReader();
        reader.onload = (e) => setAvatarUrl(e.target.result);
        reader.readAsDataURL(file);
        onSuccess(null, file);
        message.success("Tải ảnh lên thành công!");
      }
    } catch (err) {
      onError(err);
      message.error("Tải ảnh thất bại!");
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      if (avatarFileId) {
        payload.avatarFileId = avatarFileId;
      }
      if (values.password) {
        payload.password = values.password;
      }

      const res = await userService.updateProfile(payload);
      if (res && res.success) {
        message.success("Cập nhật thông tin thành công!");
        
        // Cập nhật localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.fullName = res.data.fullName;
          userObj.avatarUrl = res.data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(userObj));
          localStorage.setItem('userName', res.data.fullName);
        }
        
        onClose(true); // pass true to indicate success
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cài đặt tài khoản"
      open={visible}
      onCancel={() => onClose()}
      footer={null}
      width={500}
    >
      <Spin spinning={loading}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar 
            size={100} 
            src={avatarUrl} 
            icon={<UserOutlined />} 
            style={{ marginBottom: 12, backgroundColor: '#3b82f6' }}
          />
          <div>
            <Upload 
              customRequest={handleCustomUpload} 
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} size="small">Thay đổi ảnh đại diện</Button>
            </Upload>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item 
            label="Họ và tên" 
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item 
            label="Số điện thoại" 
            name="phone"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item 
            label="Ngày sinh" 
            name="dateOfBirth"
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu mới (Để trống nếu không muốn đổi)" 
            name="password"
            rules={[
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => onClose()}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ProfileModal;
