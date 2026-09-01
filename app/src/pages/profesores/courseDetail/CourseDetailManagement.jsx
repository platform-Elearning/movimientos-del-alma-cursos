import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetailManagement.css";
import BackLink from "../../../components/backLink/BackLink";
import TeacherModuleCard from "../../../components/teacherModuleCard/TeacherModuleCard";
import { useAuth } from "../../../services/authContext";
import { getCourseCompleteByTeacherId } from "../../../api/profesores";
import { 
  createCourseModule, 
  deleteCourseModule,
  createLesson,
  deleteLesson
} from "../../../api/cursos";

const CourseDetailManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userRole, logout } = useAuth();
  
  const [courseCompleteData, setCourseCompleteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState('modules');
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

  useEffect(() => {
    if (isAuthenticated !== null && courseId && userId) {
      loadCourseCompleteData();
    }
  }, [courseId, isAuthenticated, userId]);

  const loadCourseCompleteData = async () => {
    try {
      setIsLoading(true);
      
      if (!isAuthenticated || userRole !== 'teacher') {
        navigate('/login');
        return;
      }

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
      // Manejo simple de errores - si es 401/403 hacer logout, sino mostrar error
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError("Error al cargar los datos del curso");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    if (currentView === 'lessons') {
      setCurrentView('modules');
      setSelectedModule(null);
    } else {
      navigate('/profesores/dashboard');
    }
  };

  const handleDeleteModuleWithLessons = async (moduleId, module) => {
    const hasLessons = module.lessons && module.lessons.length > 0;
    
    if (hasLessons) {
      const confirmDeleteLessons = window.confirm(
        `Este módulo tiene ${module.lessons.length} lecciones. ¿Quieres eliminar primero todas las lecciones y luego el módulo?`
      );
      
      if (confirmDeleteLessons) {
        try {
          for (const lesson of module.lessons) {
            await deleteLesson(lesson.id);
          }
          
          await deleteCourseModule(moduleId);
          await loadCourseCompleteData();
          setError('');
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          } else {
            setError('Error al eliminar el módulo y sus lecciones');
          }
        }
      }
    } else {
      handleDeleteModule(moduleId, module);
    }
  };

  const handleStudentsClick = () => {
    navigate(`/profesores/curso/${courseId}/estudiantes`);
  };

  const handleViewLesson = (lesson) => {
    const classItem = {
      id: lesson.id,
      lessonNumber: lesson.lesson_number || lesson.lessonNumber,
      lessonTitle: lesson.title || lesson.lessonTitle,
      lessonDescription: lesson.description || lesson.lessonDescription,
      lessonUrl: lesson.url,
    };

    navigate(
      `/alumnos/${userId}/curso/${courseId}/clase/${classItem.lessonNumber || classItem.id}`,
      { state: { classItem } }
    );
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
      await loadCourseCompleteData();
      
      setModuleFormData({ name: '', description: '', module_number: '' });
      setShowModuleForm(false);
      setError('');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError('Error al crear el módulo');
      }
    }
  };

  const handleDeleteModule = async (moduleId, module) => {
    const hasLessons = module.lessons && module.lessons.length > 0;
    
    let confirmMessage = '¿Estás seguro de que quieres eliminar este módulo?';
    if (hasLessons) {
      confirmMessage = `Este módulo tiene ${module.lessons.length} lecciones. Al eliminarlo, también se eliminarán todas sus lecciones. ¿Continuar?`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteCourseModule(moduleId);
        await loadCourseCompleteData();
        setError('');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        } else {
          setError('Error al eliminar el módulo');
        }
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
      await loadCourseCompleteData();
      
      const updatedModule = courseCompleteData.modules.find(m => m.id === selectedModule.id);
      setSelectedModule(updatedModule);
      
      setLessonFormData({ title: '', description: '', url: '', lesson_number: '' });
      setShowLessonForm(false);
      setError('');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError('Error al crear la lección');
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
      try {
        await deleteLesson(lessonId);
        await loadCourseCompleteData();
        
        const updatedModule = courseCompleteData.modules.find(m => m.id === selectedModule.id);
        setSelectedModule(updatedModule);
        setError('');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        } else {
          setError('Error al eliminar la lección');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner">
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <p>Cargando información del curso...</p>
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
          <p>{error}</p>
          <button 
            className="btn-secondary"
            onClick={() => setError('')}
          >
            ✖ Cerrar
          </button>
        </div>
      )}

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

      <div className="course-actions">
        <button 
          className="btn-primary students-btn"
          onClick={handleStudentsClick}
        >
          👥 Ver Estudiantes del Curso
        </button>
      </div>

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

          {!courseCompleteData.modules || courseCompleteData.modules.length === 0 ? (
            <div className="no-modules">
              <h3>No hay módulos disponibles</h3>
              <p>Crea el primer módulo para este curso</p>
            </div>
          ) : (
            <div className="modules-grid">
            {courseCompleteData.modules.map((module, index) => (
            <TeacherModuleCard
            key={module.id || index}
            module={module}
            index={index}
            onModuleClick={handleModuleClick}
            onDeleteModule={handleDeleteModule}
            onDeleteModuleWithLessons={handleDeleteModuleWithLessons}
            />
            ))}
            </div>
          )}
        </div>
      )}

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
                        <button
                          type="button"
                          className="btn-view"
                          onClick={() => handleViewLesson(lesson)}
                          title="Ver clase"
                        >
                          ▶️
                        </button>
                        <a
                          href={lesson.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view"
                          title="Abrir video en pestaña"
                        >
                          🔗
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