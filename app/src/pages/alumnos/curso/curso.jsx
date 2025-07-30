import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./curso.css";
import { getModulesByAlumnoAndCurso, getCoursesByStudentId, getModulesByCourseID, getLessonsByModuleIdAndCourseId } from "../../../api/cursos";
import { getTokenInfo } from "../../../api/axiosInstances";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import BackLink from "../../../components/backLink/BackLink";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams(); // Obtener el ID del curso y del alumno desde la URL
  const [modules, setModules] = useState([]); // Estado inicial para los módulos
  const [loading, setLoading] = useState(true); // Mostrar el mensaje de carga al principio
  const [error, setError] = useState(null);
  const [course, setCourse] = useState()
  const navigate = useNavigate();

  // Función para obtener los módulos desde la API
  const fetchModules = async () => {
    try {
      console.log('🔍 Obteniendo módulos para alumno:', alumnoId, 'curso:', cursoId);
      
      // Obtener información del token para verificar el rol del usuario
      const tokenInfo = getTokenInfo();
      console.log('🔑 Token info:', tokenInfo);
      
      // ✅ CORREGIDO: Usar getCoursesByStudentId en lugar de getCursos
      const courseResponse = await getCoursesByStudentId(alumnoId);
      console.log('📚 Cursos del estudiante:', courseResponse);
      
      // Buscar el curso específico
      const courseInfo = courseResponse.data?.find(course => course.id === parseInt(cursoId));
      if (courseInfo) {
        setCourse({
          courseName: courseInfo.name,
          courseDescription: courseInfo.description
        });
      }
      
      // ✅ NUEVO: Usar la función correcta según el rol del usuario
      let modulesData = [];
      
      if (tokenInfo?.userRole === 'student') {
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
      setError(`Error al obtener los módulos: ${error.message}`);
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

  return (
    <>
      <div className="course-details-container">
        <div><BackLink title="Volver a Mis Formaciones" onClick={()=> goToFormation(alumnoId)}/></div>
        <h2 className="course-title">Material:<span>{course?.courseName}</span> </h2>
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