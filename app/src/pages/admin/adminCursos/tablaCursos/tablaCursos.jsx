import React, { useEffect, useState } from "react";
import getCourses from "../../../../api/cursos";
import AddStudentModal from "../createStudent/AddStudentModal";
import { useNavigate } from "react-router-dom";
import "./tablaCursos.css";

const CoursesTable = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Función para traer los cursos desde la API
  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      if (response && response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        setLoading(false);
      } else {
        throw new Error("La respuesta de la API no es un array válido");
      }
    } catch (err) {
      setError("Error al cargar los cursos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddStudentClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourseId(null);
  };

  const handleEditClick = (courseId) => {
    navigate(`/admin/editarCurso/${courseId}`); 
  };

  // ✅ Nueva función para ver alumnos del curso
  const handleViewStudentsClick = (courseId) => {
    navigate(`/admin/cursos/alumnos/${courseId}`);
  };

  if (loading) return <p className="loading-message">Cargando datos...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="table-container">
      <h1 className="table-title">Lista de Cursos</h1>
      <table className="courses-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Description</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.description}</td>
              <td className="actions-cell">
                <button
                  className="action-button edit-button" 
                  onClick={() => handleEditClick(course.id)}
                >
                  Editar
                </button>
                <button 
                  className="action-button view-button"
                  onClick={() => handleViewStudentsClick(course.id)}
                >
                  Ver Alumnos
                </button>
                <button
                  className="action-button add-button"
                  onClick={() => handleAddStudentClick(course.id)}
                >
                  Agregar Alumno
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <AddStudentModal courseId={selectedCourseId} onClose={closeModal} />}
    </div>
  );
};

export default CoursesTable;