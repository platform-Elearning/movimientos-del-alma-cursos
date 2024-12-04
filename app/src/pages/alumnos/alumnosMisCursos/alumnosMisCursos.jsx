import "./alumnosMisCursos.css";
import { getCursos } from "../../../api/cursos";
import { useState, useEffect } from "react";
import { useAuth } from "../../../services/authContext";
import { useNavigate } from "react-router-dom";

const AlumnosMisCursos = () => {

  const [cursos, setCursos] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/"); // Redirige si no está autenticado
    }

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
  }, [isAuthenticated, navigate]);

  return (
    <div className="cursos-container">
      <h3 className="cursos-title">Mis Cursos</h3>
      <table className="cursos-table">
        <tbody>
          {cursos.map((curso) => (
            <tr key={curso.id}>
              <td>{curso.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosMisCursos;
