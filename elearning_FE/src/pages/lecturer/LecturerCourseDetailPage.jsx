import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LecturerLayout from "../../layouts/LecturerLayout";
import {
  Typography,
  Button,
  Input,
  Select,
  Space,
  message,
  Row,
  Col,
  Tabs,
  Form,
  Upload,
  Divider,
  Modal,
  Card,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UploadOutlined,
  SaveOutlined,
  PictureOutlined
} from "@ant-design/icons";
import instructorService from "../../services/instructorService";
import fileService from "../../services/fileService";
import CurriculumTab from "./components/CurriculumTab";
import StudentStatsTab from "./components/StudentStatsTab";
import CourseFilesTab from "./components/CourseFilesTab";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const LecturerCourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreating = id === "new";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseDetail, setCourseDetail] = useState(null);

  const [thumbnailFileId, setThumbnailFileId] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [form] = Form.useForm();

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isCreating) {
      fetchCourseDetail(id);
    } else {
      form.setFieldsValue({ status: "DRAFT", type: "free", price: 0 });
    }
  }, [id, isCreating]);

  const fetchCategories = async () => {
    try {
      const res = await instructorService.getCategories();
      if (res && res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Không thể lấy danh mục:", error);
    }
  };

  const fetchCourseDetail = async (courseId) => {
    try {
      setLoading(true);
      const res = await instructorService.getCourseDetail(courseId);
      if (res.success) {
        setCourseDetail(res.data);
        setThumbnailFileId(res.data.thumbnailFileId || null);
        setThumbnailPreviewUrl(res.data.thumbnailUrl || null);
        form.setFieldsValue({
          title: res.data.title,
          description: res.data.description || "",
          whatYouWillLearn: res.data.whatYouWillLearn || "",
          categoryId: res.data.category?.categoryId || null,
          status: res.data.status,
          type: res.data.isFree ? "free" : "paid",
          price: res.data.price || 0,
        });
      }
    } catch (error) {
      message.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error("Vui lòng nhập tên danh mục");
      return;
    }
    try {
      setIsCreatingCategory(true);
      const res = await instructorService.createCategory({
        categoryName: newCategoryName,
      });
      if (res && res.success) {
        message.success("Tạo danh mục mới thành công!");
        setIsCategoryModalVisible(false);
        setNewCategoryName("");
        fetchCategories();
        form.setFieldsValue({ categoryId: res.data.categoryId });
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tạo danh mục");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/400x225?text=No+Image";
  };

  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    try {
      setIsUploadingImage(true);
      const res = await fileService.uploadFile(file);
      if (res && res.success) {
        setThumbnailFileId(res.data.fileId);
        setThumbnailPreviewUrl(res.data.fileUrl);
        message.success("Tải ảnh lên thành công!");
        onSuccess(res.data);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error(error);
      message.error("Tải ảnh lên thất bại!");
      onError(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description || "",
        whatYouWillLearn: values.whatYouWillLearn || "",
        categoryId: values.categoryId,
        status: isCreating ? "DRAFT" : values.status,
        price: values.type === "free" ? 0 : values.price || 0,
        thumbnailFileId: thumbnailFileId,
      };

      if (isCreating) {
        const res = await instructorService.createCourse(payload);
        message.success("Tạo khóa học thành công!");
        navigate(`/lecturer/courses/${res.data.courseId}`);
      } else {
        await instructorService.updateCourse(id, payload);
        message.success("Cập nhật khóa học thành công!");
        fetchCourseDetail(id);
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu khóa học",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const items = [
    {
      key: "1",
      label: <span style={{ fontWeight: 500, fontSize: "15px" }}>Thông tin chung</span>,
      children: (
        <div style={{ padding: "24px", backgroundColor: "#f8fafc" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Row gutter={[24, 24]}>
              {/* Cột trái: Thông tin chính */}
              <Col xs={24} lg={16}>
                <Card 
                  title="Thông tin cơ bản" 
                  bordered={false} 
                  style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                  headStyle={{ borderBottom: "1px solid #f1f5f9", fontSize: "16px", fontWeight: 600 }}
                >
                  <Form.Item
                    label={<Text strong>Tiêu đề khóa học <span style={{ color: "red" }}>*</span></Text>}
                    name="title"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề khóa học!" }]}
                  >
                    <Input size="large" placeholder="Nhập tiêu đề hấp dẫn cho khóa học của bạn" style={{ borderRadius: "6px" }} />
                  </Form.Item>

                  <Form.Item 
                    label={<Text strong>Mô tả khóa học</Text>} 
                    name="description"
                  >
                    <TextArea 
                      rows={5} 
                      placeholder="Mô tả chi tiết nội dung, đối tượng và những gì khóa học này mang lại."
                      style={{ borderRadius: "6px" }} 
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Kiến thức học viên sẽ được trang bị</Text>}
                    name="whatYouWillLearn"
                    help="Viết mỗi mục trên 1 dòng để hiển thị dạng danh sách (Bullet points)."
                  >
                    <TextArea
                      rows={6}
                      placeholder="Ví dụ:&#10;Hiểu rõ các khái niệm cốt lõi...&#10;Có khả năng tự duy trì và phát triển..."
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Cột phải: Hình ảnh và Cài đặt */}
              <Col xs={24} lg={8}>
                <Card 
                  title="Ảnh đại diện" 
                  bordered={false} 
                  style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px" }}
                  headStyle={{ borderBottom: "1px solid #f1f5f9", fontSize: "16px", fontWeight: 600 }}
                >
                  <div
                    style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      padding: "4px",
                      textAlign: "center",
                      backgroundColor: "#f8fafc",
                      position: "relative",
                      height: "220px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      transition: "all 0.3s",
                    }}
                  >
                    {thumbnailPreviewUrl ? (
                      <>
                        <img
                          src={thumbnailPreviewUrl}
                          alt="thumbnail"
                          onError={handleImgError}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }} className="img-overlay">
                          <Upload
                            showUploadList={false}
                            customRequest={handleUploadImage}
                            accept="image/*"
                          >
                            <Button icon={<UploadOutlined />} type="primary" loading={isUploadingImage} style={{ borderRadius: "6px" }}>
                              Thay đổi ảnh
                            </Button>
                          </Upload>
                        </div>
                      </>
                    ) : (
                      <Upload
                        showUploadList={false}
                        customRequest={handleUploadImage}
                        accept="image/*"
                      >
                        <div style={{ padding: "20px", cursor: "pointer" }}>
                          <PictureOutlined style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "12px" }} />
                          <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                            Nhấn để tải lên <br/>(Tỉ lệ 16:9)
                          </div>
                        </div>
                      </Upload>
                    )}
                  </div>
                </Card>

                <Card 
                  title="Cài đặt khóa học" 
                  bordered={false} 
                  style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                  headStyle={{ borderBottom: "1px solid #f1f5f9", fontSize: "16px", fontWeight: 600 }}
                >
                  <Form.Item
                    label={<Text strong>Danh mục <span style={{ color: "red" }}>*</span></Text>}
                    name="categoryId"
                    rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn danh mục"
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Space style={{ padding: "0 8px 4px" }}>
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => setIsCategoryModalVisible(true)}
                              style={{ color: "#3b82f6" }}
                            >
                              Thêm danh mục mới
                            </Button>
                          </Space>
                        </>
                      )}
                    >
                      {categories.map((c) => (
                        <Option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {!isCreating && (
                    <Form.Item label={<Text strong>Trạng thái</Text>} name="status">
                      <Select size="large">
                        <Option value="DRAFT">Bản nháp (Draft)</Option>
                        <Option value="PENDING">Chờ duyệt (Pending) - Gửi lên Admin</Option>
                        <Option value="HIDDEN">Đã ẩn (Hidden)</Option>
                        <Option value="APPROVED" disabled>Đã duyệt (Chỉ Admin)</Option>
                      </Select>
                    </Form.Item>
                  )}

                  <Form.Item label={<Text strong>Loại khóa học</Text>} name="type">
                    <Select size="large">
                      <Option value="free">Miễn phí</Option>
                      <Option value="paid">Trả phí</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                    {({ getFieldValue }) =>
                      getFieldValue("type") === "paid" ? (
                        <Form.Item
                          label={<Text strong>Giá khóa học (VNĐ) <span style={{ color: "red" }}>*</span></Text>}
                          name="price"
                          rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            type="number"
                            size="large"
                            style={{ borderRadius: "6px" }}
                            min={0}
                            placeholder="Nhập số tiền..."
                          />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Submit Action */}
                <Card 
                  bordered={false} 
                  style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginTop: "24px", background: "linear-gradient(to right, #eff6ff, #f8fafc)" }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    icon={<SaveOutlined />}
                    loading={isSubmitting}
                    style={{ borderRadius: "8px", fontWeight: 600, height: "48px" }}
                  >
                    {isCreating ? "Lưu thông tin & Bắt đầu thêm bài giảng" : "Lưu tất cả thay đổi"}
                  </Button>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      ),
    },
  ];

  if (!isCreating) {
    items.push({
      key: "2",
      label: <span style={{ fontWeight: 500, fontSize: "15px" }}>Chương trình học</span>,
      children: <CurriculumTab courseId={id} courseData={courseDetail} onRefresh={() => fetchCourseDetail(id)} />,
    });
    items.push({
      key: "3",
      label: <span style={{ fontWeight: 500, fontSize: "15px" }}>Tài liệu đính kèm</span>,
      children: <CourseFilesTab courseId={id} courseData={courseDetail} onRefresh={() => fetchCourseDetail(id)} />,
    });
    items.push({
      key: "4",
      label: <span style={{ fontWeight: 500, fontSize: "15px" }}>Học viên</span>,
      children: <StudentStatsTab courseId={id} courseData={courseDetail} />,
    });
  } else {
    items.push({
      key: "2",
      disabled: true,
      label: <span style={{ fontWeight: 500, fontSize: "15px", color: "#cbd5e1" }}>Chương trình học (Khóa)</span>,
      children: null,
    });
    items.push({
      key: "3",
      disabled: true,
      label: <span style={{ fontWeight: 500, fontSize: "15px", color: "#cbd5e1" }}>Tài liệu (Khóa)</span>,
      children: null,
    });
  }

  return (
    <LecturerLayout>
      <style>{`
        .img-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ padding: "0 24px 40px 24px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "16px" }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/lecturer/courses')}
            type="text"
            style={{ fontSize: "16px", color: "#64748b", backgroundColor: "#f1f5f9", borderRadius: "8px", height: "40px" }}
          >
            Quay lại
          </Button>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
              {isCreating ? "Tạo khóa học mới" : "Chi tiết khóa học"}
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              {isCreating ? "Thiết lập cấu trúc và nội dung cốt lõi cho khóa học của bạn." : "Quản lý nội dung, hình ảnh và cài đặt xuất bản."}
            </Text>
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
          overflow: "hidden"
        }}>
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{
              padding: "0 24px",
              margin: 0,
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
            }}
            items={items}
          />
        </div>
      </div>

      <Modal
        title="Thêm danh mục mới"
        open={isCategoryModalVisible}
        onOk={handleCreateCategory}
        onCancel={() => setIsCategoryModalVisible(false)}
        confirmLoading={isCreatingCategory}
        width={400}
      >
        <div style={{ marginTop: "16px" }}>
          <Text strong>Tên danh mục <span style={{ color: "red" }}>*</span></Text>
          <Input
            placeholder="Nhập tên danh mục..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ marginTop: "8px", borderRadius: "6px" }}
            size="large"
          />
        </div>
      </Modal>
    </LecturerLayout>
  );
};

export default LecturerCourseDetailPage;
