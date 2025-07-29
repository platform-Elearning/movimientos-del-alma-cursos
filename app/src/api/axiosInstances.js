import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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

// Función para verificar si el token está próximo a expirar
const isTokenExpiringSoon = (token, threshold = 300) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    return timeUntilExpiry < threshold; // threshold en segundos (default: 5 minutos)
  } catch (error) {
    return true; // Si no se puede decodificar, asumir que expira
  }
};

// Función para refrescar el token
const refreshAuthToken = async () => {
  try {
    console.log('🔄 Renovando token...');
    
    // Configurar correctamente las cookies para el backend
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/session/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    const { token } = response.data;
    
    if (!token) {
      throw new Error('No se recibió token del servidor');
    }
    
    // Verificar que el nuevo token sea válido
    const decoded = jwtDecode(token);
    
    // Guardar el nuevo token con configuración correcta para el backend
    Cookies.set('token', token, {
      expires: new Date(decoded.exp * 1000),
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'Lax', // Cambiar de Strict a Lax
      path: '/' // Asegurar que sea accesible en toda la app
    });
    localStorage.setItem('token', token);
    
    console.log('✅ Token renovado exitosamente');
    return token;
  } catch (error) {
    console.error('❌ Error al renovar token:', error.response?.data || error.message);
    
    // Si falla el refresh, limpiar todo
    Cookies.remove('token');
    localStorage.removeItem('token');
    
    // Emitir evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('auth:token-expired'));
    
    // Solo redirigir si no estamos ya en login
    if (!window.location.pathname.includes('/login')) {
      console.log('🔄 Redirigiendo al login...');
      window.location.href = '/login';
    }
    
    throw error;
  }
};

const addAuthInterceptor = (instance, instanceName = 'default') => {
  // Interceptor de peticiones (request)
  instance.interceptors.request.use(
    async (config) => {
      const token = getAuthToken();
      
      if (token) {
        // TEMPORALMENTE DESACTIVADO: Verificar si el token está próximo a expirar
        // Uncomment when backend refresh-token is fixed:
        /*
        if (isTokenExpiringSoon(token, 300)) { // 5 minutos
          console.log(`🔄 Token próximo a expirar en ${instanceName}, renovando antes de la petición...`);
          
          try {
            // Si ya se está refrescando, esperar
            if (isRefreshing) {
              await new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              });
            } else {
              await refreshAuthToken();
            }
            
            // Usar el token actualizado
            const newToken = getAuthToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
          } catch (error) {
            console.error(`❌ Error al renovar token antes de petición en ${instanceName}:`, error);
            return Promise.reject(error);
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
        */
        
        // Por ahora, solo usar el token actual sin renovación automática
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      console.error(`❌ Error en request interceptor de ${instanceName}:`, error);
      return Promise.reject(error);
    }
  );

  // Interceptor de respuestas (response)
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      console.warn(`Error ${error.response?.status} en ${instanceName}:`, error.message);
      
      // SOLO emitir evento para errores 401 (token realmente expirado)
      if (error.response?.status === 401) {
        console.warn('Token inválido o expirado detectado en axios interceptor');
        
        // Emitir evento para que el hook maneje la redirección
        window.dispatchEvent(new CustomEvent('auth:token-expired', {
          detail: { error: error, instance: instanceName }
        }));
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Configuración base para todas las instancias
const baseConfig = {
  withCredentials: true,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json'
  }
};

// Crear instancias con configuraciones específicas
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

export const instanceEnrollmentss = addAuthInterceptor(
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

// Función utilitaria para obtener información del token actual
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
      isExpiringSoon: timeUntilExpiry < 300, // menos de 5 minutos
      token: token
    };
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

// Función para forzar renovación de token (útil para debugging)
export const forceTokenRefresh = () => {
  return refreshAuthToken();
};

export default instance;