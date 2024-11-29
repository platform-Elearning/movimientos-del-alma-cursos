import "./misCursos.css";
import { useAuth } from "../../../components/context/authContext";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MisCursos = () => {
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);


    return (
        <div>
            <h1>misCursos</h1>
            <button onClick={logout}>logout</button>
        </div>
    )
}

export default MisCursos;