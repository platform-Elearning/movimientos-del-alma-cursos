import React, { useState } from "react";
import { createAlumno } from "../../api/alumnos";
import "./register.css";
import Form from "../../components/form/Form";

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
      <Form 
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      formData={formData}
      buttonText="Registrar Estudiante"
      />
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Register;
