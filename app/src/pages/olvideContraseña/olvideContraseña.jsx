import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../api/auth";
import "./olvideContraseña.css";

const OlvideContraseña = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al enviar el código"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvide-container">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>Ingresá tu email y te enviamos un código para resetearla.</p>
      <form onSubmit={handleSubmit} className="olvide-form">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <button className="back-link" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </div>
  );
};

export default OlvideContraseña;