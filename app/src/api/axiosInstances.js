import axios from "axios";
import Cookies from "js-cookie";

export const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

export const instanceUsers = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/users`,
});

// Interceptor para agregar el token a todas las peticiones de instanceUsers
instanceUsers.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const instanceCursos = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/courses`,
});

// Interceptor para agregar el token a todas las peticiones de instanceCursos
instanceCursos.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const instanceEnrollmentss = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
});

// Interceptor para agregar el token a todas las peticiones de instanceEnrollmentss
instanceEnrollmentss.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const instanceReports = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/report-problem`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
