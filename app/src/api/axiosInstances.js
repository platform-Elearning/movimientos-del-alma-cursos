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

  // Interceptor de respuestas (response) - SIMPLIFICADO
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Solo limpiar tokens en caso de 401, sin intentar refresh automático
      if (error.response?.status === 401) {
        console.warn('❌ Token inválido (401), limpiando tokens...');
        Cookies.remove('token');
        localStorage.removeItem('token');
        
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 Redirigiendo al login...');
          window.location.href = '/login';
        }
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
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true
}));

export const instanceCursos = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true
}));

export const instanceEnrollmentss = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true
}));

export const instanceReports = addAuthInterceptor(axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
}));

export default instance;
