import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth.js";
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [userNav, setUserNav] = useState(null);

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
            const dataDecoded = jwtDecode(res.token); // Decodifica el token
            console.log(dataDecoded);
            setUserId(dataDecoded.id);
            setUserRole(dataDecoded.role);
            if (dataDecoded.role === "admin") {
                setUserNav("administrador");
            } else {
                setUserNav(dataDecoded.name);
            }
            setIsAuthenticated(true);
            Cookies.set("token", res.token); // Guarda el token en las cookies
            return res;
        } catch (error) {
            const message = error.response?.data?.message || "Error al iniciar sesión";
            setErrors([message]);
        }
    };

    // Manejo de errores con temporizador
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => setErrors([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Verificar autenticación al montar
    const checkLogin = async () => {
        const token = Cookies.get("token");

        if (!token) {
            setIsAuthenticated(false);
            setUserId(null);
            setUserRole(null);
            return;
        }

        try {
            const dataDecoded = jwtDecode(token); // Decodifica el token
            console.log(dataDecoded);
            setUserId(dataDecoded.id);
            setUserRole(dataDecoded.role);
            if (dataDecoded.role === "admin") {
                setUserNav("administrador");
            } else {
                setUserNav(dataDecoded.name);
            }
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Error al verificar el token:", err);
            setIsAuthenticated(false);
            setUserId(null);
            setUserRole(null);
        }
    };

    // Llamar a checkLogin en useEffect
    useEffect(() => {
        const verifyLogin = async () => {
            await checkLogin();
        };

        verifyLogin(); // Ejecuta la función
    }, []);

    // Cerrar sesión
    const logout = () => {
        Cookies.remove("token"); // Elimina el token de las cookies
        setUserNav(null);
        setUserId(null);
        setUserRole(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                userId,
                userRole,
                userNav,
                setUserNav,
                isAuthenticated,
                errors,
                logout,
                checkLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
