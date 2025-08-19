import React, { useState, useEffect } from "react";
import { createProfesor } from "../../../api/profesores";
import "./adminProfesores.css";
import BackLink from "../../../components/backLink/BackLink";
import ValidateField from "../../../components/form/validateField/ValidateField";
import { useNavigate } from "react-router-dom";
import ProfesoresTable from "./tableProfesor/tableProfesor";
import AuthUtils from "../../../utils/authUtils";

const AdminProfesores = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    email: "",
  });

  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate('/login');
    }
  }, [navigate]);

  const goToInicio = () => {
    navigate('/admin/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, errors, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      setErrors("Sesión expirada. Por favor, inicia sesión nuevamente.");
      return;
    }

    setErrors("");
    setSuccessMessage("");
    setIsLoading(true);
    
    try {
      await createProfesor(formData);
      setSuccessMessage("Profesor creado con éxito");
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        email: "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors("Sesión expirada. Por favor, inicia sesión nuevamente.");
        AuthUtils.removeToken();
      } else if (error.response?.status === 403) {
        setErrors("No tienes permisos para realizar esta acción.");
      } else if (error.response?.status >= 500) {
        setErrors("Error del servidor. Por favor, inténtalo más tarde.");
      } else {
        setErrors(error.response?.data?.message || error.response?.data?.error || "Error al crear Profesor");
      }
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <BackLink title="Ir página de Inicio" onClick={goToInicio} />
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
          {errors.lastname && <p className="error-message">{errors.lastname}</p>}
          
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar Profesor"}
          </button>
        </form>
        
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errors && typeof errors === 'string' && <p className="error-message">{errors}</p>}
        {errors && typeof errors === 'object' && errors.general && <p className="error-message">{errors.general}</p>}
      </div>
      
      <ProfesoresTable />
    </div>
  );
};

export default AdminProfesores;