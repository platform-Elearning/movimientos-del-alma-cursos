import React from "react";
import "./AddStudentModal.css";

const AddStudentModal = ({ courseId, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para agregar alumno (por ejemplo, llamada a una API)
    console.log(`Alumno agregado al curso ID: ${courseId}`);
    onClose(); // Cerrar el modal después de agregar
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Alumno al Curso ID: {courseId}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="ID del Alumno" required />
          <input type="number" placeholder="ID del curso" required value={courseId}/>
          <input type="number" placeholder="modulos comprados" required />
          <button type="submit" className="modal-submit-button">Agregar</button>
          <button type="button" className="modal-close-button" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
