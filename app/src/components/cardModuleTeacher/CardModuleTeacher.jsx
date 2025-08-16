import React from 'react';
import './CardModuleTeacher.css';

const CardModuleTeacher = ({ 
  student, 
  onViewProgress, 
  onSendMessage, 
  getProgressColor, 
  getStatusBadge 
}) => {
  return (
    <div className="teacher-student-card">
      <div className="teacher-card-avatar">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4CAF50&color=fff&size=60`}
          alt={student.name}
        />
      </div>
      
      <div className="teacher-card-info">
        <div className="teacher-card-main-info">
          <h3 className="teacher-card-name">{student.name}</h3>
          <p className="teacher-card-email">{student.email}</p>
          <p className="teacher-card-id">ID: {student.identification_number}</p>
        </div>
        
        <div className="teacher-card-course-info">
          <p className="teacher-card-course-name">{student.course_name}</p>
          <p className="teacher-card-enrollment-date">
            Inscrito: {new Date(student.enrollment_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="teacher-card-progress">
        <div className="teacher-progress-info">
          <span className="teacher-progress-text">{student.progress}% completado</span>
          <span className="teacher-lessons-info">
            {student.completed_lessons}/{student.total_lessons} módulos
          </span>
        </div>
        <div className="teacher-progress-bar">
          <div 
            className="teacher-progress-fill"
            style={{
              width: `${student.progress}%`,
              backgroundColor: getProgressColor(student.progress)
            }}
          />
        </div>
        <p className="teacher-last-activity">
          Última actividad: {new Date(student.last_activity).toLocaleDateString()}
        </p>
      </div>
      
      <div className="teacher-card-status">
        {getStatusBadge(student.status)}
      </div>
      
      <div className="teacher-card-actions">
        <button 
          className="teacher-btn-primary"
          onClick={() => onViewProgress(student)}
          title="Ver progreso detallado"
        >
          📊 Progreso
        </button>
       {/*  <button 
          className="teacher-btn-secondary"
          onClick={() => onSendMessage(student)}
          title="Enviar mensaje"
        >
          💬 Mensaje
        </button> */}
      </div>
    </div>
  );
};

export default CardModuleTeacher;