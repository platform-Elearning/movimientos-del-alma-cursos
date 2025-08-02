import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const REQUEST_TIMEOUT = 30000; // Para evitar peticiones colgadas
const REFRESH_TIMEOUT = 10000; // Para evitar refresh colgado

// Control de refresh concurrente
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const getAuthToken = () => {
  return Cookies.get('token') || localStorage.getItem('token');
};

const refreshAuthToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/session/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: REFRESH_TIMEOUT
      }
    );

    const { token } = response.data;
    
    if (!token) {
      throw new Error('No se recibió token del servidor');
    }
    
    const decoded = jwtDecode(token);
    
    // Guardar el nuevo token
    Cookies.set('token', token, {
      expires: new Date(decoded.exp * 1000),
      secure: false,
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('token', token);
    
    onRefreshed(token);
    
    // Notificar al contexto que el token se renovó
    window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
      detail: { token, user: decoded }
    }));
    
    return token;
  } catch (error) {
    Cookies.remove('token');
    localStorage.removeItem('token');
    
    window.dispatchEvent(new CustomEvent('auth:token-expired', {
      detail: { error }
    }));
    
    onRefreshed(null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Verificar error específico del backend
const isTokenExpiredError = (error) => {
  if (!error.response) return false;
  
  const { status, data } = error.response;
  
  return (
    status === 403 &&
    data &&
    data.error === "Forbidden" &&
    data.expired === true &&
    typeof data.details === "string"
  );
};

const addAuthInterceptor = (instance) => {
  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (isTokenExpiredError(error) && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshAuthToken();
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          window.dispatchEvent(new CustomEvent('auth:token-expired', {
            detail: { error: refreshError }
          }));
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Configuración base
const baseConfig = {
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Instancias de Axios
export const instance = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
  })
);

export const instanceUsers = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  })
);

export const instanceCursos = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  })
);

export const instanceEnrollments = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  })
);

export const instanceReports = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  })
);

export default instance;