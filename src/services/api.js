import axios from 'axios';

const PROD_URL = 'https://harshiddhi-backend.onrender.com/api';
const DEV_URL  = 'http://localhost:5000/api';
const BASE_URL = import.meta.env.MODE === 'production' ? PROD_URL : DEV_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
    const persisted = localStorage.getItem('harshiddhi');
    if (persisted) {
      const t = JSON.parse(persisted)?.auth?.user?.token;
      if (t) config.headers.Authorization = `Bearer ${t}`;
    }
  } catch (_) {}
  return config;
});

export default api;