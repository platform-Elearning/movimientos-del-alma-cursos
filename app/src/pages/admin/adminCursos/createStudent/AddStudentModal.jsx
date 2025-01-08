import React from "react";
import "./AddStudentModal.css";
import { registerStudentToCourse } from "../../../../api/cursos";

const AddStudentModal = ({ courseId, onClose }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const student_dni = e.target[0].value;
      const notes = e.target[1].value;
      const modulos_Comprados = e.target[2].value; 

      const enrollmentData = {
        dni: Number(student_dni),
        course_id: courseId,
        modules_covered: Number(modulos_Comprados),
        notes: notes,
      };
      console.log("enrollmentData", enrollmentData);
      const response = await registerStudentToCourse(enrollmentData);
      alert(`${JSON.stringify(response.message)}`); // Muestra la respuesta en una alerta
      onClose(); // Cerrar el modal después de agregar
    } catch (error) {
      console.error("Error al agregar el alumno al curso:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
      alert(`Error al agregar el alumno al curso: ${errorMessage}`); // Muestra el error en una alerta
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Alumno al Curso ID: {courseId}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="DNI del Alumno" required />
          <input type="text" placeholder="Notas" required />
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