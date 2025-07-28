import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetailManagement.css";
import BackLink from "../../../components/backLink/BackLink";
import { useAuth } from "../../../services/authContext";
import { 
  getCourseCompleteByTeacherId, 
  createCourseModule, 
  deleteCourseModule,
  createLesson,
  deleteLesson,
  getLessonsByModule 
} from "../../../api/profesores";

const CourseDetailManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseCompleteData, setCourseCompleteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState('modules'); // 'modules' or 'lessons'
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({
    name: '',
    description: '',
    module_number: ''
  });
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    url: '',
    lesson_number: ''
  });
  const { isAuthenticated, userId, userRole } = useAuth();

  useEffect(() => {
    const loadCourseCompleteData = async () => {
      try {
        setIsLoading(true);
        
        if (!isAuthenticated || userRole !== 'teacher') {
          navigate('/login');
          return;
        }

        console.log("Cargando datos completos del curso para profesor ID:", userId);

        const response = await getCourseCompleteByTeacherId(userId);
        if (response && response.data) {
          const courseData = Array.isArray(response.data) 
            ? response.data.find(course => course.id === parseInt(courseId))
            : response.data;
          
          if (courseData) {
            setCourseCompleteData(courseData);
          } else {
            setError("No se encontró información del curso");
          }
        }

      } catch (error) {
        console.error("Error al cargar datos completos del curso:", error);
        setError("Error al cargar los datos completos del curso");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated !== null && courseId && userId) {
      loadCourseCompleteData();
    }
  }, [courseId, navigate, isAuthenticated, userRole, userId]);

  const handleBackClick = () => {
    if (currentView === 'lessons') {
      setCurrentView('modules');
      setSelectedModule(null);
    } else {
      navigate('/profesores/dashboard');
    }
  };

  const handleStudentsClick = () => {
    navigate(`/profesores/curso/${courseId}/estudiantes`);
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setCurrentView('lessons');
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const moduleData = {
        course_id: parseInt(courseId),
        module_number: parseInt(moduleFormData.module_number),
        name: moduleFormData.name,
        description: moduleFormData.description
      };

      await createCourseModule(moduleData);
      
      // Recargar datos del curso
      const response = await getCourseCompleteByTeacherId(userId);
      if (response && response.data) {
        const courseData = Array.isArray(response.data) 
          ? response.data.find(course => course.id === parseInt(courseId))
          : response.data;
        setCourseCompleteData(courseData);
      }

      // Resetear formulario
      setModuleFormData({ name: '', description: '', module_number: '' });
      setShowModuleForm(false);
    } catch (error) {
      console.error('Error al crear módulo:', error);
      setError('Error al crear el módulo');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este módulo?')) {
      try {
        await deleteCourseModule(moduleId);
        
        // Recargar datos del curso
        const response = await getCourseCompleteByTeacherId(userId);
        if (response && response.data) {
          const courseData = Array.isArray(response.data) 
            ? response.data.find(course => course.id === parseInt(courseId))
            : response.data;
          setCourseCompleteData(courseData);
        }
      } catch (error) {
        console.error('Error al eliminar módulo:', error);
        setError('Error al eliminar el módulo');
      }
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        module_id: selectedModule.id,
        course_id: parseInt(courseId),
        lesson_number: parseInt(lessonFormData.lesson_number),
        title: lessonFormData.title,
        description: lessonFormData.description,
        url: lessonFormData.url
      };

      await createLesson(lessonData);
      
      // Recargar datos del curso
      const response = await getCourseCompleteByTeacherId(userId);
      if (response && response.data) {
        const courseData = Array.isArray(response.data) 
          ? response.data.find(course => course.id === parseInt(courseId))
          : response.data;
        setCourseCompleteData(courseData);
        
        // Actualizar el módulo seleccionado
        const updatedModule = courseData.modules.find(m => m.id === selectedModule.id);
        setSelectedModule(updatedModule);
      }

      // Resetear formulario
      setLessonFormData({ title: '', description: '', url: '', lesson_number: '' });
      setShowLessonForm(false);
    } catch (error) {
      console.error('Error al crear lección:', error);
      setError('Error al crear la lección');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
      try {
        await deleteLesson(lessonId);
        
        // Recargar datos del curso
        const response = await getCourseCompleteByTeacherId(userId);
        if (response && response.data) {
          const courseData = Array.isArray(response.data) 
            ? response.data.find(course => course.id === parseInt(courseId))
            : response.data;
          setCourseCompleteData(courseData);
          
          // Actualizar el módulo seleccionado
          const updatedModule = courseData.modules.find(m => m.id === selectedModule.id);
          setSelectedModule(updatedModule);
        }
      } catch (error) {
        console.error('Error al eliminar lección:', error);
        setError('Error al eliminar la lección');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Cargando detalles del curso...</p>
      </div>
    );
  }

  if (!courseCompleteData) {
    return (
      <div className="course-detail-management">
        <BackLink title="Volver al Dashboard" onClick={handleBackClick} />
        <div className="error-message">
          {error || "No se pudo cargar la información del curso"}
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-management">
      <BackLink 
        title={currentView === 'lessons' ? "Volver a Módulos" : "Volver al Dashboard"} 
        onClick={handleBackClick} 
      />
      
      <div className="course-header">
        <h1 className="course-title">{courseCompleteData.name}</h1>
        <p className="course-description">{courseCompleteData.description}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Estadísticas del curso */}
      <div className="course-stats">
        <div className="stat-item">
          <span className="stat-number">
            {courseCompleteData.modules ? courseCompleteData.modules.length : 0}
          </span>
          <span className="stat-label">Módulos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {courseCompleteData.modules 
              ? courseCompleteData.modules.reduce((total, module) => 
                  total + (module.lessons ? module.lessons.length : 0), 0)
              : 0}
          </span>
          <span className="stat-label">Lecciones</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {courseCompleteData.students ? courseCompleteData.students.length : 0}
          </span>
          <span className="stat-label">Estudiantes</span>
        </div>
      </div>

      {/* Botón para ver estudiantes */}
      <div className="course-actions">
        <button 
          className="btn-primary students-btn"
          onClick={handleStudentsClick}
        >
          👥 Ver Estudiantes del Curso
        </button>
      </div>

      {/* Vista de Módulos */}
      {currentView === 'modules' && (
        <div className="modules-section">
          <div className="section-header">
            <h2>Gestión de Módulos</h2>
            <button 
              className="btn-primary create-btn"
              onClick={() => setShowModuleForm(true)}
            >
              ➕ Crear Nuevo Módulo
            </button>
          </div>

          {/* Formulario para crear módulo */}
          {showModuleForm && (
            <div className="form-overlay">
              <div className="form-container">
                <form onSubmit={handleCreateModule} className="crud-form">
                  <h3>Crear Nuevo Módulo</h3>
                  <div className="form-group">
                    <label>Número de Módulo:</label>
                    <input
                      type="number"
                      value={moduleFormData.module_number}
                      onChange={(e) => setModuleFormData({...moduleFormData, module_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre del Módulo:</label>
                    <input
                      type="text"
                      value={moduleFormData.name}
                      onChange={(e) => setModuleFormData({...moduleFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                      value={moduleFormData.description}
                      onChange={(e) => setModuleFormData({...moduleFormData, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Crear Módulo</button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowModuleForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de módulos */}
          {!courseCompleteData.modules || courseCompleteData.modules.length === 0 ? (
            <div className="no-modules">
              <h3>No hay módulos disponibles</h3>
              <p>Crea el primer módulo para este curso</p>
            </div>
          ) : (
            <div className="modules-grid">
              {courseCompleteData.modules.map((module, index) => (
                <div key={module.id || index} className="module-card">
                  <div className="module-header">
                    <h3>Módulo {module.module_number || index + 1}</h3>
                    <div className="module-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleModuleClick(module)}
                        title="Ver lecciones"
                      >
                        📖
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteModule(module.id)}
                        title="Eliminar módulo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h4 className="module-name">{module.name}</h4>
                  <p className="module-description">{module.description}</p>
                  <div className="module-stats">
                    <span className="lessons-count">
                      📚 {module.lessons ? module.lessons.length : 0} lecciones
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista de Lecciones */}
      {currentView === 'lessons' && selectedModule && (
        <div className="lessons-section">
          <div className="section-header">
            <h2>Lecciones del Módulo: {selectedModule.name}</h2>
            <button 
              className="btn-primary create-btn"
              onClick={() => setShowLessonForm(true)}
            >
              ➕ Crear Nueva Lección
            </button>
          </div>

          {/* Formulario para crear lección */}
          {showLessonForm && (
            <div className="form-overlay">
              <div className="form-container">
                <form onSubmit={handleCreateLesson} className="crud-form">
                  <h3>Crear Nueva Lección</h3>
                  <div className="form-group">
                    <label>Número de Lección:</label>
                    <input
                      type="number"
                      value={lessonFormData.lesson_number}
                      onChange={(e) => setLessonFormData({...lessonFormData, lesson_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Título de la Lección:</label>
                    <input
                      type="text"
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                      value={lessonFormData.description}
                      onChange={(e) => setLessonFormData({...lessonFormData, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>URL del Video:</label>
                    <input
                      type="url"
                      value={lessonFormData.url}
                      onChange={(e) => setLessonFormData({...lessonFormData, url: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Crear Lección</button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowLessonForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de lecciones */}
          {!selectedModule.lessons || selectedModule.lessons.length === 0 ? (
            <div className="no-lessons">
              <h3>No hay lecciones disponibles</h3>
              <p>Crea la primera lección para este módulo</p>
            </div>
          ) : (
            <div className="lessons-list">
              {selectedModule.lessons.map((lesson, index) => (
                <div key={lesson.id || index} className="lesson-card">
                  <div className="lesson-number">
                    {lesson.lesson_number || index + 1}
                  </div>
                  <div className="lesson-info">
                    <div className="lesson-header">
                      <h4 className="lesson-title">{lesson.title}</h4>
                      <div className="lesson-actions">
                        <a 
                          href={lesson.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view"
                          title="Ver video"
                        >
                          ▶️
                        </a>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          title="Eliminar lección"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="lesson-description">{lesson.description}</p>
                    {lesson.url && (
                      <span className="lesson-video">📹 Video disponible</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailManagement;