import React from 'react';
import './ModuleCard.css';
import btnPlay from "../../assets/botonPlay.png"
import btnMeet from "../../assets/botonMeet.png"
const ModuleCard = ({ moduleName, onClick,lessons}) => {



    return (
      <div className="module-card">
        <div className="head-container">
          <h2>{moduleName}</h2>
          <p>clases en vivo:</p>
        </div>
        <div className="card-lesson">
          <ul>
            {lessons.map((lesson, index) => (
              <li className="card-text" key={index}>
                <div className="lesson-text">
                  <span> {lesson.lessonTitle}:</span> {lesson.lessonDescription}
                </div>
                {lesson.lessonNumber <= 3 ? (
                  <div className="img-play">
                   <a onClick={onClick}><img src={btnPlay} alt="" /></a>
                  </div>
                ) : (
                  <div className="img-play">
                    <img src={btnMeet} alt="" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};

export default ModuleCard;