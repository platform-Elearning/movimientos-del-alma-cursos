import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";

const Clase = () => {
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {}; // Obtener los datos de la clase seleccionada

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

  // Determinar el tipo de contenido
  const getContentType = () => {
    const title = classItem.lessonTitle || classItem.name || '';
    const description = classItem.lessonDescription || classItem.lessons || '';
    const content = `${title} ${description}`.toLowerCase();
    
    if (content.includes('drive') || content.includes('pdf')) {
      return 'drive';
    } else if (content.includes('video') || content.includes('youtube')) {
      return 'video';
    }
    return 'video'; // Por defecto
  };

  const contentType = getContentType();
  const embedUrl = contentType === 'video' ? getEmbedUrl(classItem?.lessonUrl || classItem?.url) : null;

  // Si es un drive, redirigir automáticamente
  if (contentType === 'drive' && (classItem?.lessonUrl || classItem?.url)) {
    window.open(classItem?.lessonUrl || classItem?.url, '_blank');
    // Opcional: regresar automáticamente después de abrir el drive
    setTimeout(() => {
      goToCourse(cursoId);
    }, 1000);
  }

  return (
    <div className="class-details-container">
      <BackLink
        title="Volver al Material"
        onClick={() => goToCourse(cursoId)}
      />
      <h2>
        {classItem.lessonTitle || classItem.name}: {classItem.lessonDescription || classItem.lessons}
      </h2>

      <div className="video-container">
        {contentType === 'drive' ? (
          <div className="drive-content">
            <p>Este contenido se ha abierto en una nueva pestaña.</p>
            <p>Si no se abrió automáticamente, <a href={classItem?.lessonUrl || classItem?.url} target="_blank" rel="noopener noreferrer">haz clic aquí</a>.</p>
          </div>
        ) : embedUrl ? (
          <iframe
            width="80%"
            height="480"
            src={embedUrl}
            title={classItem.lessonTitle || classItem.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <p>No hay contenido disponible para esta clase.</p>
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
