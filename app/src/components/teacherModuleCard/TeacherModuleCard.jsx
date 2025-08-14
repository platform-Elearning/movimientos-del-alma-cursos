import React from 'react';
import './TeacherModuleCard.css';

const TeacherModuleCard = ({ 
  module,
  index,
  onModuleClick,
  onDeleteModule,
  onDeleteModuleWithLessons
}) => {
  const hasLessons = module.lessons && module.lessons.length > 0;
  
  const handleDeleteClick = () => {
    if (hasLessons) {
      onDeleteModuleWithLessons(module.id, module);
    } else {
      onDeleteModule(module.id, module);
    }
  };

  return (
    <div className="teacher-module-card">
      {/* Indicador lateral con gradiente */}
      <div className="teacher-module-indicator"></div>
      
      {/* Header del módulo */}
      <div className="teacher-module-header">
        <div className="teacher-module-badge">
          <span className="teacher-module-label">MÓDULO</span>
          <span className="teacher-module-number">{module.module_number || index + 1}</span>
        </div>
      </div>
      
      {/* Información principal */}
      <div className="teacher-module-info">
        <h4 className="teacher-module-name">{module.name}</h4>
        <p className="teacher-module-description">{module.description}</p>
      </div>
      
      {/* Estadísticas del módulo */}
      <div className="teacher-module-stats">
        <div className="teacher-lessons-badge">
          <span className="teacher-lessons-icon">📚</span>
          <span className="teacher-lessons-count">
            {module.lessons ? module.lessons.length : 0}
          </span>
          <span className="teacher-lessons-text">
            {module.lessons && module.lessons.length === 1 ? 'lección' : 'lecciones'}
          </span>
        </div>
        
        {/* Acciones del módulo - Movidas aquí */}
        <div className="teacher-module-actions">
          <button 
            className="teacher-btn-view"
            onClick={() => onModuleClick(module)}
            title="Ver lecciones"
          >
            <span className="teacher-btn-icon">📖</span>
          </button>
          
          <button 
            className={`teacher-btn-delete ${hasLessons ? 'teacher-btn-delete-force' : ''}`}
            onClick={handleDeleteClick}
            title={hasLessons ? "Eliminar módulo y todas sus lecciones" : "Eliminar módulo"}
          >
            <span className="teacher-btn-icon">🗑️</span>
            {hasLessons && <span className="teacher-force-indicator">⚡</span>}
          </button>
        </div>
      </div>
      
      {/* Efecto hover decorativo */}
      <div className="teacher-module-hover-effect"></div>
    </div>
  );
};

export default TeacherModuleCard;