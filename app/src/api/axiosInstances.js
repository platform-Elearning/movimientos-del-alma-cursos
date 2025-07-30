import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// =====================================================
// 🔧 CONFIGURACIÓN Y CONSTANTES
// =====================================================

const TOKEN_REFRESH_THRESHOLD = 300; // 5 minutos en segundos
const REQUEST_TIMEOUT = 30000; // 30 segundos
const REFRESH_TIMEOUT = 10000; // 10 segundos para refresh

// Estado para controlar refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

// =====================================================
// 🛠️ UTILIDADES DE TOKEN
// =====================================================

const getAuthToken = () => {
  return Cookies.get('token') || localStorage.getItem('token');
};

const isTokenExpiringSoon = (token, threshold = TOKEN_REFRESH_THRESHOLD) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    return timeUntilExpiry < threshold;
  } catch (error) {
    return true;
  }
};

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

// =====================================================
// 🔄 MANEJO DE REFRESH TOKEN
// =====================================================

const refreshAuthToken = async () => {
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
    
    Cookies.set('token', token, {
      expires: new Date(decoded.exp * 1000),
      secure: false,
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('token', token);
    
    return token;
  } catch (error) {
    Cookies.remove('token');
    localStorage.removeItem('token');
    
    // Emitir evento para componentes que lo escuchen
    window.dispatchEvent(new CustomEvent('auth:token-expired'));
    
    throw error;
  }
};

// =====================================================
// 🔒 INTERCEPTORES DE AXIOS
// =====================================================

const addAuthInterceptor = (instance, instanceName = 'default') => {
  // Request Interceptor
  instance.interceptors.request.use(
    async (config) => {
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

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // Solo emitir evento para errores 401 (token realmente expirado)
      if (error.response?.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:token-expired', {
          detail: { error: error, instance: instanceName }
        }));
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// =====================================================
// 📡 INSTANCIAS DE AXIOS
// =====================================================

const baseConfig = {
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const instance = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
  }),
  'instance'
);

export const instanceUsers = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  }),
  'instanceUsers'
);

export const instanceCursos = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  }),
  'instanceCursos'
);

export const instanceEnrollments = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  }),
  'instanceEnrollments'
);

export const instanceReports = addAuthInterceptor(
  axios.create({
    ...baseConfig,
    baseURL: `${import.meta.env.VITE_API_URL}`,
  }),
  'instanceReports'
);

// =====================================================
// 🔍 UTILIDADES PÚBLICAS
// =====================================================

export const getTokenInfo = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    return {
      userId: decoded.id,
      userRole: decoded.role,
      userName: decoded.name,
      email: decoded.email,
      isValid: timeUntilExpiry > 0,
      expiresIn: Math.floor(timeUntilExpiry),
      expiresInMinutes: Math.floor(timeUntilExpiry / 60),
      isExpiringSoon: timeUntilExpiry < TOKEN_REFRESH_THRESHOLD,
      token: token
    };
  } catch (error) {
    return null;
  }
};

export const forceTokenRefresh = () => {
  return refreshAuthToken();
};

export default instance;