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

  const [info, setInfo] = useState([]);
  
    useEffect(() => {
      const data = async () => {
  
        try {
          const response = await fetch("https://restcountries.com/v3.1/all");
           if (!response.ok) {
             throw new Error("Network response was not ok", response.statusText);
           }
          const data = await response.json();
          setInfo(data);
          
        } catch (error) {
          console.error("Error:", error); 
        }
  
        
      };
      data();
    }, []);


  const [errors, setErrors] = useState([]);
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
            <select
              type="text"
              name="nationality"
              placeholder="Nacionalidad"
              value={formData.nationality}
              onChange={handleChange}
              required
            >
              <option value="nacionality">Pais de Origen</option>
              {info.map((country, index) => {
                return (
                  <option key={index} value={country.name.common}>
                    {country.name.common}
                  </option>
                );
              })}
            </select>
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
      <AlumnosTable />
    </div>
  );
};

export default AdminAlumnos;
