import React from "react";
import "./login.css";

const Login = () => {
  return (
    <div className="form">
      <h1 id="heading">Login</h1>
      <div className="field">
        <svg
          className="input-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M2.003 5.884l8 4.8a1 1 0 0 0 1.002 0l8-4.8A1 1 0 0 0 18 4H2a1 1 0 0 0-.997 1.884zM2 8.118v6.764A1 1 0 0 0 3.556 15l6.444-3.86 6.444 3.86A1 1 0 0 0 18 14.882V8.118L10 12 2 8.118z" />
        </svg>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="input-field"
        />
      </div>
      <div className="field">
        <svg
          className="input-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a6 6 0 1112 0v2H2V6zm10-2v2H8V4h4zM4 8h8v2H4V8zM2 18a2 2 0 002 2h12a2 2 0 002-2V9H2v9zm4-2h4v2H6v-2z" />
        </svg>
        <input
          type="password"
          placeholder="Contraseña"
          className="input-field"
        />
      </div>
      <div className="btn">
        <button className="button1">Iniciar sesión</button>
        <button className="button2">Registrarse</button>
      </div>
      <button className="button3">¿Olvidaste tu contraseña?</button>
    </div>
  );
};

export default Login;
