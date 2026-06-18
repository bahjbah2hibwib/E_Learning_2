import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LecturerLayout from "../../layouts/LecturerLayout";
import {
  Typography,
  Card,
  Button,
  Input,
  Row,
  Col,
  Tag,
  Spin,
  Empty,
  Pagination,
  Space
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  StarFilled,
  UserOutlined,
  BookOutlined
} from "@ant-design/icons";
import instructorService from "../../services/instructorService";

const { Title, Text, Paragraph } = Typography;

const LecturerCoursePage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  const fetchCourses = async (keyword = "", page = 0, size = 8) => {
    try {
      setLoading(true);
      const res = await instructorService.getInstructorCourses({
        page: page,
        size: size,
        keyword,
      });
      if (res && res.success && res.data) {
        setCourses(res.data.content);
        setPagination({
          current: page + 1,
          pageSize: size,
          total: res.data.totalElements,
        });
      }
    } catch (error) {
      console.error("Không thể tải danh sách khóa học", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses("", 0, pagination.pageSize);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    fetchCourses(val, 0, pagination.pageSize);
  };

  const handlePageChange = (page, pageSize) => {
    fetchCourses(searchText, page - 1, pageSize);
  };

  const renderStatusTag = (status) => {
    if (status === "APPROVED") {
      return <Tag color="#16a34a" style={{ borderRadius: "12px", border: "none", fontWeight: 600 }}>Đã duyệt</Tag>;
    }
    if (status === "PENDING") {
      return <Tag color="#f59e0b" style={{ borderRadius: "12px", border: "none", fontWeight: 600 }}>Chờ duyệt</Tag>;
    }
    if (status === "HIDDEN") {
      return <Tag color="#64748b" style={{ borderRadius: "12px", border: "none", fontWeight: 600 }}>Đã ẩn</Tag>;
    }
    return <Tag color="#3b82f6" style={{ borderRadius: "12px", border: "none", fontWeight: 600 }}>Bản nháp</Tag>;
  };

  return (
    <LecturerLayout title="Khóa học của tôi">
      <style>{`
        .course-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid transparent;
        }
        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #3b82f6;
        }
        .course-card-img-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          overflow: hidden;
          background-color: #f1f5f9;
        }
        .course-card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .course-card:hover .course-card-img {
          transform: scale(1.05);
        }
        .create-card {
          border: 2px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 320px;
          background-color: transparent;
          transition: all 0.3s;
          cursor: pointer;
        }
        .create-card:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
      `}</style>
      
      <div style={{ padding: "0 24px 40px 24px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>Quản lý khóa học</Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>Quản lý và cập nhật nội dung cho các khóa học của bạn</Text>
          </div>
          <Space>
            <Input
              size="large"
              placeholder="Tìm kiếm khóa học..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: "300px", borderRadius: "8px" }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: "8px", fontWeight: 600, padding: "0 24px" }}
              onClick={() => navigate('/lecturer/courses/new')}
            >
              Tạo khóa học
            </Button>
          </Space>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ height: "40vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin size="large" tip="Đang tải danh sách..." />
          </div>
        ) : (
          <>
            <Row gutter={[24, 32]}>
              {/* Card Create New */}
              <Col xs={24} sm={12} md={8} lg={6}>
                <div className="create-card" style={{ borderRadius: "12px" }} onClick={() => navigate('/lecturer/courses/new')}>
                  <div style={{ 
                    width: "64px", height: "64px", borderRadius: "50%", 
                    backgroundColor: "#eff6ff", color: "#3b82f6", 
                    display: "flex", justifyContent: "center", alignItems: "center",
                    fontSize: "24px", marginBottom: "16px"
                  }}>
                    <PlusOutlined />
                  </div>
                  <Title level={4} style={{ color: "#0f172a", margin: 0 }}>Tạo khóa học mới</Title>
                  <Text type="secondary" style={{ marginTop: "8px", textAlign: "center", padding: "0 16px" }}>
                    Bắt đầu xây dựng chương trình giảng dạy của bạn ngay hôm nay
                  </Text>
                </div>
              </Col>

              {/* Course Cards */}
              {courses.map((course) => (
                <Col xs={24} sm={12} md={8} lg={6} key={course.courseId}>
                  <Card
                    className="course-card"
                    bodyStyle={{ padding: "0" }}
                    onClick={() => navigate(`/lecturer/courses/${course.courseId}`)}
                  >
                    <div className="course-card-img-wrapper">
                      <img 
                        src={course.thumbnailUrl || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"} 
                        alt={course.title}
                        className="course-card-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x225?text=No+Image"; }}
                      />
                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        {renderStatusTag(course.status)}
                      </div>
                    </div>
                    
                    <div style={{ padding: "20px" }}>
                      <Text type="secondary" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "8px", color: "#64748b" }}>
                        {course.categoryName || "Chưa phân loại"}
                      </Text>
                      
                      <Paragraph 
                        strong 
                        ellipsis={{ rows: 2 }} 
                        style={{ fontSize: "16px", color: "#0f172a", marginBottom: "12px", lineHeight: 1.4, minHeight: "44px" }}
                      >
                        {course.title}
                      </Paragraph>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <StarFilled style={{ color: "#f59e0b" }} />
                          <Text strong style={{ color: "#334155" }}>4.8</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>(120)</Text>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                          <UserOutlined />
                          <Text style={{ fontSize: "13px", fontWeight: 500 }}>{course.totalStudents?.toLocaleString() || 0} học viên</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {courses.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Empty description="Không tìm thấy khóa học nào phù hợp" />
              </div>
            )}

            {/* Pagination */}
            {pagination.total > 0 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={true}
                  pageSizeOptions={['8', '16', '24']}
                />
              </div>
            )}
          </>
        )}
      </div>
    </LecturerLayout>
  );
};

export default LecturerCoursePage;
