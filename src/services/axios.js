import axios from "axios";
import Cookies from "js-cookie";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,

  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
