import React from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png"

const ModuleCard = ({ moduleName, lessons }) => {
  const { alumnoId, cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { classItem } = location.state || {};
  
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
                <span className="lesson-title">{lesson.lessonTitle}:</span> 
                <span className="lesson-description">{lesson.lessonDescription}</span>
              </div>
              <div className="img-play">
                <button 
                  onClick={() => goToModule(lesson)}
                  className="play-button"
                >
                  <img src={btnPlay} alt="boton Play" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModuleCard;