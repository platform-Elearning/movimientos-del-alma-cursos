import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./curso.css";
import {
  getModulesByAlumnoAndCurso,
  getCoursesByStudentId,
  getModulesByCourseID,
  getLessonsByModuleIdAndCourseId,
} from "../../../api/cursos";
import { useAuth } from "../../../services/authContext";
import ModuleCard from "../../../components/moduleCard/ModuleCard";
import BackLink from "../../../components/backLink/BackLink";

const CourseDetails = () => {
  const { cursoId, alumnoId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState();
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const fetchModules = async () => {
    // ✅ Salir si userRole no está definido aún
    if (!userRole) {
      return;
    }

    try {
  
      // Obtener información del curso
      const courseResponse = await getCoursesByStudentId(alumnoId);

      // Buscar el curso específico
      const courseInfo = courseResponse.data?.find((course) => {
        const courseId = course.course_id || course.id;
        return courseId === parseInt(cursoId);
      });

      if (courseInfo) {
        const courseName = courseInfo.course_name || courseInfo.name;
        setCourse({
          courseName: courseName,
          courseDescription: courseInfo.description,
        });
      }

      let modulesData = [];

      if (userRole === "student") {
        const filteredResponse = await getModulesByAlumnoAndCurso(
          alumnoId,
          cursoId
        );
       
        if (
          filteredResponse.success &&
          Array.isArray(filteredResponse.data) &&
          filteredResponse.data.length > 0
        ) {
          const courseData = filteredResponse.data[0];
          if (
            courseData.courseModules &&
            Array.isArray(courseData.courseModules)
          ) {
            modulesData = courseData.courseModules.map((module) => ({
              id: module.moduleId,
              name: module.moduleName,
              description: module.moduleDescription || "Sin descripción",
              classes:
                module.moduleLessons?.map((lesson) => ({
                  lessonNumber: lesson.lessonNumber,
                  lessonTitle: lesson.lessonTitle,
                  lessonDescription: lesson.lessonDescription,
                  url: lesson.lessonUrl,
                  id: lesson.lessonId,
                })) || [],
            }));
          }
        }
      } else {
        // Para admin/teacher: usar la función estándar
        const modulesResponse = await getModulesByCourseID(cursoId);
        if (modulesResponse.success && Array.isArray(modulesResponse.data)) {
          modulesData = modulesResponse.data;
        }
      }

      // Obtener lecciones si no las tenemos
      if (modulesData.length > 0 && !modulesData[0].classes) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            try {
              const lessonsResponse = await getLessonsByModuleIdAndCourseId(
                cursoId,
                module.id
              );
              const lessons =
                lessonsResponse.success && Array.isArray(lessonsResponse.data)
                  ? lessonsResponse.data.map((lesson) => ({
                      lessonNumber: lesson.lesson_number,
                      lessonTitle: lesson.title,
                      lessonDescription: lesson.description,
                      url: lesson.url,
                      id: lesson.id,
                    }))
                  : [];

              return {
                id: module.id,
                name: module.name,
                description: module.description,
                classes: lessons,
              };
            } catch (lessonError) {
              return {
                id: module.id,
                name: module.name,
                description: module.description,
                classes: [],
              };
            }
          })
        );
        setModules(modulesWithLessons);
      } else {
        setModules(modulesData);
      }

    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        setError(`Error al obtener los módulos: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ NO ejecutar si userRole aún no está definido
    if (cursoId && alumnoId && userRole) {
      fetchModules();
    }
  }, [cursoId, alumnoId, userRole]);

  const goToFormation = (alumnoId) => {
    navigate(`/alumnos/miscursos/${alumnoId}`);
  };

  if (loading) return <p className="loading-message">Cargando módulos...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="course-details-container">
        <div>
          <BackLink
            title="Volver a Mis Formaciones"
            onClick={() => goToFormation(alumnoId)}
          />
        </div>
        <h2 className="course-title">
          {course?.courseName || "Cargando curso..."}
        </h2>

        {modules.length > 0 ? (
          <div className="modules-grid">
            {modules.map((module) => (
              <ModuleCard
                moduleName={module.name}
                key={module.id}
                lessons={module.classes}
              />
            ))}
          </div>
        ) : (
          <p>No hay módulos disponibles para este curso.</p>
        )}
      </div>
    </>
  );
};

export default CourseDetails;
