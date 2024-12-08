

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./curso.css";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams(); // Obtener el ID del curso y del alumno desde la URL
  const [modules, setModules] = useState([]); // Estado inicial para los módulos
  const [loading, setLoading] = useState(false); // Cambié a false para mostrar los datos simulados directamente
  const [error, setError] = useState(null);
  const navigate = useNavigate();


    /*
  const fetchModules = async () => {
    try {
      const modulesData = await getModulesByCourseId(courseId);
      if (modulesData.success && Array.isArray(modulesData.data)) {
        setModules(modulesData.data);
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
    */

  // Datos simulados
  const modulesData = {
    success: true,
    data: [
      {
        id: 1,
        name: "Módulo 1: Introducción",
        classes: [
          { id: 1, name: "Clase 1: Introducción a la programación" },
          { id: 2, name: "Clase 2: Configuración del entorno" },
        ],
      },
      {
        id: 2,
        name: "Módulo 2: Conceptos Básicos",
        classes: [
          { id: 3, name: "Clase 1: Variables y Tipos de Datos" },
          { id: 4, name: "Clase 2: Estructuras de Control" },
        ],
      },
    ],
  };

  // Simula cargar los datos en el estado al montar el componente
  useEffect(() => {
    setModules(modulesData.data);
  }, []);

  // Función para navegar a la clase específica
  const goToClase = (classId) => {
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}/clase/${classId}`);
  };

  if (loading) return <p className="loading-message">Cargando módulos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="course-details-container">
      <h2 className="course-title">Detalles del Curso</h2>
      {modules.length > 0 ? (
        <table className="modules-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Clases</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.id}>
                <td className="module-name">{module.name}</td>
                <td>
                  <ul className="classes-list">
                    {module.classes.map((classItem) => (
                      <li
                        key={classItem.id}
                        className="class-name"
                        onClick={() => goToClase(classItem.id)}
                      >
                        {classItem.name}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay módulos disponibles para este curso.</p>
      )}
    </div>
  );
};

export default CourseDetails;
