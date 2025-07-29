import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoursesByStudentId } from "../../../api/cursos";
import "./alumnosMisCursos.css";
import Card from "../../../components/card/Card";

const AlumnosMisCursos = () => {
  const { alumnoId } = useParams(); // Obtener el ID del estudiante desde la URL
  const navigate = useNavigate(); // Inicializar navigate
  const [cursos, setCursos] = useState([]); // Estado inicial como un array vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCursos = async () => {
    try {
      const cursosData = await getCoursesByStudentId(alumnoId);

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
      <div className="title-container" >
        <h2 className="cursos-title">Mis Formaciones</h2>
      </div>
      <div className="card-container">
        {cursos.map((curso) => (
          <Card
            onClick={() => goToCourse(curso.course_id)}
            key={curso.course_id}
            nombre={curso.course_name}
            description={curso.description}
            btnText="IR AL MATERIAL"
          />
        ))}
      </div>
    </div>
  );
};

export default AlumnosMisCursos;
