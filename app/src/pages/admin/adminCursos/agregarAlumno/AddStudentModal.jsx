import React from "react";
import "./AddStudentModal.css";
import { registerStudentToCourse } from "../../../../api/cursos";

const AddStudentModal = ({ courseId, onClose }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentId = e.target[0].value;
      const enrollmentStatus = "active"; // Puedes ajustar esto según sea necesario
      const notes = e.target[2].value;

      const enrollmentData = {
        student_id: studentId,
        course_id: courseId,
        enrollment_status: enrollmentStatus,
        notes: notes,
      };

      const response = await registerStudentToCourse(enrollmentData);
      alert(`${JSON.stringify(response.message)}`); // Muestra la respuesta en una alerta
      onClose(); // Cerrar el modal después de agregar
    } catch (error) {
      console.error("Error al agregar el alumno al curso:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Alumno al Curso ID: {courseId}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="ID del Alumno" required />
          <input type="text" placeholder="Notas" required value={"active"}/>
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