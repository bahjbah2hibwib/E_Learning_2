import React, { useState, useEffect } from "react";
import { Modal, Spin, message, Row, Col } from "antd";
import UserProfileCard from "./UserProfileCard";
import UserActivityTabs from "./UserActivityTabs";
import userService from "../../services/userService";

const UserDetailModal = ({ visible, userId, onClose, onOpenEdit }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchUserDetails(userId);
    } else {
      // Reset state khi đóng modal
      setUserData(null);
      setActiveTab("courses");
      setTabData([]);
    }
  }, [visible, userId]);

  const fetchUserDetails = async (id) => {
    try {
      setLoading(true);
      const response = await userService.getUserById(id);
      if (response.success) {
        setUserData(response.data);
        fetchTabData("courses", response.data.role);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      message.error(error.message || "Không thể lấy thông tin người dùng");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tabKey, role) => {
    setTabLoading(true);
    try {
      if (tabKey === "courses") {
        const response = await userService.getUserCourses(userId);
        if (response.success) {
          setTabData(response.data);
        }
      } else if (tabKey === "payments") {
        const response = await userService.getUserPayments(userId);
        if (response.success) {
          setTabData(response.data);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu tab:", error);
      message.error(error.message || "Không thể lấy dữ liệu hoạt động");
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchTabData(key, userData?.role);
  };

  const handleEdit = () => {
    if (onOpenEdit && userData) {
      onOpenEdit(userData);
    }
  };

  const handleToggleLock = () => {
    message.info("Tính năng Khóa/Mở khóa đang được phát triển!");
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1600}
      destroyOnClose
      bodyStyle={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
      }}
      centered
    >
      <Spin spinning={loading} size="large" tip="Đang tải dữ liệu...">
        {userData ? (
          <Row
            gutter={[24, 24]}
            style={{ display: "flex", alignItems: "stretch" }}
          >
            <Col
              xs={24}
              lg={8}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <UserProfileCard
                userData={userData}
                onEdit={handleEdit}
                onToggleLock={handleToggleLock}
              />
            </Col>
            <Col
              xs={24}
              lg={16}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <UserActivityTabs
                userData={userData}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                tabData={tabData}
                tabLoading={tabLoading}
              />
            </Col>
          </Row>
        ) : (
          <div style={{ minHeight: "400px" }}></div>
        )}
      </Spin>
    </Modal>
  );
};

export default UserDetailModal;
