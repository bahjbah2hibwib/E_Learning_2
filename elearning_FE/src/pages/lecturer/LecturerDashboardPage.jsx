import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LecturerLayout from "../../layouts/LecturerLayout";
import { Row, Col, Card, Typography, Table, Tag, Avatar, Spin, Button, Space } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  RightOutlined,
  StarFilled,
  UserOutlined
} from "@ant-design/icons";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import instructorService from "../../services/instructorService";

const { Title, Text } = Typography;

const StatCard = ({ icon, iconBg, iconColor, title, value, badgeText, gradient }) => (
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
    }}
    className="hover-card"
    bodyStyle={{ padding: "28px" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
        position: "relative",
        zIndex: 2
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
          boxShadow: `0 8px 16px ${iconBg}`
        }}
      >
        {icon}
      </div>
      {badgeText && (
        <div
          style={{
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            color: "#16a34a",
            padding: "6px 12px",
            borderRadius: "24px",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ArrowUpOutlined style={{ fontSize: "10px", strokeWidth: 2 }} /> {badgeText}
        </div>
      )}
    </div>
    <div style={{ position: "relative", zIndex: 2 }}>
      <Text style={{ fontSize: "15px", fontWeight: 600, color: gradient ? "rgba(255,255,255,0.8)" : "#64748b" }}>
        {title}
      </Text>
      <Title level={1} style={{ margin: "4px 0 0 0", color: gradient ? "#ffffff" : "#0f172a", fontSize: "36px", fontWeight: 800 }}>
        {value}
      </Title>
    </div>
    {/* Decorative background shape */}
    {gradient && (
      <div style={{
        position: "absolute",
        right: "-20px",
        bottom: "-20px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        zIndex: 1
      }} />
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

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course",
      key: "course",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 0" }}>
          <div style={{ position: "relative" }}>
            <Avatar
              shape="square"
              size={64}
              src={record.thumb}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              icon={<BookOutlined />}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
            <Text strong style={{ color: "#0f172a", fontSize: "16px", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {record.title}
            </Text>
            <Space size={16}>
              <Text type="secondary" style={{ fontSize: "13px", color: "#64748b" }}>
                {record.category}
              </Text>
              <span style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
              fontSize: "13px"
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

      <div style={{ padding: "0 8px", maxWidth: "1400px", margin: "0 auto" }}>
        {loading ? (
          <div
            style={{
              height: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <Spin size="large" />
            <Text style={{ color: "#64748b", fontSize: "16px" }}>Đang tải dữ liệu không gian làm việc...</Text>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <Title level={2} style={{ margin: 0, color: "#0f172a", fontWeight: 800 }}>
                  Chào mừng trở lại, {userName}! 👋
                </Title>
                <Text style={{ fontSize: "16px", color: "#64748b", marginTop: "8px", display: "block" }}>
                  Cùng xem hiệu suất các khóa học của bạn hôm nay.
                </Text>
              </div>
              <Button type="primary" size="large" style={{ borderRadius: "8px", fontWeight: 600, height: "44px", padding: "0 24px" }} onClick={() => window.location.href = '/lecturer/courses'}>
                Quản lý khóa học
              </Button>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              <Col xs={24} md={8}>
                <StatCard
                  icon={<TeamOutlined />}
                  iconBg="rgba(255,255,255,0.2)"
                  iconColor="#ffffff"
                  title="Tổng số học viên"
                  value={dashboardData.totalStudents?.toLocaleString()}
                  badgeText="Tăng trưởng tốt"
                  gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard
                  icon={<BookOutlined />}
                  iconBg="#eff6ff"
                  iconColor="#3b82f6"
                  title="Tổng số khóa học"
                  value={dashboardData.totalCourses}
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard
                  icon={<PlayCircleOutlined />}
                  iconBg="#fffbeb"
                  iconColor="#f59e0b"
                  title="Khóa học đang hoạt động"
                  value={dashboardData.activeCourses}
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
                      <Title level={4} style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
                        Hiệu suất khóa học của bạn
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "14px" }}>Học viên ghi danh gần đây nhất</Text>
                    </div>
                    <Link
                      to="/lecturer/courses"
                      style={{ color: "#3b82f6", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      Xem tất cả khóa học <RightOutlined style={{ fontSize: "12px" }} />
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
                      <Title level={4} style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
                        Lưu lượng đăng ký
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "13px" }}>30 ngày qua</Text>
                    </div>
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: "20px", color: "#94a3b8" }} />} />
                  </div>
                  <div style={{ flex: 1, minHeight: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dashboardData.registrationTrend}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            padding: "12px 16px"
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
                          activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
                      <ArrowUpOutlined />
                    </div>
                    <div>
                      <Text style={{ display: "block", color: "#64748b", fontSize: "13px" }}>Xu hướng tuần này</Text>
                      <Text strong style={{ color: "#0f172a", fontSize: "16px" }}>Đang tăng tích cực</Text>
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
