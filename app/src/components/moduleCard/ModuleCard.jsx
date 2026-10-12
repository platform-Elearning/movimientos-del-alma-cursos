import React from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png";
import paperClip from "../../assets/paperClip.png";

/**
 * Tarjeta de modulo con sus lecciones.
 *
 * La usan la alumna y el profesor: es la misma informacion y conviene que se
 * vea igual. Los dos props opcionales son lo unico que cambia entre roles.
 *
 * @param acciones       nodo con botones de gestion, para el profesor.
 * @param onAbrirLeccion reemplaza la navegacion por defecto cuando el rol no
 *                       navega por las rutas de alumna.
 * @param completadas    Set con los ids de las clases que la alumna ya hizo.
 *                       Sin el, la tarjeta no muestra progreso (profesor).
 * @param onMarcar       (clase, completada) => void, para marcar desde la lista
 *                       las clases que no tienen video (un PDF, un apunte).
 */
const ModuleCard = ({ moduleName, lessons, acciones, onAbrirLeccion, completadas, onMarcar }) => {
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
    if (onAbrirLeccion) {
      onAbrirLeccion(lesson);
      return;
    }
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
        // Por id y no por numero: el numero se repite entre modulos, y la
        // pagina de la clase busca la clase por este id al recargar.
        `/alumnos/${alumnoId}/curso/${cursoId}/clase/${lesson.id}`,
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
          {acciones && <div className="module-card-acciones">{acciones}</div>}
        </div>
        <div className="module-card-lessons">
          <ul>
            <li className="module-card-lesson-item module-card-lesson-empty">
              <div className="module-card-lesson-content">
                <span className="module-card-lesson-title">No hay clases disponibles</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const conProgreso = completadas instanceof Set;
  const hechas = conProgreso ? lessons.filter((l) => completadas.has(l.id)).length : 0;
  const moduloCompleto = conProgreso && hechas === lessons.length;

  return (
    <div className="module-card-container">
      <div className="module-card-header">
        <h2>{moduleName || 'Módulo'}</h2>
        {conProgreso && (
          <p className="module-card-avance">
            {moduloCompleto ? "¡Módulo completo! 🌸" : `${hechas} de ${lessons.length} clases`}
          </p>
        )}
        {acciones && <div className="module-card-acciones">{acciones}</div>}
      </div>
      <div className="module-card-lessons">
        <ul>
          {lessons.map((lesson, index) => {
            
            // Obtener título y descripción con fallbacks
            const lessonTitle = lesson.lessonTitle || lesson.title || `Clase ${index + 1}`;
            const lessonDescription = lesson.lessonDescription || lesson.description || 'Sin descripción';
            const hecha = conProgreso && completadas.has(lesson.id);

            return (
              <li 
                className={`module-card-lesson-item${hecha ? " module-card-lesson-item--hecha" : ""}`}
                key={lesson.id || index}
                onClick={() => goToModule({
                  ...lesson,
                  lessonTitle,
                  lessonDescription
                })}
              >
                {conProgreso && (
                  <button
                    type="button"
                    className={`module-card-check${hecha ? " module-card-check--hecha" : ""}`}
                    aria-pressed={hecha}
                    aria-label={hecha ? `Desmarcar ${lessonTitle}` : `Marcar ${lessonTitle} como hecha`}
                    title={hecha ? "Ya la bailaste ✓ (tocá para desmarcar)" : "Marcar como hecha"}
                    disabled={!onMarcar}
                    onClick={(e) => {
                      // Marcar no abre la clase.
                      e.stopPropagation();
                      onMarcar?.(lesson, !hecha);
                    }}
                  >
                    {hecha ? "✓" : ""}
                  </button>
                )}
                <div className="module-card-lesson-content">
                  <span className="module-card-lesson-title">{lessonTitle}:</span> 
                  <span className="module-card-lesson-desc">{lessonDescription}</span>
                </div>
                <div className="module-card-play-button">
                  {getIcon(lesson)}
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