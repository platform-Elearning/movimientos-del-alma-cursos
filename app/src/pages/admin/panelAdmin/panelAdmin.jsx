import "./panelAdmin.css";
import { useAuth } from "../../../services/authContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PanelAdmin = () => {
    
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
          navigate("/"); // Redirige si no está autenticado
        }
        /*
        const fetchCursos = async () => {
          try {
            const cursosData = await getCursos();
            setCursos(cursosData);
          } catch (error) {
            console.error("Error al obtener los cursos:", error);
          }
        };
    
        if (isAuthenticated) {
          fetchCursos();
        }
          */
      }, [isAuthenticated, navigate]);

      const handleNavigate = (path) => {
        navigate(path);
      };
    
      return (
        <div className="navigation-buttons-container">
          <button
            className="navigation-button"
            onClick={() => handleNavigate("/admin/alumnos")}
          >
            Alumnos
          </button>
          <button
            className="navigation-button"
            onClick={() => handleNavigate("/admin/profesores")}
          >
            Profesores
          </button>
          <button
            className="navigation-button"
            onClick={() => handleNavigate("/admin/cursos")}
          >
            Cursos
          </button>
        </div>
      );
}

export default PanelAdmin;