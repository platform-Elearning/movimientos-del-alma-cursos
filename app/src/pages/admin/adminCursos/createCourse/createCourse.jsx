import React, { useState, useRef } from "react";
import "./createCourse.css";
import { createCourse } from "../../../../api/cursos"; // Asegúrate de que esta ruta sea correcta
import BackLink from "../../../../components/backLink/BackLink";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

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
        description: "",
      });
    } catch (err) {
      setError(
        `El curso ${formData.name} ya ha sido creado. Elija otro nombre.`
      );
      nameInputRef.current.focus(); // Enfocar el input name si hay un error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className="container-princ"  >
      <BackLink title="Volver a Inicio" onClick={() => goToInicio()} />
      <div className="form-container">
        <h1 className="form-title">Crear Nuevo Curso</h1>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="admin-cursos-field">

          <label >Nombre del Curso:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            ref={nameInputRef}
            className={error ? "input-error" : ""}
          />
          </div>

        <div className="admin-cursos-field">
          <label >Descripción del Curso:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
          <button type="submit" className="submit-button2" disabled={loading}>
            {loading ? "Creando..." : "Crear Curso"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
