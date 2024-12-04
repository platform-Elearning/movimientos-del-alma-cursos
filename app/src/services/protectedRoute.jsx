import { useAuth } from "./authContext"
import { Navigate } from "react-router-dom"

function  ProtectedRoute () {
    
    const {isAuthenticated} = useAuth()


    if (!isAuthenticated) return <Navigate to='/login' replace/>
}

export default  ProtectedRoute