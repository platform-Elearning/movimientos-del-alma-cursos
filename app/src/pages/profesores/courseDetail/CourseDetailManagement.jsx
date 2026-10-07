import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetailManagement.css";
import BackLink from "../../../components/backLink/BackLink";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import { useAuth } from "../../../services/authContext";
import { getCourseCompleteByTeacherId } from "../../../api/profesores";
import {
  createCourseModule,
  deleteCourseModule,
  createLesson,
  deleteLesson,
  updateCourseDescription,
  updateModule,
  updateLesson,
  getImpactoModulo,
  getImpactoClase,
} from "../../../api/cursos";
import ConfirmarBorrado from "../../../components/confirmarBorrado/ConfirmarBorrado";
import BotonBorrar from "../../../components/confirmarBorrado/BotonBorrar";
import { lineasDeImpactoModulo, lineasDeImpactoClase } from "../../../utils/cursos";
import { mensajeDeError, esSesionVencida } from "../../../utils/errores";

const CourseDetailManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userRole, logout } = useAuth();
  
  const [courseCompleteData, setCourseCompleteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState('modules');
  const [selectedModule, setSelectedModule] = useState(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
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

  // Edición de un módulo o una lección en un formulario emergente, y borrado con
  // confirmación. Un solo estado de cada uno: nunca hay dos abiertos a la vez.
  const [edicion, setEdicion] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState('');
  const [borrado, setBorrado] = useState(null);

  // Solo una sesión vencida saca a la persona de la pantalla. Cualquier otra
  // falla -- un permiso, un número repetido -- se muestra con su motivo: con
  // "cualquier 403 cierra la sesión", a un profesor al que el backend le dice
  // "este curso no es tuyo" lo deslogueaba sin explicarle nada.
  const manejarError = (err, accion) => {
    if (esSesionVencida(err)) logout();
    else setError(mensajeDeError(err, accion));
  };

  useEffect(() => {
    if (isAuthenticated !== null && courseId && userId) {
      loadCourseCompleteData();
    }
  }, [courseId, isAuthenticated, userId]);

  const loadCourseCompleteData = async (silenciosa = false) => {
    try {
      // Tras crear, editar o borrar no se tapa toda la pantalla con el spinner:
      // se perdería lo que se está mirando.
      if (!silenciosa) setIsLoading(true);
      
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
          setDescriptionText(courseData.description || '');
          // Si hay un módulo abierto, se actualiza con los datos nuevos.
          setSelectedModule((previo) =>
            previo ? (courseData.modules || []).find((m) => m.id === previo.id) || null : previo
          );
        } else {
          setError("No se encontró información del curso");
        }
      }
    } catch (error) {
      manejarError(error, 'cargar los datos del curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDescription = async (e) => {
    e.preventDefault();
    try {
      await updateCourseDescription(parseInt(courseId), descriptionText);
      setCourseCompleteData(prev => ({
        ...prev,
        description: descriptionText
      }));
      setIsEditingDescription(false);
      setError('');
    } catch (error) {
      manejarError(error, 'actualizar la descripción del curso');
    }
  };

  const handleCancelDescription = () => {
    setDescriptionText(courseCompleteData?.description || '');
    setIsEditingDescription(false);
    setError('');
  };

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
      await loadCourseCompleteData(true);
      
      setModuleFormData({ name: '', description: '', module_number: '' });
      setShowModuleForm(false);
      setError('');
    } catch (error) {
      manejarError(error, 'crear el módulo');
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
      await loadCourseCompleteData(true);

      setLessonFormData({ title: '', description: '', url: '', lesson_number: '' });
      setShowLessonForm(false);
      setError('');
    } catch (error) {
      manejarError(error, 'crear la lección');
    }
  };

  const abrirEdicionModulo = (m) => {
    setErrorEdicion('');
    setEdicion({
      tipo: 'modulo',
      id: m.id,
      datos: {
        module_number: String(m.module_number ?? ''),
        name: m.name || '',
        description: m.description || '',
      },
    });
  };

  const abrirEdicionLeccion = (l) => {
    setErrorEdicion('');
    setEdicion({
      tipo: 'leccion',
      id: l.id,
      datos: {
        lesson_number: String(l.lesson_number ?? ''),
        title: l.title || '',
        description: l.description || '',
        url: l.url || '',
      },
    });
  };

  const cambiarEdicion = (campo, valor) =>
    setEdicion((previa) => ({ ...previa, datos: { ...previa.datos, [campo]: valor } }));

  const guardarEdicion = async (e) => {
    e.preventDefault();
    setGuardandoEdicion(true);
    setErrorEdicion('');
    try {
      if (edicion.tipo === 'modulo') await updateModule(edicion.id, edicion.datos);
      else await updateLesson(edicion.id, edicion.datos);
      setEdicion(null);
      await loadCourseCompleteData(true);
      setError('');
    } catch (err) {
      if (esSesionVencida(err)) {
        logout();
        return;
      }
      setErrorEdicion(
        mensajeDeError(err, edicion.tipo === 'modulo' ? 'guardar el módulo' : 'guardar la lección')
      );
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Borrar pide confirmar y dice qué se pierde: antes eran un confirm() del
  // navegador y, para un módulo con lecciones, un borrado lección por lección.
  const pedirBorrado = async (tipo, item) => {
    setBorrado({ tipo, item, impacto: null, cargando: true, enProceso: false, error: '' });
    try {
      const impacto = tipo === 'modulo' ? await getImpactoModulo(item.id) : await getImpactoClase(item.id);
      setBorrado((previo) => previo && { ...previo, impacto, cargando: false });
    } catch (err) {
      if (esSesionVencida(err)) {
        logout();
        return;
      }
      setBorrado(
        (previo) =>
          previo && { ...previo, cargando: false, error: mensajeDeError(err, 'calcular qué se pierde') }
      );
    }
  };

  const confirmarBorrado = async () => {
    const { tipo, item } = borrado;
    setBorrado((previo) => ({ ...previo, enProceso: true, error: '' }));
    try {
      if (tipo === 'modulo') await deleteCourseModule(item.id);
      else await deleteLesson(item.id);
      setBorrado(null);
      await loadCourseCompleteData(true);
      setError('');
    } catch (err) {
      if (esSesionVencida(err)) {
        logout();
        return;
      }
      setBorrado(
        (previo) =>
          previo && {
            ...previo,
            enProceso: false,
            error: mensajeDeError(err, tipo === 'modulo' ? 'borrar el módulo' : 'borrar la lección'),
          }
      );
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
        {isEditingDescription ? (
          <form onSubmit={handleUpdateDescription} className="course-description-form">
            <textarea
              className="course-description-input"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Descripción del curso"
              rows={3}
            />
            <div className="course-description-actions">
              <button type="submit" className="btn-primary btn-save">
                Guardar
              </button>
              <button
                type="button"
                className="btn-secondary btn-cancel"
                onClick={handleCancelDescription}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="course-description-wrapper">
            <p className="course-description">
              {courseCompleteData.description || "Sin descripción"}
            </p>
            <button
              type="button"
              className="btn-edit-description"
              onClick={() => setIsEditingDescription(true)}
            >
              Editar descripción del curso
            </button>
          </div>
        )}
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

          <div className="ver-como-alumna">
            <button
              type="button"
              onClick={() => navigate(`/profesores/curso/${courseId}/vista-alumna`)}
            >
              Ver el curso como lo ve una alumna
            </button>
          </div>

          {!courseCompleteData.modules || courseCompleteData.modules.length === 0 ? (
            <div className="no-modules">
              <h3>No hay módulos disponibles</h3>
              <p>Crea el primer módulo para este curso</p>
            </div>
          ) : (
            <div className="modules-grid">
            {courseCompleteData.modules.map((module, index) => (
              <ModuleCard
                key={module.id || index}
                moduleName={module.name}
                lessons={module.lessons}
                onAbrirLeccion={() => handleModuleClick(module)}
                acciones={
                  <>
                    <button type="button" onClick={() => handleModuleClick(module)}>
                      Gestionar lecciones
                    </button>
                    <button type="button" onClick={() => abrirEdicionModulo(module)}>
                      Editar módulo
                    </button>
                    <BotonBorrar
                      etiqueta={`Eliminar el módulo ${module.name}`}
                      onClick={() => pedirBorrado('modulo', module)}
                    />
                  </>
                }
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
                          type="button"
                          className="btn-view"
                          onClick={() => abrirEdicionLeccion(lesson)}
                          title="Editar lección"
                          aria-label={`Editar la lección ${lesson.title}`}
                        >
                          ✏️
                        </button>
                        <BotonBorrar
                          etiqueta={`Eliminar la lección ${lesson.title}`}
                          onClick={() => pedirBorrado('leccion', lesson)}
                        />
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

      {edicion && (
        <div className="form-overlay">
          <div className="form-container">
            <form onSubmit={guardarEdicion} className="crud-form">
              <h3>{edicion.tipo === 'modulo' ? 'Editar módulo' : 'Editar lección'}</h3>
              {edicion.tipo === 'modulo' ? (
                <>
                  <div className="form-group">
                    <label>Número de Módulo:</label>
                    <input
                      type="number"
                      min="1"
                      value={edicion.datos.module_number}
                      onChange={(e) => cambiarEdicion('module_number', e.target.value)}
                      required
                    />
                    <small>Cambiar el número cambia el orden de los módulos, y el orden decide qué ve cada alumna.</small>
                  </div>
                  <div className="form-group">
                    <label>Nombre del Módulo:</label>
                    <input
                      type="text"
                      value={edicion.datos.name}
                      onChange={(e) => cambiarEdicion('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                      value={edicion.datos.description}
                      onChange={(e) => cambiarEdicion('description', e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Número de Lección:</label>
                    <input
                      type="number"
                      min="1"
                      value={edicion.datos.lesson_number}
                      onChange={(e) => cambiarEdicion('lesson_number', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Título de la Lección:</label>
                    <input
                      type="text"
                      value={edicion.datos.title}
                      onChange={(e) => cambiarEdicion('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                      value={edicion.datos.description}
                      onChange={(e) => cambiarEdicion('description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>URL del Video:</label>
                    <input
                      type="url"
                      value={edicion.datos.url}
                      onChange={(e) => cambiarEdicion('url', e.target.value)}
                      required
                    />
                    <small>Tiene que empezar con http:// o https://</small>
                  </div>
                </>
              )}
              {errorEdicion && (
                <p className="edicion-error" role="alert">
                  {errorEdicion}
                </p>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={guardandoEdicion}>
                  {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEdicion(null)}
                  disabled={guardandoEdicion}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {borrado && (
        <ConfirmarBorrado
          titulo={
            borrado.tipo === 'modulo'
              ? `Eliminar el módulo "${borrado.item.name}"`
              : `Eliminar la lección "${borrado.item.title}"`
          }
          cargando={borrado.cargando}
          enProceso={borrado.enProceso}
          error={borrado.error}
          // Si no se pudo calcular qué se pierde, no se deja borrar a ciegas.
          bloqueado={!borrado.cargando && !borrado.impacto}
          textoConfirmar={borrado.tipo === 'modulo' ? 'Sí, eliminar módulo' : 'Sí, eliminar lección'}
          onConfirmar={confirmarBorrado}
          onCancelar={() => !borrado.enProceso && setBorrado(null)}
        >
          {(() => {
            const lineas = !borrado.impacto
              ? []
              : borrado.tipo === 'modulo'
                ? lineasDeImpactoModulo(borrado.impacto)
                : lineasDeImpactoClase(borrado.impacto);
            return lineas.length ? (
              <ul>
                {lineas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <p>
                {borrado.tipo === 'modulo'
                  ? 'Este módulo no tiene clases ni alumnas que se vean afectadas.'
                  : 'Esta lección no tiene comentarios.'}
              </p>
            );
          })()}
          <p>
            Si solo hay que corregir algo, usá <strong>Editar</strong>: no pierde nada.
          </p>
        </ConfirmarBorrado>
      )}
    </div>
  );
};

export default CourseDetailManagement;