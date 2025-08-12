import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentsByCourse, addModuleToStudent, removeModuleFromStudent } from "../../../../api/profesores";
import getCourses, { getModulesByCourseID } from "../../../../api/cursos";
import BackLink from "../../../../components/backLink/BackLink";
import "./verAlumnos.css";

const VerAlumnosCurso = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [alumnos, setAlumnos] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [maxModules, setMaxModules] = useState(0); // ✅ NUEVO: Máximo de módulos del curso
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(null);

  // ✅ NUEVA FUNCIÓN: Obtener cantidad de módulos del curso
  const fetchCourseModules = async () => {
    try {
      console.log(`Obteniendo módulos del curso ID: ${courseId}`);
      
      const response = await getModulesByCourseID(courseId);
      
      if (response && response.data && Array.isArray(response.data)) {
        const moduleCount = response.data.length;
        setMaxModules(moduleCount);
        console.log(`✅ Curso tiene ${moduleCount} módulos creados`);
      } else {
        console.log("⚠️ No se encontraron módulos para este curso");
        setMaxModules(0);
      }
    } catch (err) {
      console.error("Error al obtener módulos del curso:", err);
      // Si hay error, no bloquear la funcionalidad, solo usar 0 como máximo
      setMaxModules(0);
    }
  };

  // Función para obtener información del curso
  const fetchCourseInfo = async () => {
    try {
      const response = await getCourses();
      if (response && response.data && Array.isArray(response.data)) {
        const course = response.data.find(c => c.id.toString() === courseId);
        setCourseInfo(course);
      }
    } catch (err) {
      console.error("Error al obtener información del curso:", err);
    }
  };

  // Función para obtener alumnos del curso
  const fetchStudentsByCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Obteniendo alumnos para curso ID: ${courseId}`);
      
      const response = await getStudentsByCourse(courseId);
      
      if (response && response.data) {
        setAlumnos(Array.isArray(response.data) ? response.data : []);
      } else {
        setAlumnos([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
      
      if (err.response?.status === 404) {
        setError("No se encontraron alumnos matriculados en este curso");
        setAlumnos([]);
      } else if (err.response?.status === 403) {
        setError("No tienes permisos para ver los alumnos de este curso");
      } else {
        setError(err.message || "Error al cargar los alumnos del curso");
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      // Ejecutar todas las cargas en paralelo
      Promise.all([
        fetchCourseInfo(),
        fetchStudentsByCourse(),
        fetchCourseModules() // ✅ NUEVA: Obtener módulos del curso
      ]);
    }
  }, [courseId]);

  const goBackToCourses = () => {
    navigate('/admin/cursos');
  };

  const handleRefresh = () => {
    fetchStudentsByCourse();
    fetchCourseModules(); // También refrescar módulos
  };

  // ✅ FUNCIÓN MEJORADA: Agregar módulo con validación
  const handleAddModule = async (alumno) => {
    if (updatingStudent === alumno.id) return;

    // ✅ VALIDACIÓN: Verificar si puede agregar más módulos
    const currentModules = alumno.modules_covered || 0;
    
    if (currentModules >= maxModules) {
      alert(`❌ No se puede agregar más módulos a ${alumno.name}.\n\nEl curso solo tiene ${maxModules} módulo${maxModules !== 1 ? 's' : ''} creado${maxModules !== 1 ? 's' : ''}.\n${alumno.name} ya tiene ${currentModules} módulo${currentModules !== 1 ? 's' : ''} asignado${currentModules !== 1 ? 's' : ''}.`);
      return;
    }

    setUpdatingStudent(alumno.id);
    
    try {
      console.log(`Agregando módulo a ${alumno.name} (${currentModules + 1}/${maxModules})`);
      
      const result = await addModuleToStudent(alumno.identification_number, courseId, 1);
      
      if (result.success) {
        // Actualizar el estado local del alumno
        setAlumnos(prev => prev.map(student => 
          student.id === alumno.id 
            ? { ...student, modules_covered: student.modules_covered + 1 }
            : student
        ));
        
        const newTotal = currentModules + 1;
        alert(`✅ Módulo agregado exitosamente a ${alumno.name}\n\nMódulos: ${newTotal}/${maxModules}`);
      } else {
        throw new Error(result.message || 'Error al agregar módulo');
      }
    } catch (error) {
      console.error("Error agregando módulo:", error);
      
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error desconocido';
      alert(`❌ Error al agregar módulo a ${alumno.name}: ${errorMessage}`);
    } finally {
      setUpdatingStudent(null);
    }
  };

  // ✅ FUNCIÓN MEJORADA: Quitar módulo con validación
  const handleRemoveModule = async (alumno) => {
    if (updatingStudent === alumno.id) return;
    
    const currentModules = alumno.modules_covered || 0;
    
    if (currentModules <= 0) {
      alert(`❌ ${alumno.name} no tiene módulos para quitar`);
      return;
    }

    setUpdatingStudent(alumno.id);
    
    try {
      console.log(`Quitando módulo a ${alumno.name} (${currentModules - 1}/${maxModules})`);
      
      const result = await removeModuleFromStudent(alumno.identification_number, courseId, 1);
      
      if (result.success) {
        // Actualizar el estado local del alumno
        setAlumnos(prev => prev.map(student => 
          student.id === alumno.id 
            ? { ...student, modules_covered: Math.max(0, student.modules_covered - 1) }
            : student
        ));
        
        const newTotal = Math.max(0, currentModules - 1);
        alert(`✅ Módulo removido exitosamente de ${alumno.name}\n\nMódulos: ${newTotal}/${maxModules}`);
      } else {
        throw new Error(result.message || 'Error al remover módulo');
      }
    } catch (error) {
      console.error("Error removiendo módulo:", error);
      
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error desconocido';
      alert(`❌ Error al remover módulo de ${alumno.name}: ${errorMessage}`);
    } finally {
      setUpdatingStudent(null);
    }
  };

  if (loading) {
    return (
      <div className="ver-alumnos-container">
        <BackLink title="Volver a Cursos" onClick={goBackToCourses} />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando alumnos del curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ver-alumnos-container">
      <BackLink title="Volver a Cursos" onClick={goBackToCourses} />
      
      {/* ✅ Header mejorado con información de módulos */}
      <div className="course-header">
        <div className="course-info">
          <h1 className="page-title">
            {courseInfo ? `Alumnos de "${courseInfo.name}"` : `Alumnos del Curso #${courseId}`}
          </h1>
          {courseInfo && (
            <p className="course-description">{courseInfo.description}</p>
          )}
        </div>
        <div className="header-actions">
          <div className="course-modules-info">
            <span className="modules-badge">
              {maxModules} módulo{maxModules !== 1 ? 's' : ''} disponible{maxModules !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="students-count">
            <span className="count-badge">
              {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="alumnos-content">
        {error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar alumnos</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              Intentar nuevamente
            </button>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay alumnos matriculados</h3>
            <p>Este curso aún no tiene alumnos inscritos.</p>
          </div>
        ) : (
          <div className="alumnos-table-container">
            <table className="alumnos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número de Identificación</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Nacionalidad</th>
                  <th>Módulos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno, index) => {
                  const currentModules = alumno.modules_covered || 0;
                  const canAddModule = currentModules < maxModules;
                  const canRemoveModule = currentModules > 0;
                  
                  return (
                    <tr key={alumno.id || index}>
                      <td data-label="ID">{alumno.id}</td>
                      <td data-label="Número de Identificación">
                        {alumno.identification_number}
                      </td>
                      <td data-label="Nombre">
                        <span className="student-name">{alumno.name}</span>
                      </td>
                      <td data-label="Apellido">
                        <span className="student-lastname">{alumno.lastname}</span>
                      </td>
                      <td data-label="Email">
                        <a href={`mailto:${alumno.email}`} className="student-email">
                          {alumno.email}
                        </a>
                      </td>
                      <td data-label="Nacionalidad">
                        <span className="student-nationality">{alumno.nationality}</span>
                      </td>
                      <td data-label="Módulos" className="modules-cell">
                        <span className="modules-count">
                          {currentModules}/{maxModules}
                        </span>
                      </td>
                      <td data-label="Acciones" className="actions-cell">
                        <div className="module-actions">
                          <button
                            className="module-btn add-btn"
                            onClick={() => handleAddModule(alumno)}
                            disabled={updatingStudent === alumno.id || !canAddModule}
                            title={
                              !canAddModule 
                                ? `Máximo ${maxModules} módulos alcanzado` 
                                : "Agregar un módulo"
                            }
                          >
                            {updatingStudent === alumno.id ? '⏳' : '+'}
                          </button>
                          <button
                            className="module-btn remove-btn"
                            onClick={() => handleRemoveModule(alumno)}
                            disabled={updatingStudent === alumno.id || !canRemoveModule}
                            title={
                              !canRemoveModule 
                                ? "No tiene módulos para quitar" 
                                : "Quitar un módulo"
                            }
                          >
                            {updatingStudent === alumno.id ? '⏳' : '−'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerAlumnosCurso;