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
  });

  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Used to display success messages
  const navigate = useNavigate();

  const goToInicio = () => {
    console.log("Navegando a la página de inicio...");
    navigate(`/admin/`);
  };

 

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
