import React, { useRef, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Avatar,
  Typography,
  Space,
  Tooltip,
  Input,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const UserTable = ({
  data,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onLock,
  onView,
  onlineUserIds = [],
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${title}...`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          STT
        </Text>
      ),
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text style={{ color: "#475569" }}>
          {pagination.page * pagination.size + index + 1}
        </Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          THAO TÁC
        </Text>
      ),
      key: "action",
      width: 140,
      render: (_, record) => {
        const currentUserRole = localStorage.getItem("userRole") || "";
        const isAdmin = currentUserRole === "ROLE_ADMIN";

        // ADMIN không được sửa/khóa ADMIN khác hoặc SUPER_ADMIN
        const cannotEdit =
          isAdmin &&
          (record.role === "ROLE_ADMIN" || record.role === "ROLE_SUPER_ADMIN");

        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: "#64748b" }} />}
                onClick={() => onView && onView(record)}
              />
            </Tooltip>
            {!cannotEdit && (
              <>
                <Tooltip title="Sửa thông tin">
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ color: "#64748b" }} />}
                    onClick={() => onEdit && onEdit(record)}
                  />
                </Tooltip>
                <Tooltip
                  title={record.status === false ? "Mở khóa" : "Khóa tài khoản"}
                >
                  <Button
                    type="text"
                    icon={
                      <LockOutlined
                        style={{
                          color:
                            record.status === false ? "#10b981" : "#ef4444",
                        }}
                      />
                    }
                    onClick={() => onLock && onLock(record)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          MÃ
        </Text>
      ),
      dataIndex: "userId",
      key: "userId",
      width: 120,
      ...getColumnSearchProps("userId", "mã"),
      render: (id, record) => (
        <Text style={{ fontSize: "13px", color: "#475569", fontWeight: 500 }}>
          {record.role === "ROLE_STUDENT" ? "STU" : "INS"}-
          {new Date().getFullYear()}-{id?.toString().padStart(3, "0")}
        </Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          TÊN
        </Text>
      ),
      dataIndex: "fullName",
      key: "fullName",
      width: 260,
      ...getColumnSearchProps("fullName", "tên"),
      render: (text, record) => {
        const isOnline = onlineUserIds.includes(record.userId);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Avatar
                src={record.avatarUrl}
                size="large"
                style={{
                  backgroundColor: "#e2e8f0",
                  color: "#475569",
                  fontWeight: "bold",
                }}
              >
                {text ? text.charAt(0).toUpperCase() : <UserOutlined />}
              </Avatar>
              {isOnline && (
                <Tooltip title="Đang online">
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      border: "2px solid #ffffff",
                      boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.2)",
                    }}
                  />
                </Tooltip>
              )}
            </div>
            <Text style={{ fontWeight: 600, color: "#1e293b" }}>{text}</Text>
          </div>
        );
      },
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          SỐ ĐIỆN THOẠI
        </Text>
      ),
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone", "số điện thoại"),
      render: (text) => (
        <Text style={{ color: "#475569" }}>{text || "Chưa cập nhật"}</Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          ĐỊA CHỈ EMAIL
        </Text>
      ),
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", "email"),
      render: (text) => <Text style={{ color: "#475569" }}>{text}</Text>,
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          VAI TRÒ
        </Text>
      ),
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Học viên", value: "ROLE_STUDENT" },
        { text: "Giảng viên", value: "ROLE_INSTRUCTOR" },
        { text: "Admin", value: "ROLE_ADMIN" },
        { text: "Super Admin", value: "ROLE_SUPER_ADMIN" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color = "#f3e8ff";
        let textColor = "#7e22ce";
        let label = "Học viên";

        if (role === "ROLE_INSTRUCTOR") {
          color = "#ffedd5";
          textColor = "#c2410c";
          label = "Giảng viên";
        } else if (role === "ROLE_ADMIN") {
          color = "#dcfce7";
          textColor = "#15803d";
          label = "Admin";
        } else if (role === "ROLE_SUPER_ADMIN") {
          color = "#fee2e2";
          textColor = "#b91c1c";
          label = "Super Admin";
        }

        return (
          <Tag
            color={color}
            style={{
              color: textColor,
              fontWeight: 600,
              border: "none",
              borderRadius: "12px",
              padding: "2px 12px",
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          TRẠNG THÁI
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Đã khóa", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const isLocked = status === false;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isLocked ? "#ef4444" : "#10b981",
              }}
            />
            <Text
              style={{
                color: isLocked ? "#ef4444" : "#10b981",
                fontWeight: 500,
              }}
            >
              {isLocked ? "Đã khóa" : "Hoạt động"}
            </Text>
          </div>
        );
      },
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          NGÀY THAM GIA
        </Text>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      ...getColumnSearchProps("createdAt", "ngày"),
      render: (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return (
          <Text style={{ color: "#475569" }}>
            {date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        );
      },
    },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "8px" }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="userId"
        loading={loading}
        scroll={{ x: 1200, y: 500 }}
        pagination={
          pagination
            ? {
                current: pagination.page + 1,
                pageSize: pagination.size,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bản ghi`,
                onChange: (page, pageSize) =>
                  onPageChange && onPageChange(page - 1, pageSize),
              }
            : false
        }
      />
    </div>
  );
};

export default UserTable;
