import React, { useState, useEffect } from "react";
import "./editAlumno.css"; // Archivo CSS para estilizar el formulario
//import { updateUser } from "../../../api/users"; // Función para actualizar usuario (asegúrate de implementarla)
import Form from '../../../../components/form/Form';
import Button from "../../../../components/button/Button";


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
    <div className="edit-user-container">
      <h2 className="edit-user-title">Editar Usuario</h2>
      <Form 
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      formData={formData}
      buttonText="Guardar Cambios"
      error={error}
      />
       <Button text="Borrar Alumno" onClick={onClose} />
      
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
  );
};

export default EditAlumno;
