import { createContext, useState, useContext, useEffect  } from "react"
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth.js"
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    
    if (!context) {
        throw new Error("useAuth must be used whitin an AuthProvider")
    }
    return context
}

export const AuthProvider = ({children}) => {
    const [userId, setUserId] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [errors, setErrors] = useState([])
    const [userNav, setUserNav] = useState(null)


    const signup = async (user) => {
        try {
            const res = await registerRequest(user)
            console.log(res)
        } catch (err) {
            setErrors(err.response.data)
        }
    }

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            const dataDecoded = jwtDecode(res.token);
            console.log(dataDecoded);
            setUserId(dataDecoded.id);
            setUserRole(dataDecoded.role);
            setUserNav(dataDecoded.email);
            setIsAuthenticated(true);
            return res;
        } catch (error) {
            if (error.response && Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response?.data?.message || "Ocurrió un error inesperado"]);
        }
    };

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            },5000)
            return () => clearTimeout(timer)
        }
    },[errors])

    useEffect(() => {
        async function checkLogin () {
            const cookies = Cookies.get()


            if (!cookies.token){
                setIsAuthenticated(false)
                console.log(cookies.token)
                setUserId(null)
                setUserRole(null)
                return 
            }
            try {
                const res = await verifyTokenRequest(cookies.token)
               if (!res.data) {
                    setIsAuthenticated(false)
                    setUserRole(null)
                    return 
                }
                    
                setIsAuthenticated(true)
                setUserId(res.data)
            } catch(err) {
                setIsAuthenticated(false)
                setUserId(null)
                setUserRole(null)
            }
            
        }
        checkLogin()
    },[])

    const logout = () => {
        setUserNav(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value= {{signup, signin,  userId, userRole, userNav, setUserNav, isAuthenticated, setIsAuthenticated, errors, logout }}>
            {children}
        </AuthContext.Provider>

    )
}
