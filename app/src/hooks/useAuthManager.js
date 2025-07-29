import { useEffect, useCallback } from 'react';
import { useAuth } from '../services/authContext';
import { getTokenInfo } from '../api/axiosInstances';

/**
 * Hook personalizado para manejar la autenticación y el estado de los tokens
 * Proporciona funciones utilitarias y maneja eventos de expiración de tokens
 */
export const useAuthManager = () => {
  const auth = useAuth();

  // Función para verificar el estado actual del token
  const checkTokenStatus = useCallback(() => {
    const tokenInfo = getTokenInfo();
    
    if (!tokenInfo) {
      console.log('❌ No hay token válido');
      return {
        hasToken: false,
        isValid: false,
        needsRefresh: true,
        info: null
      };
    }

    return {
      hasToken: true,
      isValid: tokenInfo.isValid,
      needsRefresh: tokenInfo.isExpiringSoon,
      info: tokenInfo
    };
  }, []);

  // Función para manejar errores de autenticación
  const handleAuthError = useCallback((error) => {
    console.error('🔥 Error de autenticación:', error);
    
    // Si es un error de token expirado, intentar refrescar
    if (error.response?.status === 401) {
      console.log('🔄 Token expirado, intentando renovar...');
      auth.refreshToken().catch((refreshError) => {
        console.error('❌ No se pudo renovar el token:', refreshError);
        auth.logout();
      });
    }
  }, [auth]);

  // Función para hacer logout seguro
  const safeLogout = useCallback(async () => {
    try {
      await auth.logout();
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('⚠️ Error durante logout:', error);
    }
  }, [auth]);

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = useCallback((requiredRole) => {
    if (!auth.isAuthenticated || !auth.userRole) {
      return false;
    }
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(auth.userRole);
    }
    
    return auth.userRole === requiredRole;
  }, [auth.isAuthenticated, auth.userRole]);

  // Función para verificar permisos
  const hasPermission = useCallback((permission) => {
    if (!auth.isAuthenticated) return false;
    
    // Lógica básica de permisos basada en roles
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_courses'],
      teacher: ['read', 'write', 'manage_courses'],
      student: ['read']
    };
    
    const userPermissions = rolePermissions[auth.userRole] || [];
    return userPermissions.includes(permission);
  }, [auth.isAuthenticated, auth.userRole]);

  // Manejar eventos de expiración de token
  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log('🔥 Token expirado detectado:', event.detail);
      safeLogout();
    };

    const handleTokenRefreshed = (event) => {
      console.log('✅ Token renovado:', event.detail);
    };

    // Escuchar eventos personalizados
    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    };
  }, [safeLogout]);

  // Debug: Log del estado de autenticación
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const status = checkTokenStatus();
      console.log('🔍 Estado de autenticación:', {
        isAuthenticated: auth.isAuthenticated,
        userId: auth.userId,
        userRole: auth.userRole,
        tokenStatus: status
      });
    }
  }, [auth.isAuthenticated, auth.userId, auth.userRole, checkTokenStatus]);

  return {
    // Estado de autenticación del contexto
    ...auth,
    
    // Funciones utilitarias
    checkTokenStatus,
    handleAuthError,
    safeLogout,
    hasRole,
    hasPermission,
    
    // Estados derivados
    isLoading: auth.isAuthenticated === null,
    isLoggedIn: auth.isAuthenticated === true,
    isLoggedOut: auth.isAuthenticated === false,
    
    // Información del usuario
    user: {
      id: auth.userId,
      role: auth.userRole,
      displayName: auth.userNav
    }
  };
};

export default useAuthManager;