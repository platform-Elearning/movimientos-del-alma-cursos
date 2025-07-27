import Cookies from "js-cookie";

export const AuthUtils = {
  // Obtener token del localStorage o cookies
  getToken: () => {
    return localStorage.getItem('token') || Cookies.get('token');
  },

  // Guardar token en localStorage y cookies
  setToken: (token) => {
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 1, sameSite: 'Lax' }); // Expira en 1 día
  },

  // Eliminar token del localStorage y cookies
  removeToken: () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = AuthUtils.getToken();
    return !!token;
  },

  // Decodificar token JWT (básico, solo para obtener información)
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Verificar si el token ha expirado
  isTokenExpired: (token) => {
    try {
      const decodedToken = AuthUtils.decodeToken(token);
      if (!decodedToken || !decodedToken.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Limpiar autenticación si el token ha expirado
  checkAndCleanExpiredToken: () => {
    const token = AuthUtils.getToken();
    if (token && AuthUtils.isTokenExpired(token)) {
      AuthUtils.removeToken();
      return false;
    }
    return !!token;
  }
};

export default AuthUtils;
