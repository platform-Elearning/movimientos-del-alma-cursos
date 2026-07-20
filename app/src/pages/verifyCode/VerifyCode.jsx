import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerWithCode, requestRegisterCode } from "../../api/auth";
import { useAuth } from "../../services/authContext";
import "./verifyCode.css";

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signin } = useAuth();
  const registrationData = location.state;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
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
    if (!registrationData?.email) return;
    setError("");
    setResending(true);
    try {
      await requestRegisterCode(registrationData.email);
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

    if (!registrationData) {
      setError("No hay datos de registro. Vuelve a registrarte.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await registerWithCode({
        email: registrationData.email,
        code,
        password,
        identification_number: registrationData.identification_number,
        name: registrationData.name,
        lastname: registrationData.lastname,
        nationality: registrationData.nationality,
      });
      setSuccess("Registro exitoso. Iniciando sesión...");
      const res = await signin({ email: registrationData.email, password });
      if (res?.token) {
        const { jwtDecode } = await import("jwt-decode");
        const decoded = jwtDecode(res.token);
        if (decoded.role === "student") {
          navigate(`/alumnos/miscursos/${decoded.id}`);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Error al completar el registro.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-code-container">
      <h2>Verificar Código</h2>
      <p>Introduce el código de 6 dígitos que recibiste por correo.</p>
      <form onSubmit={handleSubmit} className="verify-code-form">
        <label htmlFor="code">Código</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Completar Registro"}
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
    </div>
  );
};

export default VerifyCode;
