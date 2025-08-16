import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";

const Clase = () => {
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {}; // Obtener los datos de la clase seleccionada
  const embedUrl = getEmbedUrl(classItem?.lessonUrl || classItem?.url); // ✅ CORREGIDO: Soportar ambos nombres de propiedad

  if (!classItem) {
    return (
      <p>
        Clase no encontrada. Por favor, regresa y selecciona una clase válida.
      </p>
    );
  }

  const goToCourse = (coursoId) => {
    navigate(`/alumnos/${alumnoId}/curso/${coursoId}`);
  };

  return (
    <div className="class-details-container">
      <BackLink
        title="Volver al Material"
        onClick={() => goToCourse(cursoId)}
      />
      <h2>
        {classItem.lessonTitle}: {classItem.lessonDescription}
      </h2>

      <div className="video-container">
        {embedUrl ? (
          <iframe
            width="80%"
            height="480"
            src={embedUrl}
            title={classItem.lessonTitle}
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
  if (!url) {
    return ""; // Devuelve vacío si no hay URL
  }

  let videoIdMatch;
  if (url.includes("youtube.com")) {
    // ✅ MEJORADO: Regex más robusta que maneja parámetros adicionales
    videoIdMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  } else if (url.includes("youtu.be")) {
    // ✅ MEJORADO: Regex más robusta para URLs cortas
    videoIdMatch = url.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
  } else {
    console.log('⚠️ URL no es de YouTube:', url);
  }

  // ✅ FALLBACK: Si no se encontró match, intentar extraer cualquier ID de 11 caracteres
  if (!videoIdMatch) {
    videoIdMatch = url.match(/([a-zA-Z0-9_-]{11})/);
  }

  const embedUrl = videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : "";
  
  return embedUrl;
};

export default Clase;
