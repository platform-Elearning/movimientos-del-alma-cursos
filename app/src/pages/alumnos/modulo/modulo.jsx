import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./modulo.css";

const ModuleDetails = () => {
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const location = useLocation();
  const navigate = useNavigate();
  const { module } = location.state || {};

  if (!module) {
    return <p>Módulo no encontrado. Por favor, regresa y selecciona un módulo válido.</p>;
  }

  const goToClass = (classItem) => {
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}/modulo/${module.id}/clase/${classItem.id}`, {
      state: { classItem }, // Pasamos solo la clase seleccionada
    });
  };
  

  return (
    <div className="module-details-container">
      <h2 className="module-title">{module.name}</h2>
      <div className="classes-grid">
        {module.classes.map((cls) => (
          <div
            key={cls.id}
            className="class-card"
            onClick={() => goToClass(cls)}
          >
            <h3 className="class-name">{cls.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleDetails;
