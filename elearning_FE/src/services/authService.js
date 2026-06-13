import axiosClient from '../api/axiosClient';

const authService = {
  register: (data) => {
    const url = '/auth/register';
    return axiosClient.post(url, data);
  },
  
  login: (data) => {
    const url = '/auth/login';
    return axiosClient.post(url, data);
  },
};

export default authService;
