import axiosClient from '../api/axiosClient';

const instructorService = {
  // Lấy dữ liệu thống kê cho Dashboard của Giảng viên
  getDashboardStats: () => {
    const url = '/instructor/dashboard';
    return axiosClient.get(url);
  },

  // Lấy danh sách khóa học của giảng viên (có phân trang và tìm kiếm)
  getInstructorCourses: (params) => {
    const url = '/instructor/courses';
    return axiosClient.get(url, { params });
  },

  // Lấy chi tiết khóa học
  getCourseDetail: (id) => {
    const url = `/courses/${id}`;
    return axiosClient.get(url);
  },

  // Tạo khóa học mới
  createCourse: (data) => {
    const url = '/instructor/courses';
    return axiosClient.post(url, data);
  },

  // Cập nhật khóa học
  updateCourse: (id, data) => {
    const url = `/instructor/courses/${id}`;
    return axiosClient.put(url, data);
  },

  // Lấy danh sách học viên của khóa học
  getCourseStudents: (id) => {
    const url = `/instructor/courses/${id}/students`;
    return axiosClient.get(url);
  },

  // Xóa khóa học
  deleteCourse: (id) => {
    const url = `/instructor/courses/${id}`;
    return axiosClient.delete(url);
  },

  // Tạo chương học
  createSection: (courseId, data) => {
    const url = `/instructor/courses/${courseId}/sections`;
    return axiosClient.post(url, data);
  },

  // Xóa chương học
  deleteSection: (sectionId) => {
    const url = `/instructor/sections/${sectionId}`;
    return axiosClient.delete(url);
  },

  // Tạo bài giảng mới
  createLesson: (sectionId, data) => {
    const url = `/instructor/sections/${sectionId}/lessons`;
    return axiosClient.post(url, data);
  },

  // Cập nhật bài giảng (tiêu đề, nội dung chi tiết)
  updateLesson: (lessonId, data) => {
    const url = `/instructor/lessons/${lessonId}`;
    return axiosClient.put(url, data);
  },

  // Thêm video vào bài giảng
  addLessonVideo: (lessonId, data) => {
    const url = `/instructor/lessons/${lessonId}/videos`;
    return axiosClient.post(url, data);
  },

  // Thêm tài liệu đính kèm vào bài giảng
  addLessonDocument: (lessonId, data) => {
    const url = `/instructor/lessons/${lessonId}/documents`;
    return axiosClient.post(url, data);
  },

  // Thêm câu hỏi trắc nghiệm vào bài giảng
  addLessonQuestion: (lessonId, data) => {
    const url = `/instructor/lessons/${lessonId}/questions`;
    return axiosClient.post(url, data);
  },

  // Upload file lên server
  uploadFile: (file) => {
    const url = '/files/upload';
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa bài giảng
  deleteLesson: (lessonId) => {
    const url = `/instructor/lessons/${lessonId}`;
    return axiosClient.delete(url);
  },

  // Lấy danh sách danh mục
  getCategories: () => {
    const url = '/categories';
    return axiosClient.get(url);
  },

  // Tạo danh mục mới
  createCategory: (data) => {
    const url = '/categories';
    return axiosClient.post(url, data);
  }
};

export default instructorService;
