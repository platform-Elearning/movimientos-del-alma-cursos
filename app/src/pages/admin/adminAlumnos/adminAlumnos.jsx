import React, { useState } from "react";
import { createAlumno } from "../../../api/alumnos"; 
import "./adminAlumnos.css";
import AlumnosTable from "./tableAlumnos/tableAlumnos"; 
import Form from "../../../components/form/Form";

const AdminAlumnos = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: ""
  });

  
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccessMessage("");
    try {
      const response = await createAlumno(formData);
      setSuccessMessage("Alumno creado con éxito");
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
        <Form 
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formData={formData}
          buttonText="Crear Alumno"
        />
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
