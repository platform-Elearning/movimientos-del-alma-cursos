import React, { useState } from "react";
import "./createCourse.css";
import { createCourse } from "../../../../api/cursos"; // Asegúrate de que esta ruta sea correcta

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    name: "",
    duration_months: "",
    quantity_lessons: "",
    quantity_videos: "",
    enrollment_fee: "",
    enrollment_fee_usd: "",
    monthly_fee: "",
    monthly_fee_usd: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        duration_months: "",
        quantity_lessons: "",
        quantity_videos: "",
        enrollment_fee: "",
        enrollment_fee_usd: "",
        monthly_fee: "",
        monthly_fee_usd: "",
      });
    } catch (err) {
      console.error("Error al crear el curso:", err);
      setError("Error al crear el curso. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          type="number"
          name="duration_months"
          placeholder="Duración (meses)"
          value={formData.duration_months}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity_lessons"
          placeholder="Cantidad de Lecciones"
          value={formData.quantity_lessons}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity_videos"
          placeholder="Cantidad de Videos"
          value={formData.quantity_videos}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="enrollment_fee"
          placeholder="Cuota de Inscripción (CLP)"
          value={formData.enrollment_fee}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="enrollment_fee_usd"
          placeholder="Cuota de Inscripción (USD)"
          value={formData.enrollment_fee_usd}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="monthly_fee"
          placeholder="Cuota Mensual (CLP)"
          value={formData.monthly_fee}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="monthly_fee_usd"
          placeholder="Cuota Mensual (USD)"
          value={formData.monthly_fee_usd}
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creando..." : "Crear Curso"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreateCourse;
