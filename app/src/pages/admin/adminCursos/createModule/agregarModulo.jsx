import React, { useState } from "react";
import { createModule } from "../../../../api/cursos"; // Importa la función que hará la petición a la API
import "./agregarModulo.css"; // Archivo CSS para los estilos
import { useParams, useNavigate } from "react-router-dom";
import BackLink from "../../../../components/backLink/BackLink";

const CreateModule = () => {
  const { cursoId } = useParams();
  const [formData, setFormData] = useState({
    course_id: cursoId,
    module_number: "",
    name: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate =useNavigate();
  
    const goToCourse = ()=> {
    navigate(`/admin/cursos`);
  }

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");


    try {
      console.log(formData)
      await createModule(formData);
      setMessage("Módulo creado exitosamente");

      // Limpiar el formulario después de una creación exitosa
      setFormData({
        course_id: "",
        module_number: "",
        name: "",
        description: "",
      });
    } catch (err) {
      console.error("Error al crear el módulo:", err);
      setError("Error al crear el módulo");
    }
  };

  return (
    <div>
      <BackLink title="Volver a Cursos"  onClick={()=> goToCourse()}/>
      <div className="create-module-container">
        <h2>Crear Nuevo Módulo</h2>
        <form onSubmit={handleSubmit} className="create-module-form">
          <input
            type="number"
            name="module_number"
            placeholder="Número del Módulo"
            value={formData.module_number}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nombre del Módulo"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción del Módulo"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <button type="submit">Crear Módulo</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default CreateModule;
