import React from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png"
const ModuleCard = ({ moduleName,lessons}) => {
  // Función para navegar al módulo específico con datos
  const { alumnoId, cursoId } = useParams(); // Obtener IDs de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  
  
  const goToModule = (classItem) => {
    navigate(
      `/alumnos/${alumnoId}/curso/${cursoId}/clase/${classItem.lessonNumber}`,
      {
        state: { classItem },
      }
    );
  };

  return (
    <div className="module-card">
      <div className="head-container">
        <h2>{moduleName}</h2>
      </div>
      <div className="card-lesson">
        <ul>
          {lessons.map((lesson, index) => (
            <li className="card-text" key={index}>
              <div className="lesson-text">
                <span> {lesson.lessonTitle}:</span> {lesson.lessonDescription}
              </div>
              <div className="img-play">
                <a onClick={() => goToModule(lesson)}>
                  <img src={btnPlay} alt="boton Play" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModuleCard;