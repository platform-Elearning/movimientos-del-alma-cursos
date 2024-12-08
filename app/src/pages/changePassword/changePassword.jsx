import React, { useState } from "react";
import "./changePassword.css";
import { changePassword } from "../../api/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importar iconos de visibilidad

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword1: "",
    newPassword2: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword1, setShowNewPassword1] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, newPassword1, newPassword2 } = formData;

    // Validación de campos vacíos
    if (!email || !password || !newPassword1 || !newPassword2) {
      setError("Todos los campos son obligatorios.");
      setSuccess("");
      return;
    }

    // Validación de coincidencia de contraseñas
    if (newPassword1 !== newPassword2) {
      setError("Las nuevas contraseñas no coinciden.");
      setSuccess("");
      return;
    }

    try {
      const response = await changePassword(formData);
      if (response.success) {
        setSuccess(response.message || "Contraseña actualizada con éxito.");
        setError("");
        setFormData({
          email: "",
          password: "",
          newPassword1: "",
          newPassword2: "",
        });
      } else {
        setError("Algo salió mal al actualizar la contraseña.");
        setSuccess("");
      }
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña.");
      setSuccess("");
    }
  };

  return (
    <div className="change-password-container">
      <h2 className="form-title">Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña Actual"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-field">
          <input
            type={showNewPassword1 ? "text" : "password"}
            name="newPassword1"
            placeholder="Nueva Contraseña"
            value={formData.newPassword1}
            onChange={handleChange}
            required
          />
          <span className="toggle-visibility" onClick={() => setShowNewPassword1(!showNewPassword1)}>
            {showNewPassword1 ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-field">
          <input
            type={showNewPassword2 ? "text" : "password"}
            name="newPassword2"
            placeholder="Confirmar Nueva Contraseña"
            value={formData.newPassword2}
            onChange={handleChange}
            required
          />
          <span className="toggle-visibility" onClick={() => setShowNewPassword2(!showNewPassword2)}>
            {showNewPassword2 ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="submit-button">
          Actualizar Contraseña
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
