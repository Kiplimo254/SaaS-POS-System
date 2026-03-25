import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api/",
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const response = await axios.post("http://localhost:8001/api/token/refresh/", {
            refresh: refreshToken,
          });
          localStorage.setItem("token", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
