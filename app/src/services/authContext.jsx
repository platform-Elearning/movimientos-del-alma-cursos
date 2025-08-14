import { createContext, useState, useContext, useEffect } from "react";
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
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [errors, setErrors] = useState([]);
    const [userNav, setUserNav] = useState(null);

    // Función para limpiar el estado de usuario
    const clearUserState = () => {
        setUserId(null);
        setUserRole(null);
        setUserNav(null);
        setIsAuthenticated(false);
        Cookies.remove("token");
        localStorage.removeItem("token");
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
            
            // Guardar token
            Cookies.set("token", token, {
                expires: new Date(dataDecoded.exp * 1000),
                secure: false,
                sameSite: 'Lax',
                path: '/'
            });
            localStorage.setItem("token", token);
            
            return dataDecoded;
        } catch (error) {
            clearUserState();
            throw error;
        }
    };

    // Función para registro
    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            return res;
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error en el registro";
            setErrors([message]);
            throw err;
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


    const logout = async () => {
        try {
            await logoutRequest();
        } catch (error) {
            // Continuar con logout local independientemente del resultado del servidor
        } finally {
            clearUserState();
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    };

    // Verificar autenticación al montar
    const checkLogin = async () => {
        const token = Cookies.get("token") || localStorage.getItem("token");

        if (!token) {
            // No hay access token, intentar refresh
            try {
                console.log("No access token found, attempting refresh...");
                await attemptTokenRefresh();
            } catch (error) {
                console.log("No refresh token available or expired");
                setIsAuthenticated(false);
            }
            return;
        }

        try {
            const dataDecoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Si el token ha expirado, intentar refresh
            if (dataDecoded.exp < currentTime) {
                console.log("Access token expired, attempting refresh...");
                try {
                    await attemptTokenRefresh();
                } catch (error) {
                    console.log("Failed to refresh token on startup");
                    clearUserState();
                }
                return;
            }
            
            // Token válido, establecer usuario
            setUserFromToken(token);
            
        } catch (err) {
            console.log("Invalid token format, attempting refresh...");
            try {
                await attemptTokenRefresh();
            } catch (error) {
                console.log("Failed to refresh invalid token");
                clearUserState();
            }
        }
    };

    // Función para intentar refresh token
    const attemptTokenRefresh = async () => {
        try {
            const response = await refreshTokenRequest();
            if (response && response.token) {
                const dataDecoded = setUserFromToken(response.token);
                console.log("Token refreshed successfully on startup");
                return dataDecoded;
            } else {
                throw new Error('No token received from refresh');
            }
        } catch (error) {
            console.log("Refresh failed:", error.message);
            clearUserState();
            throw error;
        }
    };

    // Manejo de errores con temporizador
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Solo escuchar eventos para manejar renovación y expiración
    useEffect(() => {
        const handleTokenRefreshed = (event) => {
            const { token, user } = event.detail;
            console.log("Token refreshed via event, updating user state");
            
            setUserId(user.id);
            setUserRole(user.role);
            
            if (user.role === "admin") {
                setUserNav("administrador");
            } else {
                setUserNav(user.name);
            }
            
            setIsAuthenticated(true);
        };

        const handleTokenExpired = () => {
            console.log("Token expired event received, clearing state");
            clearUserState();
        };

        // Escuchar eventos de renovación y expiración
        window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
        window.addEventListener('auth:token-expired', handleTokenExpired);
        window.addEventListener('auth:logout', handleTokenExpired);

        // Verificar autenticación inicial
        checkLogin();

        return () => {
            window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
            window.removeEventListener('auth:token-expired', handleTokenExpired);
            window.removeEventListener('auth:logout', handleTokenExpired);
        };
    }, []);

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
                checkLogin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};