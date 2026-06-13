import axiosClient from '../api/axiosClient';

const notificationService = {
  // Lấy danh sách thông báo (có phân trang)
  getNotifications: (params) => {
    const url = '/notifications';
    return axiosClient.get(url, { params });
  },

  // Đếm số lượng thông báo chưa đọc
  getUnreadCount: () => {
    const url = '/notifications/unread-count';
    return axiosClient.get(url);
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: (id) => {
    const url = `/notifications/${id}/read`;
    return axiosClient.put(url);
  },

  // Đánh dấu tất cả là đã đọc
  markAllAsRead: () => {
    const url = '/notifications/read-all';
    return axiosClient.put(url);
  }
};

export default notificationService;
