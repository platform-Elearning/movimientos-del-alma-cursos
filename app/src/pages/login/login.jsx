import React, { useState, useEffect } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { MdEmail, MdLock, MdError } from "react-icons/md";
import { useAuth } from "../../services/authContext";
import missionVisionImg from "../../assets/missionVisionImg.png";
import logo from "../../assets/logo2.png";

const Login = () => {
  const {
    userRole,
    signin,
    errors: signinErrors,
    isAuthenticated,
    userId,
  } = useAuth();
  const navigate = useNavigate();

  const navigateToRegister = () => {
    navigate("/register");
  };

  const navigateToPageAuxiliar = () => {
    navigate("/pageAuxiliar");
  };

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ CAMBIO PRINCIPAL: useEffect corregido
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "student") {
        navigate(`/alumnos/miscursos/${userId}`);
      } else if (userRole === "teacher") {
        navigate(`/profesores/profesoresMisCursos/${userId}`);
      } else if (userRole === "admin") {
        navigate("/admin");
      }
    }
  }, [isAuthenticated, navigate, userRole, userId]);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signin(formData);
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-wrapper">
        <div className="form">
        <div className="form-header">
          <img src={logo} alt="Logo" className="login-logo" />
          <h1 id="heading">Bienvenido</h1>
          <p className="subtitle">Inicia sesión en tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Campo de correo electrónico */}
          <div className="field">
            <MdEmail className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="input-field"
              autoComplete="username"
              required
            />
          </div>

          {/* Campo de contraseña */}
          <div className="field">
            <MdLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="input-field"
              autoComplete="current-password"
              required
            />
            {/* Icono para alternar visibilidad de la contraseña */}
            {showPassword ? (
              <AiFillEye
                className="eye-icon"
                onClick={handleTogglePassword}
              />
            ) : (
              <AiFillEyeInvisible
                className="eye-icon"
                onClick={handleTogglePassword}
              />
            )}
          </div>

          {/* Botones de acción */}
          <button type="submit" className="button1">
            <span>Iniciar sesión</span>
          </button>
          
          <button
            type="button"
            className="btn3"
            onClick={navigateToPageAuxiliar}
          >
            ¿Olvidaste tu contraseña?
          </button>
          
          <div className="divider">
            <span>o</span>
          </div>
          
          <button
            type="button"
            className="button2"
            onClick={navigateToRegister}
          >
            <span>Crear cuenta nueva</span>
          </button>
        </form>

        {/* Muestra los errores de inicio de sesión, si los hay */}
        {signinErrors && signinErrors.length > 0 && (
          <div className="error-messages">
            {signinErrors.map((error, index) => (
              <div key={index} className="error-item">
                <MdError className="error-icon" />
                <p className="error-text">{error}</p>
              </div>
            ))}
          </div>
        )}
        </div>
        
        {/* Panel lateral sutil con imagen */}
        <div className="side-image-panel">
          <img src={missionVisionImg} alt="Mission Vision" />
        </div>
      </div>
    </div>
  );
};

export default Login;
