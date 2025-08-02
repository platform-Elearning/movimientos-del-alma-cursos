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

    // Función para cerrar sesión
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
            setIsAuthenticated(false);
            return;
        }

        try {
            const dataDecoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (dataDecoded.exp < currentTime) {
                setIsAuthenticated(false);
                clearUserState();
                return;
            }
            
            setUserFromToken(token);
            
        } catch (err) {
            setIsAuthenticated(false);
            clearUserState();
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

    // Solo escuchar eventos para limpiar estado
    useEffect(() => {
        const handleTokenExpired = () => {
            clearUserState();
        };

        // Solo escuchar eventos críticos
        window.addEventListener('auth:token-expired', handleTokenExpired);
        window.addEventListener('auth:logout', handleTokenExpired);

        // Verificar autenticación inicial
        checkLogin();

        return () => {
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