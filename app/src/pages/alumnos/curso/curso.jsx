import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./curso.css";
import { getModulesByAlumnoAndCurso, getCoursesByStudentId, getModulesByCourseID, getLessonsByModuleIdAndCourseId } from "../../../api/cursos";
import { useAuth } from "../../../services/authContext";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import BackLink from "../../../components/backLink/BackLink";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams(); // Obtener el ID del curso y del alumno desde la URL
  const [modules, setModules] = useState([]); // Estado inicial para los módulos
  const [loading, setLoading] = useState(true); // Mostrar el mensaje de carga al principio
  const [error, setError] = useState(null);
  const [course, setCourse] = useState()
  const navigate = useNavigate();
  const { userRole, logout } = useAuth(); // Obtener el rol del usuario del contexto

  // Función para obtener los módulos desde la API
  const fetchModules = async () => {
    try {
      console.log('🔍 Obteniendo módulos para alumno:', alumnoId, 'curso:', cursoId);
      console.log('🔑 Rol del usuario:', userRole);
      
      // ✅ CORREGIDO: Usar getCoursesByStudentId en lugar de getCursos
      const courseResponse = await getCoursesByStudentId(alumnoId);
      console.log('📚 Cursos del estudiante COMPLETO:', courseResponse);
      
      // Buscar el curso específico
      console.log('🆔 ID del curso desde URL (cursoId):', cursoId, 'tipo:', typeof cursoId);
      console.log('🆔 ID del curso parseado:', parseInt(cursoId), 'tipo:', typeof parseInt(cursoId));
      console.log('📋 Lista DETALLADA de cursos disponibles:');
      courseResponse.data?.forEach((course, index) => {
        console.log(`   Curso ${index + 1}: ID=${course.course_id || course.id} (tipo: ${typeof (course.course_id || course.id)}), Nombre="${course.course_name || course.name}"`);
      });
      
      const courseInfo = courseResponse.data?.find(course => {
        const courseId = course.course_id || course.id; // ✅ CORREGIDO: Soporte para ambos nombres
        console.log(`🔍 Comparando: curso.id=${courseId} vs cursoId=${parseInt(cursoId)}`);
        return courseId === parseInt(cursoId);
      });
      console.log('🎯 Curso encontrado:', courseInfo);
      console.log('🆔 Buscando curso con ID:', parseInt(cursoId));
      console.log('📋 Lista de cursos disponibles:', courseResponse.data?.map(c => ({id: c.course_id || c.id, name: c.course_name || c.name})));
      
      if (courseInfo) {
        const courseName = courseInfo.course_name || courseInfo.name; // ✅ CORREGIDO: Soporte para ambos nombres
        console.log('✅ Estableciendo nombre del curso:', courseName);
        setCourse({
          courseName: courseName,
          courseDescription: courseInfo.description
        });
      } else {
        console.warn('❌ No se encontró el curso con ID:', cursoId);
        setCourse({
          courseName: 'Curso no encontrado',
          courseDescription: ''
        });
      }
      
      // ✅ NUEVO: Usar la función correcta según el rol del usuario
      let modulesData = [];
      
      if (userRole === 'student') {
        // Para estudiantes: usar la función que filtra por modules_covered
        console.log('👨‍🎓 Usuario es estudiante, obteniendo módulos filtrados...');
        const filteredResponse = await getModulesByAlumnoAndCurso(alumnoId, cursoId);
        console.log('📝 Módulos filtrados para estudiante:', filteredResponse);
        
        if (filteredResponse.success && Array.isArray(filteredResponse.data) && filteredResponse.data.length > 0) {
          // La respuesta ya viene con la estructura completa: curso > módulos > lecciones
          const courseData = filteredResponse.data[0]; // Primer (y único) curso
          if (courseData.courseModules && Array.isArray(courseData.courseModules)) {
            modulesData = courseData.courseModules.map(module => ({
              id: module.moduleId,
              name: module.moduleName,
              description: module.moduleDescription || 'Sin descripción',
              classes: module.moduleLessons?.map(lesson => ({
                lessonNumber: lesson.lessonNumber,
                lessonTitle: lesson.lessonTitle,
                lessonDescription: lesson.lessonDescription,
                url: lesson.lessonUrl,
                id: lesson.lessonId
              })) || []
            }));
          }
        } else {
          console.warn('⚠️ No se encontraron módulos filtrados, usando función estándar...');
          // Fallback a la función estándar
          const modulesResponse = await getModulesByCourseID(cursoId);
          if (modulesResponse.success && Array.isArray(modulesResponse.data)) {
            modulesData = modulesResponse.data;
          }
        }
      } else {
        // Para admin/teacher: usar la función estándar que obtiene todos los módulos
        console.log('👨‍💼 Usuario es admin/teacher, obteniendo todos los módulos...');
        const modulesResponse = await getModulesByCourseID(cursoId);
        console.log('📝 Todos los módulos del curso:', modulesResponse);
        
        if (modulesResponse.success && Array.isArray(modulesResponse.data)) {
          modulesData = modulesResponse.data;
        }
      }
      
      // Si modulesData no tiene lecciones, las obtenemos
      if (modulesData.length > 0 && !modulesData[0].classes) {
        console.log('🔄 Obteniendo lecciones para los módulos...');
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            try {
              // Obtener las lecciones de cada módulo
              const lessonsResponse = await getLessonsByModuleIdAndCourseId(cursoId, module.id);
              console.log(`📚 Lecciones del módulo ${module.name}:`, lessonsResponse);
              
              // Transformar las lecciones al formato esperado por ModuleCard
              const lessons = lessonsResponse.success && Array.isArray(lessonsResponse.data) 
                ? lessonsResponse.data.map(lesson => ({
                    lessonNumber: lesson.lesson_number,
                    lessonTitle: lesson.title,
                    lessonDescription: lesson.description,
                    url: lesson.url,
                    id: lesson.id
                  }))
                : [];

              return {
                id: module.id,
                name: module.name,
                description: module.description,
                classes: lessons // Ahora contiene las lecciones reales
              };
            } catch (lessonError) {
              console.warn(`No se pudieron cargar las lecciones para el módulo ${module.name}:`, lessonError);
              return {
                id: module.id,
                name: module.name,
                description: module.description,
                classes: [] // Array vacío si no hay lecciones o hay error
              };
            }
          })
        );
        setModules(modulesWithLessons);
      } else {
        // Ya tenemos las lecciones
        setModules(modulesData);
      }
      
      // Actualizamos course con los módulos
      setCourse(prev => ({
        ...prev,
        courseModules: modulesData.map(module => ({
          moduleId: module.id,
          moduleName: module.name,
          moduleDescription: module.description,
          moduleLessons: module.classes || []
        }))
      }));
      
    } catch (error) {
      console.error('❌ Error al obtener los módulos:', error);
      // Manejo simple de errores - si es 401/403 hacer logout, sino mostrar error
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError(`Error al obtener los módulos: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Llamamos a la función para obtener los datos cuando se monta el componente
  useEffect(() => {
    fetchModules();
  }, [cursoId]);

  
   const goToFormation = (alumnoId) => {
     navigate(`/alumnos/miscursos/${alumnoId}`);
   };

  if (loading) return <p className="loading-message">Cargando módulos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  console.log('📝 Estado actual del curso antes de renderizar:', course);

  return (
    <>
      <div className="course-details-container">
        <div><BackLink title="Volver a Mis Formaciones" onClick={()=> goToFormation(alumnoId)}/></div>
        <h2 className="course-title">{course?.courseName || 'Cargando curso...'}</h2>
        {modules.length > 0 ? (
          <div className="modules-grid">
            {modules.map((module) => {
              console.log("Módulo con lecciones:", module);
              return (
                <ModuleCard
                  moduleName={module.name}
                  key={module.id}
                  lessons={module.classes} // Ahora contiene las lecciones con la estructura correcta
                />
              );
            })}
          </div>
        ) : (
          <p>No hay módulos disponibles para este curso.</p>
        )}
      </div>
   
    </>
  );
};

export default CourseDetails;