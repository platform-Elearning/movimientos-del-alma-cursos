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

  // Datos hardcodeados como respaldo
  const hardcodedCursos = [
    { id: 1, name: "Danza Clásica", age: 25, profession: "Ingeniero" },
    { id: 2, name: "Ritmos Africanos", age: 30, profession: "Doctora" },
    { id: 3, name: "Danzas caribeñas", age: 22, profession: "Estudiante" },
  ];

  const displayedCursos = cursos.length > 0 ? cursos : hardcodedCursos;

  return (
    <div className="cursos-container">
      <h3 className="cursos-title">Mis Cursos</h3>
      <table className="cursos-table">
        <tbody>
          {displayedCursos.map((curso) => (
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
