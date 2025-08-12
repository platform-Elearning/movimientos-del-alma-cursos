import React from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png"

const ModuleCard = ({ moduleName, lessons }) => {
  const { alumnoId, cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  
  // Debug: log de los datos recibidos
  console.log('🎯 ModuleCard recibió:', { moduleName, lessons });
  
  const goToModule = (lesson) => {
    const classItem = {
      lessonNumber: lesson.lessonNumber,
      lessonTitle: lesson.lessonTitle,
      lessonDescription: lesson.lessonDescription,
      lessonUrl: lesson.url,
      id: lesson.id
    };
    
    console.log('📁 Navegando a clase con datos:', classItem);
    
    navigate(
      `/alumnos/${alumnoId}/curso/${cursoId}/clase/${lesson.lessonNumber}`,
      {
        state: { classItem },
      }
    );
  };

  // Verificar si hay lecciones válidas
  if (!lessons || lessons.length === 0) {
    return (
      <div className="module-card">
        <div className="head-container">
          <h2>{moduleName || 'Módulo sin nombre'}</h2>
        </div>
        <div className="card-lesson">
          <ul>
            <li className="card-text">
              <div className="lesson-text">
                <span className="lesson-title">No hay clases disponibles</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="module-card">
      <div className="head-container">
        <h2>{moduleName || 'Módulo'}</h2>
      </div>
      <div className="card-lesson">
        <ul>
          {lessons.map((lesson, index) => {
            // Debug: log de cada lección
            console.log(`🎓 Lección ${index}:`, lesson);
            
            // Obtener título y descripción con fallbacks
            const lessonTitle = lesson.lessonTitle || lesson.title || `Clase ${index + 1}`;
            const lessonDescription = lesson.lessonDescription || lesson.description || 'Sin descripción';
            
            return (
              <li className="card-text" key={lesson.id || index}>
                <div className="lesson-text">
                  <span >{lessonTitle}:</span> 
                  <span >{lessonDescription}</span>
                </div>
                <div className="img-play">
                  <button 
                    onClick={() => goToModule({
                      ...lesson,
                      lessonTitle,
                      lessonDescription
                    })}
                    className="play-button"
                  >
                    <img src={btnPlay} alt="boton Play" />
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