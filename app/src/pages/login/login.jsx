import React, { useState, useEffect } from "react"; // Importación de React y hooks
import { useAuth } from "../../components/context/authContext.jsx"; // Importa el contexto de autenticación personalizado
import "./login.css"; // Estilos para el componente
import { useNavigate } from "react-router-dom"; // Hook para la navegación entre páginas
import { AiFillEyeInvisible } from "react-icons/ai"; // Icono para mostrar/ocultar contraseñas
import Contacto from "../../components/formContacto/formContacto.jsx";

const Login = () => {
  // Extracción de funciones y datos del contexto de autenticación
  const { signin, errors: signinErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Hook para redireccionar a otras rutas

  const navigateToRegister = () => {
    navigate("/register");
  };

  const navigateToPageAuxiliar = () => {
    navigate("/pageAuxiliar");
  };

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({ email: "", password: "" });
  // Estado para alternar entre mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Redirige a la página principal si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) navigate("/alumnos/miscursos/asdsd");
  }, [isAuthenticated, navigate]);

  // Alterna el estado de visibilidad de la contraseña
  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    console.log(formData.email);
    console.log(formData.password);
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    await signin(formData); // Llama a la función de inicio de sesión del contexto
  };

  return (
    <div>
      <div className="form" style={{ color: 'white' }}>
      <h1 id="heading">Login</h1>
      <form onSubmit={handleSubmit}>
        {/* Campo de correo electrónico */}
        <div className="field">
          <svg
            className="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            {/* Icono de correo */}
            <path d="M2.003 5.884l8 4.8a1 1 0 0 0 1.002 0l8-4.8A1 1 0 0 0 18 4H2a1 1 0 0 0-.997 1.884zM2 8.118v6.764A1 1 0 0 0 3.556 15l6.444-3.86 6.444 3.86A1 1 0 0 0 18 14.882V8.118L10 12 2 8.118z" />
          </svg>
          <input
            type="email"
            name="email"
            value={formData.email} // Valor del estado
            onChange={handleChange} // Actualiza el estado al cambiar
            placeholder="Correo electrónico"
            className="input-field"
          />
        </div>

        {/* Campo de contraseña */}
        <div className="field">
          <svg
            className="input-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            {/* Icono de contraseña */}
            <path d="M2 6a6 6 0 1112 0v2H2V6zm10-2v2H8V4h4zM4 8h8v2H4V8zM2 18a2 2 0 002 2h12a2 2 0 002-2V9H2v9zm4-2h4v2H6v-2z" />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'} // Alterna el tipo de input
            name="password"
            value={formData.password} // Valor del estado
            onChange={handleChange} // Actualiza el estado al cambiar
            placeholder="Contraseña"
            className="input-field"
          />
          {/* Icono para alternar visibilidad de la contraseña */}
          <AiFillEyeInvisible className="eye" onClick={handleTogglePassword} />
        </div>

        {/* Botones de acción */}
        <div className="btn">
          <button type="submit" className="button1">Iniciar sesión</button>
          <button type="button" className="button2" onClick={navigateToRegister}>Registrarse</button>
        </div>
        <button type="button" className="button3" onClick={navigateToPageAuxiliar}>¿Olvidaste tu contraseña?</button>
      </form>

      {/* Muestra los errores de inicio de sesión, si los hay */}
      {signinErrors && signinErrors.length > 0 && (
        <div className="error-messages">
          {signinErrors.map((error, index) => (
            <p key={index} className="error-text">{error}</p>
          ))}
        </div>
      )}
    </div>
    </div>
    
  );
};

export default Login;
