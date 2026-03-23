import React, { useState } from "react";
import { unenrollStudent } from "../../../../api/cursos";
import { getStudentWithDni } from "../../../../api/alumnos";
import "./UnenrollStudentModal.css";

const UnenrollStudentModal = ({ courseId, onClose, onSuccess }) => {
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identificationNumber.trim()) {
      setError("Por favor ingrese el número de identificación del alumno");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Primero obtener el student_id usando el DNI
      const response = await getStudentWithDni(identificationNumber);
      
      // Handle both response formats: direct or wrapped in data
      const studentData = response?.data || response;
      const studentId = studentData?.id;
      
      if (!studentId) {
        setError("No se encontró un alumno con ese número de identificación");
        setLoading(false);
        return;
      }

      // Desinscribir al alumno del curso
      await unenrollStudent(studentId, courseId);
      
      alert("Alumno desinscrito exitosamente del curso");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al desinscribir alumno:", err);
      
      if (err.response?.data?.errorMessage) {
        setError(err.response.data.errorMessage);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Error al desinscribir al alumno. Por favor, intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Eliminar Alumno del Curso</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="unenroll-form">
          <div className="form-group">
            <label htmlFor="identificationNumber">
              Número de Identificación del Alumno:
            </label>
            <input
              type="text"
              id="identificationNumber"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              placeholder="Ingrese el DNI o número de identificación"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar Alumno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnenrollStudentModal;
