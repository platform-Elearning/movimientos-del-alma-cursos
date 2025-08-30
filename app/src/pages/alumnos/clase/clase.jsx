import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";

const getEmbedUrl = (url) => {
  if (!url) {
    return { type: 'unsupported', url: '' };
  }

  // PDF
  if (url.toLowerCase().endsWith('.pdf')) {
    return { type: 'pdf', url: url };
  }

  // Google Drive
  if (url.includes("drive.google.com")) {
    // Asumimos que es un enlace para visualizar, puede necesitar ajustes para 'preview'
    return { type: 'drive', url: url.replace("/view", "/preview") };
  }
  
  // YouTube
  let videoIdMatch;
  if (url.includes("youtube.com/watch")) {
    videoIdMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  } else if (url.includes("youtu.be")) {
    videoIdMatch = url.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
  }

  if (videoIdMatch && videoIdMatch[1]) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${videoIdMatch[1]}` };
  }

  // Si no es ninguno de los anteriores, es no soportado
  return { type: 'unsupported', url: url };
};

const Clase = () => {
  const { alumnoId, cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  const content = getEmbedUrl(classItem?.lessonUrl || classItem?.url);

  if (!classItem) {
    return (
      <p>
        Clase no encontrada. Por favor, regresa y selecciona una clase válida.
      </p>
    );
  }

  const goToCourse = () => {
    navigate(`/alumnos/${alumnoId}/curso/${cursoId}`);
  };

  const renderContent = () => {
    switch (content.type) {
      case 'youtube':
      case 'pdf':
      case 'drive':
        return (
          <iframe
            width="80%"
            height="480"
            src={content.url}
            title={classItem.lessonTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'unsupported':
      default:
        return <p>El contenido de esta clase no se puede mostrar aquí. <a href={content.url} target="_blank" rel="noopener noreferrer">Ábrelo en una nueva pestaña</a>.</p>;
    }
  };

  return (
    <div className="class-details-container">
      <BackLink
        title="Volver al Material"
        onClick={goToCourse}
      />
      <h2>
        {classItem.lessonTitle}: {classItem.lessonDescription}
      </h2>

      <div className="video-container">
        {content.url ? renderContent() : <p>No hay contenido disponible para esta clase.</p>}
      </div>
    </div>
  );
};

export default Clase;
