import React, { useState } from "react";
import { createProfesor } from "../../../api/profesores";
import "./adminProfesores.css";
/* import AlumnosTable from "./tableAlumnos/tableAlumnos"; */

import ValidateField from "../../../components/form/validateField/ValidateField";

const AdminProfesores = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: "",
  });

  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    ValidateField(name, value, errors, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccessMessage("");
    try {
      const response = await createProfesor(formData);
      setSuccessMessage("Profesor creado con éxito");
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        nationality: "",
        email: "",
      });
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al crear Profesor"]);
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <div className="admin-alumnos-container">
        <h1 className="admin-alumnos-title">Crear Profesor</h1>
    
        {successMessage && (
          <p className="admin-alumnos-success">{successMessage}</p>
        )}
        {errors.length > 0 && (
          <div className="admin-alumnos-errors">
            {errors.map((error, index) => (
              <p key={index} className="admin-alumnos-error">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default AdminProfesores;
