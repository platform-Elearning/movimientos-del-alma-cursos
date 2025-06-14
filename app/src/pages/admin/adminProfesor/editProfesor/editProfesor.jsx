import React, { useState, useEffect } from "react";
import "./editProfesor.css"; // Archivo CSS para estilizar el formulario
import BackLink from "../../../../components/backLink/BackLink";
import { useNavigate, useLocation } from "react-router-dom";
import ValidateField from "../../../../components/form/validateField/ValidateField";
import { deleteProfesor, updateTeacher } from "../../../../api/profesores";
import { getCursos } from "../../../../api/cursos"; // Importar la función para obtener los cursos

const EditProfesor = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    id: "", // Cambiado de user_id a id para coincidir con el backend
    email: "",
    name: "",
    lastname: "",
    course_id: "", // Nuevo campo para el curso asignado
  });

  const [courses, setCourses] = useState([]); // Estado para almacenar los cursos disponibles
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state;

  const goToTeachers = () => {
    navigate(`/admin/profesores`);
  };

  console.log("User:", user);

  // Obtener los cursos disponibles al cargar el componente
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getCursos();
        if (response && response.data) {
          setCourses(response.data); // Guardar los cursos en el estado
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      }
    };

    fetchCursos();
  }, []);

  // Pre-rellenar el formulario con los datos actuales del profesor
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || "", // Cambiado de user_id a id
        email: user.email || "",
        name: user.name || "",
        lastname: user.lastname || "",
        course_id: user.course_id || "", // Pre-rellenar el curso asignado
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
    try {
      console.log("Actualizando profesor con datos:", formData);
      await updateTeacher(formData); // Pasar los datos actualizados del formulario
      setSuccessMessage("Profesor actualizado con éxito");
      setErrors([]);
      if (onUpdate) onUpdate(); // Llama a la función para refrescar la lista de profesores
    } catch (error) {
      console.error("Error al actualizar el profesor:", error);
      setErrors([
        error.response?.data?.message || "Error al actualizar el profesor",
      ]);
      setSuccessMessage("");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas borrar este profesor?"
    );
    if (!confirmed) return;

    try {
      console.log("Borrando profesor con ID:", formData.id);
      await deleteProfesor(formData.id); // Pasar el ID directamente
      setFormData({
        id: "",
        email: "",
        name: "",
        lastname: "",
        course_id: "",
      });
      setSuccessMessage("Profesor eliminado con éxito");
      if (onUpdate) onUpdate();
      goToTeachers();
    } catch (error) {
      console.error("Error al eliminar el profesor:", error);
      setErrors([
        error.response?.data?.message || "Error al eliminar el profesor",
      ]);
      setSuccessMessage("");
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
            />
          </div>
          <div className="edit-user-field">
            <label htmlFor="course_id">Curso Asignado:</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="edit-user-submit">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="edit-user-cancel"
            onClick={handleDelete}
          >
            Borrar Profesor
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
