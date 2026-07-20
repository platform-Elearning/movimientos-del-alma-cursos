import React, { useState } from "react";
import { requestRegisterCode } from "../../api/auth";
import "./register.css";

import ValidateField from "../../components/form/validateField/ValidateField";
import BackLink from "../../components/backLink/BackLink";
import CountrySelect from "../../components/countrySelect/CountrySelect";
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
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
    const goToInicio = () => {
      navigate(`/login`);
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
      setLoading(true);
      await requestRegisterCode(formData.email);
      setMessage("Código enviado. Revisa tu correo.");
      navigate("/verify-code", { state: formData });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al enviar el código de verificación";
      setError({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackLink title="Ir pagina de Inicio" onClick={() => goToInicio()} />
      <div className="register-container">
        <h2>Registro de Estudiante</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="identification_number">Número de Documento:</label>
          <input
            type="text"
            name="identification_number"
            className="input_camp"
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
          {error.name && <p className="error-message2">{error.name}</p>}
          <label htmlFor="lastname">Apellido:</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          {error.lastname && <p className="error-message2">{error.lastname}</p>}
          <label htmlFor="nationality">País de Origen:</label>
          <CountrySelect
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />
          {error.nationality && <p className="error-message2">{error.nationality}</p>}
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {error.general && (
            <div className="register-error-box">
              <span>&#9888;</span> {error.general}
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Enviando código..." : "Registrar Estudiante"}
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
