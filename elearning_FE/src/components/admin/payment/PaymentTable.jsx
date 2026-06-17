import React, { useRef, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Avatar,
  Tooltip,
  Input,
} from "antd";
import {
  EyeOutlined,
  UndoOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const PaymentTable = ({
  loading,
  payments,
  pagination,
  onChange,
  onRefund,
  onViewDetail,
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
          <Button type="link" size="small" onClick={() => close()}>
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

  const getStatusTag = (status) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Tag
            color="success"
            style={{ borderRadius: "12px", padding: "2px 10px" }}
          >
            Thành công
          </Tag>
        );
      case "PENDING":
        return (
          <Tag
            color="warning"
            style={{ borderRadius: "12px", padding: "2px 10px" }}
          >
            Chờ xử lý
          </Tag>
        );
      case "FAILED":
        return (
          <Tag
            color="error"
            style={{ borderRadius: "12px", padding: "2px 10px" }}
          >
            Đã hủy
          </Tag>
        );
      case "REFUNDED":
        return (
          <Tag
            color="default"
            style={{ borderRadius: "12px", padding: "2px 10px" }}
          >
            Hoàn tiền
          </Tag>
        );
      default:
        return (
          <Tag
            color="default"
            style={{ borderRadius: "12px", padding: "2px 10px" }}
          >
            {status}
          </Tag>
        );
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#16a34a",
      "#3b82f6",
    ];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

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
          {(pagination.page - 1) * pagination.size + index + 1}
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
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
              onClick={() => onViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Hoàn tiền">
            <Button
              type="text"
              icon={
                <UndoOutlined
                  style={{
                    color:
                      record.paymentStatus === "SUCCESS"
                        ? "#f59e0b"
                        : "#cbd5e1",
                  }}
                />
              }
              disabled={record.paymentStatus !== "SUCCESS"}
              onClick={() => onRefund(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          MÃ GD
        </Text>
      ),
      dataIndex: "transactionCode",
      key: "transactionCode",
      ...getColumnSearchProps("transactionCode", "mã GD"),
      render: (text) => (
        <Text style={{ color: "#1e293b", fontWeight: 600 }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          HỌC VIÊN
        </Text>
      ),
      key: "studentName",
      ...getColumnSearchProps("studentName", "tên học viên"),
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            style={{
              backgroundColor: getAvatarColor(record.studentName),
              borderRadius: "6px",
            }}
            icon={!record.studentName && <UserOutlined />}
            size={36}
          >
            {record.studentName
              ? record.studentName.charAt(0).toUpperCase()
              : ""}
          </Avatar>
          <Text style={{ fontWeight: 600, color: "#1e293b" }}>
            {record.studentName || "Chưa cập nhật"}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          KHÓA HỌC
        </Text>
      ),
      dataIndex: "courseName",
      key: "courseName",
      ...getColumnSearchProps("courseName", "tên khóa học"),
      render: (text) => (
        <Text style={{ color: "#475569" }}>
          {text?.length > 30 ? text.substring(0, 30) + "..." : text}
        </Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          SỐ TIỀN (VNĐ)
        </Text>
      ),
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (amount) => (
        <Text style={{ color: "#1e293b", fontWeight: 600 }}>
          {amount
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(amount)
            : "0 ₫"}
        </Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          PHƯƠNG THỨC
        </Text>
      ),
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: [
        { text: "MoMo", value: "MOMO" },
        { text: "VNPAY", value: "VNPAY" },
        { text: "Chuyển khoản", value: "BANK_TRANSFER" },
      ],
      onFilter: (value, record) =>
        record.paymentMethod === value ||
        (record.paymentMethod || "").toUpperCase().includes(value),
      render: (text) => (
        <Text style={{ color: "#64748b" }}>{text || "N/A"}</Text>
      ),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          TRẠNG THÁI
        </Text>
      ),
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      filters: [
        { text: "Thành công", value: "SUCCESS" },
        { text: "Chờ xử lý", value: "PENDING" },
        { text: "Đã hủy", value: "FAILED" },
        { text: "Hoàn tiền", value: "REFUNDED" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: (
        <Text style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          NGÀY GD
        </Text>
      ),
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 120,
      sorter: (a, b) =>
        new Date(a.transactionDate || 0) - new Date(b.transactionDate || 0),
      render: (date) => {
        if (!date) return <Text>N/A</Text>;
        const d = new Date(date);
        const dateStr = d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const timeStr = d.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <Text style={{ color: "#475569", whiteSpace: "nowrap" }}>
            {timeStr} {dateStr}
          </Text>
        );
      },
    },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "8px" }}>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="paymentId"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} bản ghi`,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default PaymentTable;
