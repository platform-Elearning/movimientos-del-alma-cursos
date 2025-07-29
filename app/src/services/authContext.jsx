import { createContext, useState, useContext, useEffect, useRef } from "react";
import { registerRequest, loginRequest, refreshTokenRequest, logoutRequest } from "../api/auth.js";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, false = not auth, true = auth
    const [errors, setErrors] = useState([]);
    const [userNav, setUserNav] = useState(null);
    
    // Refs para controlar el refresh token
    const isRefreshing = useRef(false);
    const refreshPromise = useRef(null);
    const tokenCheckInterval = useRef(null);

    // Función para limpiar el estado de usuario
    const clearUserState = () => {
        setUserId(null);
        setUserRole(null);
        setUserNav(null);
        setIsAuthenticated(false);
        Cookies.remove("token");
        localStorage.removeItem("token");
        
        // Limpiar el intervalo de verificación de token
        if (tokenCheckInterval.current) {
            clearInterval(tokenCheckInterval.current);
            tokenCheckInterval.current = null;
        }
    };

    // Función para establecer el estado del usuario desde el token
    const setUserFromToken = (token) => {
        try {
            const dataDecoded = jwtDecode(token);
            
            // Verificar si el token ha expirado
            const currentTime = Date.now() / 1000;
            if (dataDecoded.exp < currentTime) {
                clearUserState();
                return null;
            }
            
            setUserId(dataDecoded.id);
            setUserRole(dataDecoded.role);
            
            if (dataDecoded.role === "admin") {
                setUserNav("administrador");
            } else {
                setUserNav(dataDecoded.name);
            }
            
            setIsAuthenticated(true);
            Cookies.set("token", token, {
                expires: new Date(dataDecoded.exp * 1000), // Usar la fecha de expiración del token
                secure: false, // Cambiar a false para desarrollo local
                sameSite: 'Lax', // Cambiar de Strict a Lax
                path: '/' // Asegurar que sea accesible en toda la app
            });
            localStorage.setItem("token", token);
            
            // TEMPORALMENTE DESACTIVADO: Iniciar verificación periódica del token
            // Uncomment when backend refresh-token is fixed:
            // startTokenCheck();
            
            return dataDecoded;
        } catch (error) {
            console.error('Error al decodificar token:', error);
            clearUserState();
            throw error;
        }
    };

    // Función para verificar si el token está próximo a expirar
    const isTokenExpiringSoon = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = decoded.exp - currentTime;
            
            // Si queda menos de 5 minutos (300 segundos), considerar que expira pronto
            return timeUntilExpiry < 300;
        } catch (error) {
            return true; // Si no se puede decodificar, asumir que expira
        }
    };

    // Función para verificar el estado del token periódicamente
    const startTokenCheck = () => {
        // Limpiar intervalo anterior si existe
        if (tokenCheckInterval.current) {
            clearInterval(tokenCheckInterval.current);
        }
        
        // Verificar cada 4 minutos (240 segundos)
        tokenCheckInterval.current = setInterval(async () => {
            const token = Cookies.get("token") || localStorage.getItem("token");
            
            if (!token) {
                clearUserState();
                return;
            }
            
            if (isTokenExpiringSoon(token)) {
                try {
                    await refreshToken();
                } catch (error) {
                    console.error('Error al renovar token automáticamente:', error);
                    clearUserState();
                }
            }
        }, 4 * 60 * 1000); // 4 minutos
    };

    // Función para intentar refrescar el token
    const refreshToken = async () => {
        // Si ya estamos refrescando, retornar la promesa existente
        if (isRefreshing.current && refreshPromise.current) {
            return refreshPromise.current;
        }

        isRefreshing.current = true;
        
        // Crear la promesa del refresh
        refreshPromise.current = (async () => {
            try {
                const response = await refreshTokenRequest();
                const { token } = response;
                
                setUserFromToken(token);
                
                return token;
                
            } catch (error) {
                console.error('Error al refrescar token:', error.message);
                clearUserState();
                throw error;
            } finally {
                isRefreshing.current = false;
                refreshPromise.current = null;
            }
        })();
        
        return refreshPromise.current;
    };

    // Función para registro
    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            console.log(res);
        } catch (err) {
            setErrors(err.response?.data || ["Error en el registro"]);
        }
    };

    // Función para inicio de sesión
    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            const dataDecoded = setUserFromToken(res.token);
            
            if (dataDecoded) {
                return res;
            } else {
                throw new Error('Token inválido recibido del servidor');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Error al iniciar sesión";
            setErrors([message]);
            throw error;
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            // TEMPORALMENTE DESACTIVADO: logout en servidor
            // await logoutRequest();
            console.log('Logout local - servidor deshabilitado temporalmente');
        } catch (error) {
            console.warn('Error al hacer logout en servidor:', error.message);
        } finally {
            // Limpiar estado local independientemente del resultado del servidor
            clearUserState();
        }
    };

    // Verificar autenticación al montar
    const checkLogin = async () => {
        const token = Cookies.get("token") || localStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const dataDecoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // TEMPORALMENTE DESACTIVADO: Renovación automática de tokens
            // Hasta que el backend tenga configurado el cookie-parser
            
            // Si el token ha expirado, no intentar renovar, solo limpiar
            if (dataDecoded.exp < currentTime) {
                console.warn('Token expirado, redirigiendo al login');
                setIsAuthenticated(false);
                clearUserState();
                return;
            }
            
            // Si el token es válido, usarlo
            setUserFromToken(token);
            
        } catch (err) {
            console.error("Error al verificar el token:", err);
            setIsAuthenticated(false);
        }
    };

    // Manejo de errores con temporizador
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => setErrors([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Verificar autenticación al montar el componente
    useEffect(() => {
        checkLogin();
        
        // Cleanup al desmontar
        return () => {
            if (tokenCheckInterval.current) {
                clearInterval(tokenCheckInterval.current);
            }
        };
    }, []);

    // Función para verificar manualmente el token (útil para debugging)
    const verifyToken = () => {
        const token = Cookies.get("token") || localStorage.getItem("token");
        if (!token) {
            console.log('❌ No hay token');
            return null;
        }
        
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = decoded.exp - currentTime;
            
            console.log('🔍 Estado del token:', {
                válido: timeUntilExpiry > 0,
                expiraEn: `${Math.floor(timeUntilExpiry / 60)} minutos`,
                usuario: decoded.name || decoded.email,
                rol: decoded.role
            });
            
            return decoded;
        } catch (error) {
            console.error('❌ Token inválido:', error);
            return null;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                logout,
                userId,
                userRole,
                userNav,
                setUserNav,
                isAuthenticated,
                errors,
                checkLogin,
                refreshToken,
                verifyToken, // Para debugging
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};