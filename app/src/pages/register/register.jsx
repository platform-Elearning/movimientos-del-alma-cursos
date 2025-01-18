import React, { useState } from "react";
import { createAlumno } from "../../api/alumnos";
import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

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
      setError("Error al registrar el estudiante");
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Estudiante</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="identification_number"
          placeholder="Número de Identificación"
          value={formData.identification_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Apellido"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nationality"
          placeholder="Nacionalidad"
          value={formData.nationality}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrar Estudiante</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Register;
