import React, { useState, useEffect } from "react";
import "./editAlumno.css"; // Archivo CSS para estilizar el formulario
import CountryOption from "../../../../components/form/CountryOption";
import BackLink from "../../../../components/backLink/BackLink";
import { useNavigate } from "react-router-dom";
//import { updateUser } from "../../../api/users"; // Función para actualizar usuario (asegúrate de implementarla)



const EditAlumno = ({ user, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    email: "",
    name: "",
    last_name: "",
    nationality: "",
    cursos: []
  });

  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate=useNavigate();
  const goToStudent = () => {
     navigate(`/admin/alumnos`);
  };



  // Pre-rellenar el formulario con los datos actuales del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        user_id: user.user_id || "",
        email: user.email || "",
        name: user.name || "",
        last_name: user.last_name || "",
        nationality: user.nationality || "",
        cursos: user.cursos || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, errors, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData); // Llama a la API para actualizar el usuario
      setSuccessMessage("Usuario actualizado con éxito");
      setErrors([]);
      if (onUpdate) onUpdate(); // Llama a la función para refrescar la lista de usuarios
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al actualizar el usuario"]);
      setSuccessMessage("");
    }
  };

return (
  <div>
    <BackLink title="Volver a Estudiantes" onClick={()=> goToStudent()}/>
    <div className="edit-user-container">
      <h2 className="edit-user-title">Editar Usuario</h2>
      <form onSubmit={handleSubmit} className="edit-user-form">
        <div className="edit-user-field">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="edit-user-field">
          <label htmlFor="name">Nombre:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="edit-user-field">
          <label htmlFor="last_name">Apellido:</label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="edit-user-field">
          <label htmlFor="nationality">Nacionalidad:</label>
          <CountryOption
            handleChange={handleChange}
            formData={formData.nationality}
          />
        </div>
        <button type="submit" className="edit-user-submit">
          Guardar Cambios
        </button>
        <button type="button" className="edit-user-cancel" onClick={onClose}>
          Borrar Alumno
        </button>
      </form>

      {successMessage && <p className="edit-user-success">{successMessage}</p>}
      {errors.length > 0 && (
        <div className="edit-user-errors">
          {errors.map((error, index) => (
            <p key={index} className="edit-user-error">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default EditAlumno;
