import axiosClient from '../api/axiosClient';

const paymentService = {
  getAllPayments: async (page = 0, size = 10, filters = {}) => {
    try {
      const params = { page, size, ...filters };
      const response = await axiosClient.get('/payments', { params });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi gọi API danh sách giao dịch' };
    }
  },

  getPaymentStats: async () => {
    try {
      const response = await axiosClient.get('/payments/stats');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi lấy thống kê' };
    }
  },

  getPaymentDetail: async (id) => {
    try {
      const response = await axiosClient.get(`/payments/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi lấy chi tiết giao dịch' };
    }
  },

  createMoMoPayment: async (courseId, amount) => {
    try {
      const response = await axiosClient.post('/payments/momo/create', { courseId, amount });
      return response;
    } catch (error) {
      throw error || { message: 'Lỗi tạo yêu cầu thanh toán MoMo' };
    }
  }
};

export default paymentService;
