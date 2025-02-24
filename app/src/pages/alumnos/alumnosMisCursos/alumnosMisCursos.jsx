import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoursesByStudentId } from "../../../api/cursos";
import "./alumnosMisCursos.css";

const AlumnosMisCursos = () => {
  const { alumnoId } = useParams(); // Obtener el ID del estudiante desde la URL
  const navigate = useNavigate(); // Inicializar navigate
  const [cursos, setCursos] = useState([]); // Estado inicial como un array vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCursos = async () => {
    try {
      const cursosData = await getCoursesByStudentId(alumnoId);
      console.log("Datos recibidos de la API:", cursosData);

      if (cursosData.success && Array.isArray(cursosData.data)) {
        setCursos(cursosData.data);
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado");
      }
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      setError("Error al obtener los cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, [alumnoId]); // Llamar a fetchCursos cuando cambie el id del alumno

  const goToCourse = (courseId) => {
    navigate(`/alumnos/${alumnoId}/curso/${courseId}`);
  };

  if (loading) return <p className="loading-message">Cargando cursos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="cursos-container">
      <h3 className="cursos-title">Mis Cursos</h3>
      <table className="cursos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Duración (meses)</th>
            <th>Lecciones</th>
            <th>Videos</th>
          </tr>
        </thead>
        <tbody>
          {cursos.length > 0 ? (
            cursos.map((curso) => (
              <tr key={curso.course_id} onClick={() => goToCourse(curso.course_id)} className="clickable-row">
                <td>{curso.course_name}</td>
                <td>{curso.duration_months}</td>
                <td>{curso.quantity_lessons}</td>
                <td>{curso.quantity_videos}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No hay cursos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosMisCursos;
