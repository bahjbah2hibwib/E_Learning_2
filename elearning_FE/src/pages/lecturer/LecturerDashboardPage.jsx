import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LecturerLayout from "../../layouts/LecturerLayout";
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Tag,
  Avatar,
  Spin,
  Button,
  Space,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  RightOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import instructorService from "../../services/instructorService";

const { Title, Text } = Typography;

/* ---------- Các thành phần phụ trợ cho StatCard (mini chart / progress / legend) ---------- */

// Dãy cột mini thể hiện xu hướng theo ngày (dùng cho thẻ "Tổng số học viên")
const MiniTrendBars = ({ data, color }) => {
  const safeData = data && data.length > 0 ? data : [{ name: "", value: 0 }];
  const max = Math.max(1, ...safeData.map((d) => d.value || 0));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "4px",
        height: "28px",
      }}
    >
      {safeData.map((d, idx) => (
        <div
          key={idx}
          title={`${d.name}: ${d.value || 0}`}
          style={{
            flex: 1,
            height: `${Math.max(6, ((d.value || 0) / max) * 28)}px`,
            backgroundColor: color,
            borderRadius: "3px",
            opacity: 0.5 + ((d.value || 0) / max) * 0.5,
            transition: "height 0.4s ease",
          }}
        />
      ))}
    </div>
  );
};

// Thanh tỉ lệ phân đoạn (dùng cho thẻ "Tổng số khóa học": đã duyệt / chờ duyệt / khác)
const SegmentedBar = ({ segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div
        style={{
          height: "8px",
          borderRadius: "4px",
          backgroundColor: "#f1f5f9",
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        height: "8px",
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#f1f5f9",
      }}
    >
      {segments.map(
        (seg, idx) =>
          seg.value > 0 && (
            <div
              key={idx}
              style={{
                width: `${(seg.value / total) * 100}%`,
                backgroundColor: seg.color,
                transition: "width 0.6s ease",
              }}
            />
          ),
      )}
    </div>
  );
};

// Thanh tiến trình đơn (dùng cho thẻ "Khóa học đang hoạt động")
const ProgressBar = ({ percent, color }) => (
  <div
    style={{
      height: "8px",
      borderRadius: "4px",
      backgroundColor: "#f1f5f9",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(100, Math.max(0, percent))}%`,
        height: "100%",
        backgroundColor: color,
        borderRadius: "4px",
        transition: "width 0.6s ease",
      }}
    />
  </div>
);

// Chấm màu chú giải nhỏ, dùng cho SegmentedBar
const LegendDot = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
    <Text style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
      {label}
    </Text>
  </div>
);

/* ---------- StatCard: thêm subtitle, badgeIcon tùy chọn, footer (mini chart/progress), nền decorative cho cả 2 loại thẻ ---------- */

const StatCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  badgeText,
  badgeIcon,
  gradient,
  subtitle,
  footer,
}) => (
  <Card
    bordered={false}
    style={{
      borderRadius: "20px",
      background: gradient || "#ffffff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
      overflow: "hidden",
      position: "relative",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
      height: "100%",
    }}
    className="hover-card"
    bodyStyle={{
      padding: "28px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          backgroundColor: iconBg,
          color: iconColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "28px",
          boxShadow: `0 8px 16px ${iconBg}`,
        }}
      >
        {icon}
      </div>
      {badgeText && (
        <div
          style={{
            backgroundColor: gradient
              ? "rgba(255,255,255,0.18)"
              : "rgba(22, 163, 74, 0.1)",
            color: gradient ? "#ffffff" : "#16a34a",
            padding: "6px 12px",
            borderRadius: "24px",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {badgeIcon !== null &&
            (badgeIcon || <ArrowUpOutlined style={{ fontSize: "10px" }} />)}
          {badgeText}
        </div>
      )}
    </div>

    <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
      <Text
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: gradient ? "rgba(255,255,255,0.8)" : "#64748b",
        }}
      >
        {title}
      </Text>
      <Title
        level={1}
        style={{
          margin: "4px 0 0 0",
          color: gradient ? "#ffffff" : "#0f172a",
          fontSize: "36px",
          fontWeight: 800,
        }}
      >
        {value}
      </Title>
      {subtitle && (
        <Text
          style={{
            fontSize: "13px",
            color: gradient ? "rgba(255,255,255,0.75)" : "#94a3b8",
            display: "block",
            marginTop: "4px",
          }}
        >
          {subtitle}
        </Text>
      )}
    </div>

    {footer && (
      <div style={{ position: "relative", zIndex: 2, marginTop: "20px" }}>
        {footer}
      </div>
    )}

    {/* Decorative background icon - thẻ trắng */}
    {!gradient && (
      <div
        style={{
          position: "absolute",
          right: "-12px",
          bottom: "-12px",
          fontSize: "100px",
          color: iconColor,
          opacity: 0.06,
          zIndex: 1,
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {icon}
      </div>
    )}

    {/* Decorative background shape - thẻ gradient */}
    {gradient && (
      <div
        style={{
          position: "absolute",
          right: "-20px",
          bottom: "-20px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          zIndex: 1,
        }}
      />
    )}
  </Card>
);

const LecturerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    registrationTrend: [],
    myCourses: [],
  });

  const userName = localStorage.getItem("userName") || "Giảng viên";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await instructorService.getDashboardStats();
        if (res && res.success) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch instructor dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ---------- Tính toán dữ liệu phụ cho 3 StatCard (không gọi thêm API, chỉ derive từ dashboardData) ---------- */

  // Thẻ "Tổng số khóa học": đếm theo trạng thái từ myCourses
  const courseStatusCounts = (dashboardData.myCourses || []).reduce(
    (acc, c) => {
      const status = c.status || "DRAFT";
      if (status === "APPROVED") acc.approved += 1;
      else if (status === "PENDING") acc.pending += 1;
      else acc.other += 1;
      return acc;
    },
    { approved: 0, pending: 0, other: 0 },
  );
  const courseStatusTotal =
    courseStatusCounts.approved +
    courseStatusCounts.pending +
    courseStatusCounts.other;
  const approvedPercentOfKnown =
    courseStatusTotal > 0
      ? Math.round((courseStatusCounts.approved / courseStatusTotal) * 100)
      : null;

  // Thẻ "Khóa học đang hoạt động": tỉ lệ trên tổng số khóa học
  const activePercent =
    dashboardData.totalCourses > 0
      ? Math.round(
          (dashboardData.activeCourses / dashboardData.totalCourses) * 100,
        )
      : 0;

  // Thẻ "Tổng số học viên": tăng trưởng 7 ngày gần nhất so với 7 ngày trước đó
  const trend = dashboardData.registrationTrend || [];
  const last7Days = trend.slice(-7);
  const prev7Days = trend.slice(-14, -7);
  const last7Total = last7Days.reduce((sum, d) => sum + (d.value || 0), 0);
  const prev7Total = prev7Days.reduce((sum, d) => sum + (d.value || 0), 0);

  let studentGrowthBadge = null;
  if (prev7Total > 0) {
    const pct = Math.round(((last7Total - prev7Total) / prev7Total) * 100);
    studentGrowthBadge = `${pct >= 0 ? "+" : ""}${pct}% so với 7 ngày trước`;
  } else if (last7Total > 0) {
    studentGrowthBadge = `+${last7Total} mới`;
  }

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course",
      key: "course",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "8px 0",
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar
              shape="square"
              size={64}
              src={record.thumb}
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              icon={<BookOutlined />}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "400px",
            }}
          >
            <Text
              strong
              style={{
                color: "#0f172a",
                fontSize: "16px",
                marginBottom: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.title}
            </Text>
            <Space size={16}>
              <Text
                type="secondary"
                style={{ fontSize: "13px", color: "#64748b" }}
              >
                {record.category}
              </Text>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                <StarFilled style={{ marginRight: "4px" }} /> 4.8
              </span>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "registered",
      key: "registered",
      align: "center",
      render: (val) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text strong style={{ fontSize: "18px", color: "#0f172a" }}>
            {val?.toLocaleString() || 0}
          </Text>
          <Text style={{ fontSize: "12px", color: "#94a3b8" }}>đăng ký</Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (status) => {
        let color, text, bgColor;
        if (status === "APPROVED") {
          color = "#16a34a";
          bgColor = "#dcfce7";
          text = "Đang hoạt động";
        } else if (status === "PENDING") {
          color = "#f59e0b";
          bgColor = "#fef3c7";
          text = "Chờ duyệt";
        } else {
          color = "#64748b";
          bgColor = "#f1f5f9";
          text = "Đã ẩn";
        }
        return (
          <span
            style={{
              backgroundColor: bgColor,
              color: color,
              borderRadius: "20px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            {text}
          </span>
        );
      },
    },
  ];

  return (
    <LecturerLayout>
      {/* Global CSS for hover effects */}
      <style>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
        }
        .custom-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 2px solid #f1f5f9;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.3s;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>

      <div style={{ padding: "0 8px" }}>
        {loading ? (
          <div
            style={{
              height: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Spin size="large" />
            <Text style={{ color: "#64748b", fontSize: "16px" }}>
              Đang tải dữ liệu không gian làm việc...
            </Text>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <Title
                  level={2}
                  style={{ margin: 0, color: "#0f172a", fontWeight: 800 }}
                >
                  Chào mừng trở lại, {userName}! 👋
                </Title>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  Cùng xem hiệu suất các khóa học của bạn hôm nay.
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  height: "44px",
                  padding: "0 24px",
                }}
                onClick={() => (window.location.href = "/lecturer/courses")}
              >
                Quản lý khóa học
              </Button>
            </div>

            <Row
              gutter={[24, 24]}
              align="stretch"
              style={{ marginBottom: "32px" }}
            >
              {/* Thẻ 1: Tổng số học viên */}
              <Col xs={24} md={8}>
                <StatCard
                  icon={<TeamOutlined />}
                  iconBg="rgba(255,255,255,0.2)"
                  iconColor="#ffffff"
                  title="Tổng số học viên"
                  value={dashboardData.totalStudents?.toLocaleString()}
                  badgeText={studentGrowthBadge}
                  gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  subtitle={
                    last7Total > 0
                      ? `+${last7Total} học viên mới trong 7 ngày qua`
                      : "Chưa có học viên mới trong 7 ngày qua"
                  }
                  footer={
                    <div>
                      <MiniTrendBars
                        data={last7Days}
                        color="rgba(255,255,255,0.9)"
                      />
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.7)",
                          display: "block",
                          marginTop: "8px",
                        }}
                      >
                        Lượt đăng ký 7 ngày gần nhất
                      </Text>
                    </div>
                  }
                />
              </Col>

              {/* Thẻ 2: Tổng số khóa học */}
              <Col xs={24} md={8}>
                <StatCard
                  icon={<BookOutlined />}
                  iconBg="#eff6ff"
                  iconColor="#3b82f6"
                  title="Tổng số khóa học"
                  value={dashboardData.totalCourses}
                  badgeText={
                    approvedPercentOfKnown !== null
                      ? `${approvedPercentOfKnown}% đã duyệt`
                      : null
                  }
                  badgeIcon={null}
                  subtitle={
                    courseStatusTotal > 0
                      ? `${courseStatusCounts.approved} đã duyệt · ${courseStatusCounts.pending} chờ duyệt · ${courseStatusCounts.other} khác`
                      : "Chưa có dữ liệu phân loại"
                  }
                  footer={
                    <div>
                      <SegmentedBar
                        segments={[
                          {
                            value: courseStatusCounts.approved,
                            color: "#16a34a",
                          },
                          {
                            value: courseStatusCounts.pending,
                            color: "#f59e0b",
                          },
                          { value: courseStatusCounts.other, color: "#94a3b8" },
                        ]}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <LegendDot
                          color="#16a34a"
                          label={`Đã duyệt (${courseStatusCounts.approved})`}
                        />
                        <LegendDot
                          color="#f59e0b"
                          label={`Chờ duyệt (${courseStatusCounts.pending})`}
                        />
                        <LegendDot
                          color="#94a3b8"
                          label={`Khác (${courseStatusCounts.other})`}
                        />
                      </div>
                    </div>
                  }
                />
              </Col>

              {/* Thẻ 3: Khóa học đang hoạt động */}
              <Col xs={24} md={8}>
                <StatCard
                  icon={<PlayCircleOutlined />}
                  iconBg="#fffbeb"
                  iconColor="#f59e0b"
                  title="Khóa học đang hoạt động"
                  value={dashboardData.activeCourses}
                  badgeText={`${activePercent}%`}
                  badgeIcon={null}
                  subtitle={`So với ${dashboardData.totalCourses || 0} khóa học hiện có`}
                  footer={
                    <div>
                      <ProgressBar percent={activePercent} color="#f59e0b" />
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          display: "block",
                          marginTop: "8px",
                        }}
                      >
                        {activePercent}% đang hoạt động trên tổng số khóa học
                      </Text>
                    </div>
                  }
                />
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} xl={16}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: "0" }}
                >
                  <div
                    style={{
                      padding: "24px 32px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
                      >
                        Hiệu suất khóa học của bạn
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "14px" }}>
                        Học viên ghi danh gần đây nhất
                      </Text>
                    </div>
                    <Link
                      to="/lecturer/courses"
                      style={{
                        color: "#3b82f6",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Xem tất cả khóa học{" "}
                      <RightOutlined style={{ fontSize: "12px" }} />
                    </Link>
                  </div>
                  <div style={{ padding: "16px 32px" }}>
                    <Table
                      className="custom-table"
                      columns={columns}
                      dataSource={dashboardData.myCourses.slice(0, 5)} // Show top 5
                      pagination={false}
                      rowKey={(record) => record.id || record.title}
                    />
                  </div>
                </Card>
              </Col>

              <Col xs={24} xl={8}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    height: "100%",
                  }}
                  bodyStyle={{
                    padding: "24px 32px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "32px",
                    }}
                  >
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
                      >
                        Lưu lượng đăng ký
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "13px" }}>
                        30 ngày qua
                      </Text>
                    </div>
                    <Button
                      type="text"
                      icon={
                        <MoreOutlined
                          style={{ fontSize: "20px", color: "#94a3b8" }}
                        />
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minHeight: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dashboardData.registrationTrend}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorValue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{
                            stroke: "#cbd5e1",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            padding: "12px 16px",
                          }}
                          itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                          activeDot={{
                            r: 6,
                            fill: "#3b82f6",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div
                    style={{
                      marginTop: "24px",
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#e0e7ff",
                        color: "#4f46e5",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "18px",
                      }}
                    >
                      <ArrowUpOutlined />
                    </div>
                    <div>
                      <Text
                        style={{
                          display: "block",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        Xu hướng tuần này
                      </Text>
                      <Text
                        strong
                        style={{ color: "#0f172a", fontSize: "16px" }}
                      >
                        Đang tăng tích cực
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </LecturerLayout>
  );
};

export default LecturerDashboardPage;
