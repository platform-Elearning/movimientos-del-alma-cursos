import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

/**
 * Hook personalizado para manejar la expiración automática de tokens
 * Cierra sesión automáticamente cuando el token expira o hay errores de autenticación
 */
const useTokenExpiration = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Función para verificar si el token está expirado
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Considerar expirado si queda menos de 30 segundos
      return decoded.exp < (currentTime + 30);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return true;
    }
  }, []);

  // Función para limpiar sesión completamente
  const clearSession = useCallback(() => {
    // Limpiar todas las formas de almacenamiento
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Llamar al logout del contexto
    if (logout) {
      logout();
    }
    
    // Redirigir al login con mensaje
    navigate('/login', { 
      replace: true,
      state: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
    });
  }, [logout, navigate]);

  // Función para verificar token actual
  const checkTokenValidity = useCallback(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    
    if (!token || isTokenExpired(token)) {
      clearSession();
      return false;
    }
    
    return true;
  }, [isTokenExpired, clearSession]);

  // Función para manejar errores de autenticación desde componentes
  const handleAuthError = useCallback((error) => {
    if (!error?.response) return false;
    
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.errorMessage || '';
    
    // SOLO casos muy específicos que indican sesión expirada
    const authErrors = [
      // Solo errores 401 (Unauthorized) - token inválido/expirado
      status === 401,
      // Solo 409 con mensajes MUY específicos de token
      status === 409 && message.toLowerCase().includes('token expired'),
      status === 409 && message.toLowerCase().includes('token invalid'),
      status === 409 && message.toLowerCase().includes('jwt expired'),
      status === 409 && message.toLowerCase().includes('unauthorized token')
    ];
    
    if (authErrors.some(Boolean)) {
      console.warn('🚨 Token realmente expirado detectado:', { status, message });
      clearSession();
      return true;
    }
    
    // NO hacer logout por otros errores
    return false;
  }, [clearSession]);

  // Verificar token cada vez que se monta el componente
  useEffect(() => {
    checkTokenValidity();
  }, [checkTokenValidity]);

  // Verificar token periódicamente (cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenValidity();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  // Escuchar eventos de expiración de otros componentes
  useEffect(() => {
    const handleTokenExpired = () => {
      clearSession();
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:session-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:session-expired', handleTokenExpired);
    };
  }, [clearSession]);

  return {
    checkTokenValidity,
    handleAuthError,
    clearSession,
    isTokenExpired
  };
};

export default useTokenExpiration;
