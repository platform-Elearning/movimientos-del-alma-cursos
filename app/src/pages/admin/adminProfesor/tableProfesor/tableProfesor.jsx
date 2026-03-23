import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./tableProfesor.css";
import { getProfesores, getCourseByTeacherId, deleteProfesor } from "../../../../api/profesores";

const ProfesoresTable = () => {
  const navigate = useNavigate();
  const [profesores, setProfesores] = useState([]);
  const [profesoresWithCourses, setProfesoresWithCourses] = useState([]);
  const [error, setError] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Función para obtener profesores
  const fetchProfesores = async () => {
    try {
      const response = await getProfesores();
      if (response && response.data && Array.isArray(response.data)) {
        setProfesores(response.data);
        setError("");
        // Después de obtener profesores, obtener sus cursos
        await fetchCoursesForAllTeachers(response.data);
      } else {
        throw new Error("La respuesta de la API no es válida");
      }
    } catch (err) {
      setError("Error al cargar los profesores");
    }
  };

  // Función para obtener cursos de todos los profesores
  const fetchCoursesForAllTeachers = async (teachers) => {
    setLoadingCourses(true);
    const teachersWithCourses = [];

    for (const teacher of teachers) {
      try {
        // Intentar obtener cursos del profesor
        const coursesResponse = await getCourseByTeacherId(teacher.id);
        
        let assignedCourses = [];
        if (coursesResponse && coursesResponse.success && coursesResponse.data) {
          assignedCourses = coursesResponse.data;
        }

        teachersWithCourses.push({
          ...teacher,
          assignedCourses: assignedCourses,
          coursesText: assignedCourses.length > 0 
            ? assignedCourses.map(course => course.name).join(", ")
            : "Sin asignar"
        });

      } catch (error) {
        console.warn(`No se pudieron obtener cursos para profesor ${teacher.name}:`, error);
        
        // Si hay error, agregar el profesor sin cursos
        teachersWithCourses.push({
          ...teacher,
          assignedCourses: [],
          coursesText: "Sin asignar"
        });
      }
    }

    setProfesoresWithCourses(teachersWithCourses);
    setLoadingCourses(false);
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleEdit = (profesor) => {
    navigate(`/admin/editarProfesor/${profesor.id}`, {
      state: { user: profesor },
    });
  };

  const handleDelete = async (profesor) => {
    const profesorData = profesoresWithCourses.find(p => p.id === profesor.id);
    const hasCourses = profesorData && profesorData.courses && profesorData.courses.length > 0;

    if (hasCourses) {
      alert("No se puede eliminar este profesor porque tiene cursos asignados. Por favor, desvincule todos los cursos primero.");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Está seguro que desea eliminar al profesor ${profesor.name} ${profesor.lastname}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteProfesor(profesor.id);
      alert("Profesor eliminado exitosamente");
      fetchProfesores(); // Refresh the list
    } catch (error) {
      console.error("Error al eliminar profesor:", error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Error al eliminar el profesor. Por favor, intente nuevamente.");
      }
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="profesores-section">
      <div className="profesores-header">
        <h3>Lista de Profesores</h3>
      </div>

      <div
        className="profesores-table-container"
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {error && <p className="error-message">{error}</p>}
        
        <table className="profesores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Número Identificador</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Curso Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesoresWithCourses.length > 0 ? (
              profesoresWithCourses.map((profesor, index) => (
                <tr key={profesor.id || index}>
                  <td data-label="ID">{profesor.id}</td>
                  <td data-label="Número Identificador">
                    {profesor.identification_number}
                  </td>
                  <td data-label="Nombre">{profesor.name}</td>
                  <td data-label="Apellido">{profesor.lastname}</td>
                  <td data-label="Email">{profesor.email}</td>
                  <td data-label="Curso Asignado" className="course-cell">
                    {loadingCourses ? (
                      <span className="loading-courses">⏳ Cargando...</span>
                    ) : profesor.assignedCourses.length === 0 ? (
                      <span className="course-text no-course">Sin asignar</span>
                    ) : (
                      <ul className="courses-list">
                        {profesor.assignedCourses.map((course, idx) => (
                          <li key={idx} className="course-item">
                            {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(profesor)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(profesor)}
                        disabled={profesor.assignedCourses.length > 0}
                        title={
                          profesor.assignedCourses.length > 0
                            ? "Desvincule todos los cursos antes de eliminar"
                            : "Eliminar profesor"
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              profesores.map((profesor, index) => (
                <tr key={profesor.id || index}>
                  <td data-label="ID">{profesor.id}</td>
                  <td data-label="Número Identificador">
                    {profesor.identification_number}
                  </td>
                  <td data-label="Nombre">{profesor.name}</td>
                  <td data-label="Apellido">{profesor.lastname}</td>
                  <td data-label="Email">{profesor.email}</td>
                  <td data-label="Curso Asignado">
                    <span className="loading-courses">⏳ Cargando cursos...</span>
                  </td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(profesor)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(profesor)}
                        disabled={true}
                        title="Cargando información de cursos..."
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {profesores.length === 0 && !error && (
          <div className="no-data">
            <p>No hay profesores registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfesoresTable;