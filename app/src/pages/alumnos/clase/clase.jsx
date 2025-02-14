import React from "react";
import { useParams, useLocation,useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";

const Clase = () => {
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {}; // Obtener los datos de la clase seleccionada

  const embedUrl = getEmbedUrl(classItem?.lessonUrl);

  if (!classItem || !classItem.id) {
    return <p>Clase no encontrada. Por favor, regresa y selecciona una clase válida.</p>;
  }
  console.log(classItem);

   const goToCourse = (coursoId) => {
     navigate(`/alumnos/${alumnoId}/curso/${coursoId}`);
   };

  return (
    
    <div className="class-details-container">
      <BackLink title="Volver al Material" onClick={()=> goToCourse(cursoId)}/>
      <h2>{classItem.name}: {classItem.description}</h2>

      <div className="video-container">
        {embedUrl ? (
          <iframe
            width="80%"
            height="480"
            src={embedUrl}
            title={classItem.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <p>No hay un video disponible para esta clase.</p>
        )}
      </div>
    </div>
  );
};

const getEmbedUrl = (url) => {
  if (!url) return ""; // Devuelve vacío si no hay URL
  const videoIdMatch = url.match(/v=([^&]+)/); // Extrae el ID del video de la URL
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : "";
};

export default Clase;
