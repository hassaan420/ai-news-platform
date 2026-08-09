import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('unauthorized'));
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
