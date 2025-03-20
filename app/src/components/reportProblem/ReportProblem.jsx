import { useState } from "react";
import axios from "axios";
import "./ReportForm.css";

const ReportForm = () => {
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !description) {
      setMessage("Por favor, completa todos los campos.");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("/report-problem/create-report", {
        user_id: userId,
        description,
      });

      setMessage("Reporte creado correctamente.");
      setIsError(false);

      setUserId("");
      setDescription("");
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
          "Error al crear el reporte. Inténtalo de nuevo."
      );
      setIsError(true);
    }
  };

  return (
    <div className="report-form-container">
      <h2>Reportar un Problema</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">ID de Usuario:</label>
          <input
            type="number"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Ingresa tu ID de usuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción del Problema:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el problema que encontraste"
          />
        </div>

        <button type="submit">Enviar Reporte</button>
      </form>

      {message && (
        <p className={`message ${isError ? "error" : "success"}`}>{message}</p>
      )}
    </div>
  );
};

export default ReportForm;
