import axios from "axios";
import Cookies from "js-cookie";

// Función para obtener el token de las cookies
const getAuthToken = () => {
  return Cookies.get('token') || localStorage.getItem('token');
};

const addAuthInterceptor = (instance) => {
  // Interceptor de peticiones (request)
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido, limpiar tokens
        Cookies.remove('token');
        localStorage.removeItem('token');
        console.warn('Token expirado. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const instance = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true
}));

export const instanceUsers = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/users`,
    withCredentials: true
}));

export const instanceCursos = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/courses`,
    withCredentials: true
}));

export const instanceEnrollmentss = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
    withCredentials: true
}));

export const instanceReports = addAuthInterceptor(axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/report-problem`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
}));

export default instance;
