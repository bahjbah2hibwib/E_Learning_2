import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import UserListPage from './pages/admin/UserListPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReportPage from './pages/admin/ReportPage';
import CourseListPage from './pages/admin/course/CourseListPage';
import CourseApprovalPage from './pages/admin/course/CourseApprovalPage';
import PaymentListPage from './pages/admin/payment/PaymentListPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import UserCoursesPage from './pages/user/UserCoursesPage';
import CourseDetailPage from './pages/user/CourseDetailPage';
import CheckoutPage from './pages/user/CheckoutPage';
import LearningPage from './pages/user/LearningPage';
import webSocketService from './services/webSocketService';

import LecturerDashboardPage from './pages/lecturer/LecturerDashboardPage';
import LecturerCoursePage from './pages/lecturer/LecturerCoursePage';

function App() {
  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      webSocketService.connect(token);
    }
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Điều hướng mặc định tạm thời sang trang Đăng ký */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        
        {/* Cấu hình Router tương đương với @RequestMapping("/register") bên Backend */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Trang Login tạm thời để cái Link "Đăng nhập ngay" không bị lỗi 404 */}
        <Route path="/login" element={<LoginPage />} />

        {/* Các trang quản trị viên */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/users" element={<UserListPage />} />
        <Route path="/admin/courses" element={<CourseListPage />} />
        <Route path="/admin/courses/:id" element={<CourseApprovalPage />} />
        <Route path="/admin/payments" element={<PaymentListPage />} />

        {/* Các trang giảng viên */}
        <Route path="/lecturer/dashboard" element={<LecturerDashboardPage />} />
        <Route path="/lecturer/courses" element={<LecturerCoursePage />} />

        {/* Các trang người dùng */}
        <Route path="/user/dashboard" element={<UserDashboardPage />} />
        <Route path="/user/courses" element={<UserCoursesPage />} />
        <Route path="/user/courses/:id" element={<CourseDetailPage />} />
        <Route path="/user/checkout/:id" element={<CheckoutPage />} />
        <Route path="/user/learning/:id" element={<LearningPage />} />
      </Routes>
    </Router>
  );
}

export default App;
