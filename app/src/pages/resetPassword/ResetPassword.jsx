import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPasswordWithCode, requestPasswordReset } from "../../api/auth";
import "./resetPassword.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setResending(true);
    try {
      await requestPasswordReset(email);
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el código");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("No hay email asociado. Volvé a la pantalla anterior.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode({ email, code, newPassword });
      setSuccess("Contraseña actualizada correctamente. Redirigiendo...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al resetear la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Resetear Contraseña</h2>
      <p>
        Ingresá el código que recibiste en <strong>{email}</strong> y tu nueva
        contraseña.
      </p>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <label htmlFor="code">Código (6 dígitos)</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />

        <label htmlFor="newPassword">Nueva contraseña</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="resend-section">
        {countdown > 0 ? (
          <p className="countdown-text">Podés reenviar el código en {countdown}s</p>
        ) : (
          <button className="resend-button" onClick={handleResend} disabled={resending}>
            {resending ? "Reenviando..." : "Reenviar código"}
          </button>
        )}
      </div>
      <button className="back-link" onClick={() => navigate("/OlvideContraseña")}>
        Volver
      </button>
    </div>
  );
};

export default ResetPassword;
