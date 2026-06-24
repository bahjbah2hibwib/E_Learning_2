import axiosClient from '../api/axiosClient';

const userService = {
  // 1. Lấy danh sách người dùng (Kèm phân trang và bộ lọc)
  getAllUsers: (params) => {
    // params là một Object chứa các key như: page, size, keyword, role, status
    const url = '/users';
    return axiosClient.get(url, { params });
  },

  // 2. Lấy số liệu cho 4 thẻ thống kê trên cùng
  getUserStats: (startDate, endDate) => {
    const url = '/users/stats';
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return axiosClient.get(url, { params });
  },

  // 3. Tạo người dùng mới (Dành riêng cho Admin)
  createUser: (data) => {
    const url = '/users';
    return axiosClient.post(url, data);
  },

  // 4. Lấy chi tiết một người dùng
  getUserById: (id) => {
    const url = `/users/${id}`;
    return axiosClient.get(url);
  },

  // 5. Cập nhật thông tin người dùng
  updateUser: (id, data) => {
    const url = `/users/${id}`;
    return axiosClient.put(url, data);
  },

  // 6. Lấy danh sách ID người dùng đang online
  getOnlineUsers: () => {
    const url = '/users/online';
    return axiosClient.get(url);
  },

  // 7. Lấy danh sách khóa học của người dùng
  getUserCourses: (id) => {
    const url = `/users/${id}/courses`;
    return axiosClient.get(url);
  },

  enrollCourse: (userId, courseId) => {
    const url = `/users/${userId}/courses/${courseId}/enroll`;
    return axiosClient.post(url);
  },

  // 8. Lấy danh sách thanh toán của người dùng
  getUserPayments: (id) => {
    const url = `/users/${id}/payments`;
    return axiosClient.get(url);
  },

  // 9. Lấy dữ liệu dashboard học viên
  getStudentDashboard: (id) => {
    const url = `/users/${id}/student-dashboard`;
    return axiosClient.get(url);
  },

  // 10. Lấy dữ liệu học tập của một khóa học (Curriculum + Progress)
  getLearningData: (userId, courseId) => {
    const url = `/users/${userId}/courses/${courseId}/learning-data`;
    return axiosClient.get(url);
  },

  // 11. Đánh dấu hoàn thành bài học
  completeLesson: (userId, lessonId) => {
    const url = `/users/${userId}/lessons/${lessonId}/complete`;
    return axiosClient.post(url);
  },

  // 12. Cập nhật thông tin cá nhân
  updateProfile: (data) => {
    const url = '/users/profile';
    return axiosClient.put(url, data);
  }
};

export default userService;
