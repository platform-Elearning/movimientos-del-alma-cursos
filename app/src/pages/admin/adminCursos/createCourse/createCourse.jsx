import React, { useState } from "react";
import "./createCourse.css";
import { createCourse } from "../../../../api/cursos"; // Asegúrate de que esta ruta sea correcta
import BackLink from "../../../../components/backLink/BackLink"
import { useNavigate } from "react-router-dom";
const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate=useNavigate();
  
  const goToInicio = () => {
     navigate(`/admin/`);
   };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createCourse(formData);
      alert(response.message || "Curso creado exitosamente");
      setFormData({
        name: "",
        description: ""
      });
    } catch (err) {
      console.error("Error al crear el curso:", err);
      setError("Error al crear el curso. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackLink title="Volver a Inicio" onClick={()=>goToInicio()}/>
      <div className="form-container">
        <h2 className="form-title">Crear Nuevo Curso</h2>
        <form onSubmit={handleSubmit} className="course-form">
          <input
            type="text"
            name="name"
            placeholder="Nombre del Curso"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Descripción del Curso"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creando..." : "Crear Curso"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
