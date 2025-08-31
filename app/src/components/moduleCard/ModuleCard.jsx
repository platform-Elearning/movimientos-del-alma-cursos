import React from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png";
import paperClip from "../../assets/paperClip.png";

const ModuleCard = ({ moduleName, lessons }) => {
  const { alumnoId, cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  
  const isYouTubeVideo = (lesson) => {
    const lessonTitle = (lesson.lessonTitle || lesson.title || '').toLowerCase();
    const lessonDescription = (lesson.lessonDescription || lesson.description || '').toLowerCase();
    const url = (lesson.url || '').toLowerCase();
    
    return lessonTitle.includes('video') || lessonDescription.includes('video') || url.includes('youtube') || url.includes('youtu.be');
  };

  const goToModule = (lesson) => {
    if (isYouTubeVideo(lesson)) {
      // Para videos, navegar a la página de la clase para verlos incrustados
      const classItem = {
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle || lesson.title,
        lessonDescription: lesson.lessonDescription || lesson.description,
        lessonUrl: lesson.url,
        id: lesson.id
      };
      
      navigate(
        `/alumnos/${alumnoId}/curso/${cursoId}/clase/${lesson.lessonNumber}`,
        {
          state: { classItem },
        }
      );
    } else {
      // Para cualquier otro contenido (PDF, Drive, etc.), abrir en una nueva pestaña
      if (lesson.url) {
        window.open(lesson.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Función para determinar el icono según el tipo de contenido
  const getIcon = (lesson) => {
    if (isYouTubeVideo(lesson)) {
      return <img src={btnPlay} alt="Ver video" />;
    }
    return <img src={paperClip} alt="Abrir material" />;
  };

  // Verificar si hay lecciones válidas
  if (!lessons || lessons.length === 0) {
    return (
      <div className="module-card-container">
        <div className="module-card-header">
          <h2>{moduleName || 'Módulo sin nombre'}</h2>
        </div>
        <div className="module-card-lessons">
          <ul>
            <li className="module-card-lesson-item">
              <div className="module-card-lesson-content">
                <span className="module-card-lesson-title">No hay clases disponibles</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="module-card-container">
      <div className="module-card-header">
        <h2>{moduleName || 'Módulo'}</h2>
      </div>
      <div className="module-card-lessons">
        <ul>
          {lessons.map((lesson, index) => {
            
            // Obtener título y descripción con fallbacks
            const lessonTitle = lesson.lessonTitle || lesson.title || `Clase ${index + 1}`;
            const lessonDescription = lesson.lessonDescription || lesson.description || 'Sin descripción';
            
            return (
              <li className="module-card-lesson-item" key={lesson.id || index}>
                <div className="module-card-lesson-content">
                  <span className="module-card-lesson-title">{lessonTitle}:</span> 
                  <span className="module-card-lesson-desc">{lessonDescription}</span>
                </div>
                <div className="module-card-play-button">
                  <button 
                    onClick={() => goToModule({
                      ...lesson,
                      lessonTitle,
                      lessonDescription
                    })}
                    className="module-card-btn-play"
                  >
                    {getIcon(lesson)}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ModuleCard;