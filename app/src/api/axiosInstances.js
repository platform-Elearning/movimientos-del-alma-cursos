import axios from "axios"
import Cookies from "js-cookie"

// Función para obtener el token de las cookies
const getAuthToken = () => {
  return Cookies.get('token');
};

// Interceptor para agregar el token a todas las peticiones
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

  // Interceptor de respuestas (response) para manejar tokens expirados
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido, redirigir al login
        Cookies.remove('token');
        // Si tienes un contexto de autenticación, puedes usarlo aquí
        // window.location.href = '/login';
        console.warn('Token expirado. Por favor, inicia sesión nuevamente.');
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
}));

export const instanceCursos = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/courses`,
}));

export const instanceEnrollmentss = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
}));

export const instanceReports = addAuthInterceptor(axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/report-problem`,
  headers: {
    "Content-Type": "application/json",
  }
}));

export default instance