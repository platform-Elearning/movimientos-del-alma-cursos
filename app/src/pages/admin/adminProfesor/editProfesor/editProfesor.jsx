import React, { useState, useEffect } from "react";
import "./editProfesor.css";
import BackLink from "../../../../components/backLink/BackLink";
import { useNavigate, useLocation } from "react-router-dom";
import ValidateField from "../../../../components/form/validateField/ValidateField";
import { 
  deleteProfesor, 
  updateTeacher, 
  assignCourseToTeacher
} from "../../../../api/profesores";
import { getCursos } from "../../../../api/cursos";

const EditProfesor = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    name: "",
    lastname: "",
    course_id: "",
  });

  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state;

  const goToTeachers = () => {
    navigate(`/admin/profesores`);
  };

  console.log("User:", user);

  // Cargar cursos disponibles
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesResponse = await getCursos();
        if (coursesResponse && coursesResponse.data) {
          setCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setErrors(["Error al cargar los cursos disponibles"]);
      }
    };

    fetchCourses();
  }, []);

  // Pre-rellenar el formulario con los datos del profesor
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || "",
        email: user.email || "",
        name: user.name || "",
        lastname: user.lastname || "",
        course_id: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, errors, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Actualizando profesor con datos:", formData);
      await updateTeacher(formData);
      setSuccessMessage("Profesor actualizado con éxito");
      setErrors([]);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al actualizar el profesor:", error);
      setErrors([
        error.response?.data?.message || "Error al actualizar el profesor",
      ]);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Función para asignar curso
  const handleAssignCourse = async () => {
    if (!formData.course_id) {
      setErrors(["Por favor selecciona un curso para asignar"]);
      return;
    }

    setIsLoading(true);
    try {
      await assignCourseToTeacher(formData.id, formData.course_id);
      setSuccessMessage("Curso asignado exitosamente al profesor");
      setFormData({ ...formData, course_id: "" }); // Limpiar selección
      setErrors([]);
      if (onUpdate) onUpdate(); // Refrescar la tabla
    } catch (error) {
      console.error("Error al asignar curso:", error);
      const errorMessage = error.response?.data?.error || "Error al asignar el curso";
      setErrors([errorMessage]);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas borrar este profesor?"
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log("Borrando profesor con ID:", formData.id);
      await deleteProfesor(formData.id);
      setSuccessMessage("Profesor eliminado con éxito");
      if (onUpdate) onUpdate();
      goToTeachers();
    } catch (error) {
      console.error("Error al eliminar el profesor:", error);
      setErrors([
        error.response?.data?.message || "Error al eliminar el profesor",
      ]);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <BackLink title="Volver a Profesores" onClick={() => goToTeachers()} />
      <div className="edit-user-container">
        <h2 className="edit-user-title">Editar Profesor</h2>
        
        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="edit-user-field">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="edit-user-field">
            <label htmlFor="name">Nombre:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="edit-user-field">
            <label htmlFor="lastname">Apellido:</label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="edit-user-field">
            <label htmlFor="course_id">Asignar Curso:</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Selecciona un curso...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="edit-user-submit"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
          
          <button
            type="button"
            className="assign-course-btn"
            onClick={handleAssignCourse}
            disabled={isLoading || !formData.course_id}
          >
            {isLoading ? "Asignando..." : "Asignar Curso"}
          </button>
          
          <button
            type="button"
            className="edit-user-cancel"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Eliminando..." : "Borrar Profesor"}
          </button>
        </form>

        {successMessage && (
          <p className="edit-user-success">{successMessage}</p>
        )}
        {errors.length > 0 && (
          <div className="edit-user-errors">
            {errors.map((error, index) => (
              <p key={index} className="edit-user-error">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfesor;
