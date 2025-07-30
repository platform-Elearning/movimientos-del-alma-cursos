import { useState } from "react";
import { createAlumno } from "../../../api/alumnos";
import "./adminAlumnos.css";
import AlumnosTable from "./tableAlumnos/tableAlumnos";
import ValidateField from "../../../components/form/validateField/ValidateField";
import BackLink from "../../../components/backLink/BackLink";
import { useNavigate } from "react-router-dom";

const AdminAlumnos = () => {
  const [formData, setFormData] = useState({
    identification_number: "",
    name: "",
    lastname: "",
    nationality: "",
    email: "",
  });

  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const goToInicio = () => {
    navigate('/admin/');
  };

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
      const response = await createAlumno(formData);
      setSuccessMessage("Alumno creado con éxito");
      setFormData({
        identification_number: "",
        name: "",
        lastname: "",
        nationality: "",
        email: "",
      });
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al crear el alumno"]);
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <BackLink
        title="Volver a Página Principal"
        onClick={goToInicio}
      />
      <div className="admin-alumnos-container">
        <h1 className="admin-alumnos-title">Crear Alumno</h1>
        <form onSubmit={handleSubmit} className="admin-alumnos-form">
          <div className="admin-alumnos-field">
            <label htmlFor="identification_number">Número Identificador:</label>
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
            {errors.name && <p className="error-message">{errors.name}</p>}
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
            {errors.lastname && <p className="error-message">{errors.lastname}</p>}
          </div>
          
          <div className="admin-alumnos-field">
            <label htmlFor="nationality">País de Origen:</label>
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