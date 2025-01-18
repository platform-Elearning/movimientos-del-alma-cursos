import React, { useState } from "react";
import { createLesson } from "../../../../api/cursos"; // Asegúrate de que esta función esté configurada
import "./createLesson.css";
import { useParams } from "react-router-dom";

const CreateLesson = () => {
  const { cursoId, moduleId } = useParams(); // Obtener IDs desde la URL
  const [formData, setFormData] = useState({
    course_id: cursoId,
    module_id: moduleId,
    lesson_number: "",
    title: "",
    description: "",
    url: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      console.log(formData);
      await createLesson(formData); // Llamar a la función para crear la lección
      setMessage("Lección creada exitosamente");

      // Limpiar el formulario después de una creación exitosa
      setFormData({
        course_id: cursoId,
        module_id: moduleId,
        lesson_number: "",
        title: "",
        description: "",
        url: "",
      });
    } catch (err) {
      console.error("Error al crear la lección:", err);
      setError("Error al crear la lección");
    }
  };

  return (
    <div className="create-lesson-container">
      <h2>Crear Nueva Lección</h2>
      <form onSubmit={handleSubmit} className="create-lesson-form">
        <input
          type="number"
          name="lesson_number"
          placeholder="Número de la Lección"
          value={formData.lesson_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Título de la Lección"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Descripción de la Lección"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="url"
          name="url"
          placeholder="URL del recurso"
          value={formData.url}
          onChange={handleChange}
          required
        />
        <button type="submit">Crear Lección</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CreateLesson;
