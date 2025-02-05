import React, { useState, useEffect} from "react";
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

  const [info, setInfo] = useState([]);

  useEffect(() => {
    const data = async () => {

      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
         if (!response.ok) {
           throw new Error("Network response was not ok");
         }
        const data = await response.json();
        setInfo(data);
        
      } catch (error) {
        console.error("Error:", error); 
      }

      
    };
    data();
  }, []);

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
        {/* elegit Nacionalidad */}
        <select
          type="text"
          name="nationality"
          placeholder="Nacionalidad"
          value={formData.nationality}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una Nacionalidad</option>
          {info.map((item, index) => {
            return <option key={index} value={item.name.common}>{item.name.common}</option>;
          })}
        </select>

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
