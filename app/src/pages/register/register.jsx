import { useState } from "react";
import { requestRegisterCode } from "../../api/auth";
import "./register.css";

import ValidateField from "../../components/form/validateField/ValidateField";
import BackLink from "../../components/backLink/BackLink";
import CountrySelect from "../../components/countrySelect/CountrySelect";
import { useNavigate } from "react-router-dom";
import {
  MdAssignment,
  MdPerson,
  MdPeople,
  MdPublic,
  MdEmail,
  MdError,
} from "react-icons/md";
import logo from "../../assets/logo2.png";

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

  const errorList = Object.values(error).filter(Boolean);

  return (
    <div className="register-page-container">
      <div className="register-wrapper">
        <div className="form">
          <div className="form-header">
            <img src={logo} alt="Logo" className="login-logo" />
            <h1 id="heading">Crear cuenta</h1>
            <p className="subtitle">Registrate como estudiante</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <MdAssignment className="input-icon" />
              <input
                type="text"
                name="identification_number"
                value={formData.identification_number}
                onChange={handleChange}
                placeholder="Número de Documento"
                className="input-field"
                required
              />
            </div>

            <div className="field">
              <MdPerson className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="input-field"
                required
              />
            </div>

            <div className="field">
              <MdPeople className="input-icon" />
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Apellido"
                className="input-field"
                required
              />
            </div>

            <div className="field">
              <MdPublic className="input-icon" />
              <CountrySelect
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <MdEmail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="input-field"
                required
              />
            </div>
            <div>

            <button type="submit" className="button1" disabled={loading}>
              <span>{loading ? "Enviando código..." : "Registrar Estudiante"}</span>
            </button>
            <BackLink title="Ir pagina de Inicio" onClick={() => goToInicio()} />


  
            </div>


          </form>

          {errorList.length > 0 && (
            <div className="error-messages">
              {errorList.map((errMsg, index) => (
                <div key={index} className="error-item">
                  <MdError className="error-icon" />
                  <p className="error-text">{errMsg}</p>
                </div>
              ))}
            </div>
          )}

          {message && <p className="success-message">{message}</p>}
        </div>

      </div>
    </div>
  );
};

export default Register;
