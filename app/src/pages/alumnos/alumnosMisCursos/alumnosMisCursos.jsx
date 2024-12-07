import "./alumnosMisCursos.css";
import { useState } from "react";

const AlumnosMisCursos = () => {

  const [cursos, setCursos] = useState([]);

    const fetchCursos = async () => {
      try {
        const cursosData = await getCursos();
        setCursos(cursosData);
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
      }
    };




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
