import React, { useState, useEffect } from "react";
import { createProfesor } from "../../../api/profesores";
import { getCursos } from "../../../api/cursos"; // Importar la función para obtener los cursos
import "./adminProfesores.css";
import BackLink from "../../../components/backLink/BackLink";
import ValidateField from "../../../components/form/validateField/ValidateField";
import { useNavigate } from "react-router-dom";
import ProfesoresTable from "./tableProfesor/tableProfesor";

const AdminProfesores = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    email: "",
    course_id: "", // Nuevo campo para el curso asignado
  });

  const [courses, setCourses] = useState([]); // Estado para almacenar los cursos disponibles
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Used to display success messages
  const navigate = useNavigate();

  const goToInicio = () => {
    console.log("Navegando a la página de inicio...");
    navigate(`/admin/`);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Campo cambiado: ${name}, Valor: ${value}`);
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, errors, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario enviado con los siguientes datos:", formData);
    setErrors("");
    setSuccessMessage("");
    try {
      console.log("Enviando datos al servidor...");
      await createProfesor(formData);
      console.log("Profesor creado con éxito en el servidor.");
      setSuccessMessage("Profesor creado con éxito");
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        email: "",
        course_id: "", // Reiniciar el campo del curso
      });
    } catch (error) {
      console.error("Error al crear el profesor:", error);
      setErrors([error.response?.data?.message || "Error al crear Profesor"]);
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <BackLink title="Ir pagina de Inicio" onClick={() => goToInicio()} />
      <div className="teacher-container">
        <h2>Registro de Profesor</h2>
        <form onSubmit={handleSubmit} className="teacher-form">
          <label htmlFor="identification_number">Número Identificador:</label>
          <input
            type="text"
            name="identification_number"
            value={formData.identification_number}
            onChange={handleChange}
            required
          />
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
          <label htmlFor="lastname">Apellido:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          {errors.lastname && (
            <p className="error-message">{errors.lastname}</p>
          )}
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="course_id">Asignar Curso:</label>
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecciona un curso
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <button type="submit">Registrar Profesor</button>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errors.general && <p className="error-message">{errors.general}</p>}
      </div>
      <ProfesoresTable />
    </div>
  );
};

export default AdminProfesores;
