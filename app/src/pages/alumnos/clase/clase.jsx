import React from "react";
import { useParams, useLocation } from "react-router-dom";
import "./clase.css";

const Clase = () => {

  const location = useLocation();
  const { classItem } = location.state || {}; // Obtener los datos de la clase seleccionada

  const embedUrl = getEmbedUrl(classItem?.lessonUrl);

  if (!classItem || !classItem.id) {
    return <p>Clase no encontrada. Por favor, regresa y selecciona una clase válida.</p>;
  }

  return (
    <div className="class-details-container">
      <h2>Título de la clase: {classItem.name}</h2>

      <div className="video-container">
        {embedUrl ? (
          <iframe
            width="100%"
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
