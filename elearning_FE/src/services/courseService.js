import axiosClient from '../api/axiosClient';

const courseService = {
    // Gọi API lấy danh sách khóa học cho Admin
    getAllAdminCourses: (params) => {
        const url = '/courses';
        return axiosClient.get(url, { params });
    },
    
    // Lấy chi tiết khóa học cho Admin
    getCourseDetail: (id) => {
        const url = `/courses/${id}`;
        return axiosClient.get(url);
    },

    // Duyệt / Khóa khóa học
    updateCourseStatus: (id, data) => {
        const url = `/courses/${id}/status`;
        return axiosClient.patch(url, data);
    },

    getPublicCourses: (params) => {
        const url = '/courses/public';
        return axiosClient.get(url, { params });
    },

    getPublicCourseDetail: (id) => {
        const url = `/courses/public/${id}`;
        return axiosClient.get(url);
    }
};

export default courseService;
