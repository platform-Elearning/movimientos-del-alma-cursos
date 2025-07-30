import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./clase.css";
import BackLink from "../../../components/backLink/BackLink";

const Clase = () => {
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {}; // Obtener los datos de la clase seleccionada

  console.log("location.state:", location.state);
  console.log("classItem:", classItem);
  console.log("🎥 URL del video:", classItem?.lessonUrl || classItem?.url); // ✅ AGREGADO: Debug de URL

  const embedUrl = getEmbedUrl(classItem?.lessonUrl || classItem?.url); // ✅ CORREGIDO: Soportar ambos nombres de propiedad

  if (!classItem) {
    return (
      <p>
        Clase no encontrada. Por favor, regresa y selecciona una clase válida.
      </p>
    );
  }
  console.log(classItem);

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
  console.log('🔗 getEmbedUrl recibió URL:', url);
  
  if (!url) {
    console.log('⚠️ No hay URL proporcionada');
    return ""; // Devuelve vacío si no hay URL
  }

  let videoIdMatch;
  if (url.includes("youtube.com")) {
    // ✅ MEJORADO: Regex más robusta que maneja parámetros adicionales
    videoIdMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    console.log('🎥 YouTube URL estándar detectada, ID extraído:', videoIdMatch?.[1]);
  } else if (url.includes("youtu.be")) {
    // ✅ MEJORADO: Regex más robusta para URLs cortas
    videoIdMatch = url.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
    console.log('🎥 YouTube URL corta detectada, ID extraído:', videoIdMatch?.[1]);
  } else {
    console.log('⚠️ URL no es de YouTube:', url);
  }

  // ✅ FALLBACK: Si no se encontró match, intentar extraer cualquier ID de 11 caracteres
  if (!videoIdMatch) {
    console.log('🔄 Intentando extraer ID con método alternativo...');
    videoIdMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    console.log('🔍 ID alternativo encontrado:', videoIdMatch?.[1]);
  }

  const embedUrl = videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : "";
  console.log('🎥 URL de embed generada:', embedUrl);
  
  return embedUrl;
};

export default Clase;
