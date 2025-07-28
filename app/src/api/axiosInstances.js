import axios from "axios";
import Cookies from "js-cookie";

// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Función para obtener el token de las cookies
const getAuthToken = () => {
  return Cookies.get('token') || localStorage.getItem('token');
};

// Función para refrescar el token
const refreshAuthToken = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/session/refresh-token`,
      {},
      {
        withCredentials: true, // Importante: envía las cookies
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { token } = response.data;
    
    // Guardar el nuevo token
    Cookies.set('token', token);
    localStorage.setItem('token', token);
    
    console.log('✅ Token renovado exitosamente');
    return token;
  } catch (error) {
    console.error('❌ Error al renovar token:', error);
    
    // Si falla el refresh, limpiar todo y redirigir al login
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.removeItem('token');
    
    // Redirigir al login
    window.location.href = '/login';
    
    throw error;
  }
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
    async (error) => {
      const originalRequest = error.config;

      
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // Si ya estamos refrescando, agregar a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAuthToken();
          
          // Procesar la cola de peticiones pendientes
          processQueue(null, newToken);
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
          
        } catch (refreshError) {
          // Si falla el refresh, procesar la cola con error
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Para otros errores, rechazar directamente
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
