import "./profesoresMisCursos.css";
import { getCursos } from "../../../api/cursos";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../../../utils/authUtils";

const ProfesoresMisCursos = () => {
    const [cursos, setCursos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar autenticación
        if (!AuthUtils.checkAndCleanExpiredToken()) {
            navigate('/login');
            return;
        }

        // Redirigir al nuevo dashboard del teacher
        const token = AuthUtils.getToken();
        const decodedToken = AuthUtils.decodeToken(token);
        
        if (decodedToken && (decodedToken.role === 'teacher' || decodedToken.role === 'admin')) {
            navigate('/profesores/dashboard');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1.2rem'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '1rem',
                    animation: 'spin 1s linear infinite'
                }}>♾️</div>
                <p>Cargando dashboard del profesor...</p>
            </div>
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default ProfesoresMisCursos;