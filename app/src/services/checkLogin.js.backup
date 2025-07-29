
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "./authContext";

export const checkLogin = async (setIsAuthenticated, setUserId, setUserRole, setUserNav) => {
    const token = Cookies.get("token");

    if (!token) {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        return;
    }

    try {
         /*
        const res = await verifyTokenRequest(token);
        if (!res.data) {
            setIsAuthenticated(false);
            setUserRole(null);
            setUserId(null);
            return;
        }
            */
        const dataDecoded = jwtDecode(token); // Decodifica el token
        setUserId(dataDecoded.id);
        setUserRole(dataDecoded.role);
        setUserNav(dataDecoded.email);
        setIsAuthenticated(true);
    } catch (err) {
        console.error("Error al verificar el token:", err);
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
    }
};
