import React, { useState } from "react";
import { createAlumno } from "../../../api/alumnos"; 
import "./adminAlumnos.css";
import AlumnosTable from "./tableAlumnos/tableAlumnos"; 

const AdminAlumnos = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: ""
  });

  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createAlumno(formData);
      setSuccessMessage("Alumno creado con éxito");
      setErrors([]);
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        nationality: "",
        email: ""
      });
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al crear el alumno"]);
      setSuccessMessage("");
    }
  };

  return (
    <div>
        <div className="admin-alumnos-container">
        <h1 className="admin-alumnos-title">Crear Alumno</h1>
        <form onSubmit={handleSubmit} className="admin-alumnos-form">
            <div className="admin-alumnos-field">
            <label htmlFor="identification_number">DNI:</label>
            <input
                id="identification_number"
                type="text"
                name="identification_number"
                value={formData.identification_number}
                onChange={handleChange}
                required
            />
            </div>
            <div className="admin-alumnos-field">
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
            <div className="admin-alumnos-field">
            <label htmlFor="lastname">Apellido:</label>
            <input
                id="lastname"
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
            />
            </div>
            <div className="admin-alumnos-field">
            <label htmlFor="nationality">Nacionalidad:</label>
            <input
                id="nationality"
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
            />
            </div>
            <div className="admin-alumnos-field">
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
            <button type="submit" className="admin-alumnos-submit">
            Crear Alumno
            </button>
        </form>
        {successMessage && <p className="admin-alumnos-success">{successMessage}</p>}
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
        <AlumnosTable />
    </div>

  );
};

export default AdminAlumnos;
