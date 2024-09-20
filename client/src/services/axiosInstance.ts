import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL || 'http://localhost:5000/api',
  timeout: 80000, 
});

export default axiosInstance;
