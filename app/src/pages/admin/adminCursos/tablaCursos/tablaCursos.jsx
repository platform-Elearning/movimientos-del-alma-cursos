import React, { useEffect, useState } from "react";
import getCourses from "../../../../api/cursos";
import AddStudentModal from "../agregarAlumno/AddStudentModal";
import "./tablaCursos.css";

const CoursesTable = () => {
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
      console.error("Error al cargar los cursos:", err);
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
            <th>Duración (meses)</th>
            <th>Lecciones</th>
            <th>Videos</th>
            <th>Cuota de Inscripción (USD)</th>
            <th>Cuota Mensual (USD)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.duration_months}</td>
              <td>{course.quantity_lessons}</td>
              <td>{course.quantity_videos}</td>
              <td>${course.enrollment_fee_usd}</td>
              <td>${course.monthly_fee_usd}</td>
              <td>
                <button className="action-button edit-button">Editar</button>
                <button className="action-button view-button">Ver Alumnos</button>
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
