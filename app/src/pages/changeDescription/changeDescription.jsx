import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../../utils/authUtils";
import { update_description_for_teacher } from "../../api/profesores";
import "./changeDescription.css";

const ChangeDescription = () => {
  const [formData, setFormData] = useState({
    id: "",
    description_teacher: "",
    url_avatar:""

  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = AuthUtils.getToken();
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate("/login");
      return;
    }
    const decoded = AuthUtils.decodeToken(token);
    if (decoded && decoded.id) {
      setFormData((prev) => ({ ...prev, id: decoded.id }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.description_teacher.trim()) {
      setError("La descripción no puede estar vacía.");
      return;
    }

    try {
      setIsLoading(true);
      console.log(formData)
      const response = await update_description_for_teacher(formData);

      if (response.success) {
        setSuccess(response.message || "Descripción actualizada con éxito.");
      } else {
        setError(response.message || "No se pudo actualizar la descripción.");
      }
    } catch (err) {
      setError(err.message || "Error al actualizar la descripción.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-description-container">
      <h2 className="form-title">Cambiar Descripción</h2>
      <form onSubmit={handleSubmit} className="change-description-form">
        <div className="form-group" >
        <label htmlFor="description_teacher">Nueva Descripción</label>
        <input
          id="description_teacher"
          name="description_teacher"
          placeholder="Escribe la nueva descripción del profesor..."
          value={formData.description_teacher}
          onChange={handleChange}
          rows="6"
          required
        />
        </div>
        <div className="form-group" >
        <label htmlFor="url_avatar">Url de imagen de perfil</label>
        <input
          id="url_avatar"
          name="url_avatar"
          value={formData.url_avatar}
          onChange={handleChange}
          rows="6"
          required
        />
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !formData.id}
        >
          {isLoading ? "Actualizando..." : "Actualizar Descripción"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default ChangeDescription;