import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./curso.css";
import { getModulesByAlumnoAndCurso } from "../../../api/cursos";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams(); // Obtener el ID del curso y del alumno desde la URL
  const [modules, setModules] = useState([]); // Estado inicial para los módulos
  const [loading, setLoading] = useState(true); // Mostrar el mensaje de carga al principio
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para obtener los módulos desde la API
  const fetchModules = async () => {
    try {
      const response = await getModulesByAlumnoAndCurso(alumnoId, cursoId);
      console.log("Respuesta de la API:", response);
  
      if (response.success && Array.isArray(response.data)) {
        const course = response.data.find((course) => course.courseId === parseInt(cursoId));
  
        if (course) {
          const formattedModules = course.courseModules.map((module) => ({
            id: module.moduleId,
            name: module.moduleName,
            classes: module.moduleLessons.map((lesson) => ({
              id: lesson.lessonId,
              name: lesson.lessonTitle,
              description: lesson.lessonDescription,
              lessonUrl: lesson.lessonUrl, // Aseguramos que lessonUrl esté disponible
            })),
          }));
  
          setModules(formattedModules);
        } else {
          setError("Curso no encontrado");
        }
      } else {
        throw new Error("La respuesta de la API no tiene el formato esperado");
      }
    } catch (error) {
      console.error("Error al obtener los módulos:", error);
      setError("Error al obtener los módulos");
    } finally {
      setLoading(false);
    }
  };
  

  // Llamamos a la función para obtener los datos cuando se monta el componente
  useEffect(() => {
    fetchModules();
  }, [cursoId]);

  // Función para navegar al módulo específico con datos
  const goToModule = (moduleId) => {
    const selectedModule = modules.find((mod) => mod.id === moduleId);
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}/modulo/${moduleId}`, {
      state: { module: selectedModule },
    });
  };

  if (loading) return <p className="loading-message">Cargando módulos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="course-details-container">
      <h2 className="course-title">Detalles del Curso</h2>
      {modules.length > 0 ? (
        <div className="modules-grid">
          {modules.map((module) => (
            <div
              key={module.id}
              className="module-card"
              onClick={() => goToModule(module.id)}
            >
              <h3 className="module-name">{module.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay módulos disponibles para este curso.</p>
      )}
    </div>
  );
};

export default CourseDetails;