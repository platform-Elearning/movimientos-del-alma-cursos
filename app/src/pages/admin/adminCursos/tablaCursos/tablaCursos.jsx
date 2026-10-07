import React, { useEffect, useState } from "react";
import getCourses from "../../../../api/cursos";
import AddStudentModal from "../createStudent/AddStudentModal";
import UnenrollStudentModal from "../deleteStudent/UnenrollStudentModal";
import EliminarCurso from "../eliminarCurso/EliminarCurso";
import { useNavigate } from "react-router-dom";
import "./tablaCursos.css";

const CoursesTable = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [cursoABorrar, setCursoABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

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

  const handleDeleteStudentClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowUnenrollModal(true);
  };

  const closeUnenrollModal = () => {
    setShowUnenrollModal(false);
    setSelectedCourseId(null);
  };

  const handleUnenrollSuccess = () => {
    // Optionally refresh the courses list or show a success message
    fetchCourses();
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
      <div className="cursos-table-container" >


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
                  title="Cambiar nombre y descripción, y gestionar módulos y clases"
                >
                  Editar curso
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
                <button
                  className="action-button unenroll-button"
                  onClick={() => handleDeleteStudentClick(course.id)}
                  title="Sacar a una alumna de este curso (no borra a la alumna ni el curso)"
                >
                  Desinscribir alumno
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => setCursoABorrar(course)}
                  title="Borrar el curso con sus módulos y clases"
                >
                  Eliminar curso
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {aviso && (
        <p className="cursos-aviso" role="status">
          {aviso}
        </p>
      )}

      {cursoABorrar && (
        <EliminarCurso
          curso={cursoABorrar}
          onCerrar={() => setCursoABorrar(null)}
          onBorrado={(curso) => {
            setCursoABorrar(null);
            setAviso(`Se eliminó el curso "${curso.name}".`);
            fetchCourses();
          }}
        />
      )}

      {showModal && <AddStudentModal courseId={selectedCourseId} onClose={closeModal} />}
      {showUnenrollModal && (
        <UnenrollStudentModal 
          courseId={selectedCourseId} 
          onClose={closeUnenrollModal}
          onSuccess={handleUnenrollSuccess}
        />
      )}
    </div>
  );
};

export default CoursesTable;