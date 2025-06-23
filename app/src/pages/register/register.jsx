import React, { useState, useEffect } from "react";
import { createAlumno } from "../../api/alumnos";
import "./register.css";

import ValidateField from "../../components/form/validateField/ValidateField";
import CountryOption from "../../components/form/CountryOption";
import BackLink from "../../components/backLink/BackLink";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState({});
  const navigate=useNavigate();
    const goToInicio = () => {
      navigate(`/admin/`);
    };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, error, setError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError({});

    try {
      await createAlumno(formData);
      setMessage("Estudiante registrado exitosamente");
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        nationality: "",
        email: "",
      });

      // Mostrar alerta con el mensaje de confirmación
      alert("Te llegó un correo con la contraseña. Haz click para confirmar.");
    } catch (err) {
      setError({ general: "Error al registrar el estudiante" });
    } 
  };

  return (
    <div>
      <BackLink title="Ir pagina de Inicio" onClick={() => goToInicio()} />
      <div className="register-container">
        <h2>Registro de Estudiante</h2>
        <form onSubmit={handleSubmit} className="register-form">
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
          {error.name && <p className="error-message">{error.name}</p>}
          <label htmlFor="lastname">Apellido:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          {error.lastname && <p className="error-message">{error.lastname}</p>}
          <label htmlFor="nationality">Pais de Origen:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button type="submit">Registrar Estudiante</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error.general && <p className="error-message">{error.general}</p>}
      </div>
    </div>
  );
};

export default Register;
