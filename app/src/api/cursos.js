import { instanceCursos, instanceEnrollmentss } from "./axiosInstances";

export const createCourse = async (course) => {
  try {
    console.log("course", course);
    const response = await instanceCursos.post("/courses/createCourse", course);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ⚠️ PROBLEMA: Esta función requiere permisos de ADMIN
// Solo debe usarse en contextos administrativos
export const getAllCursos = async () => {
  try {
    const response = await instanceCursos.get("/courses/getAllCourses");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCursos = async (studentId = null) => {
  try {
    if (studentId) {
      console.log('🎓 Obteniendo cursos para estudiante:', studentId);
      const response = await instanceCursos.get(`/courses/getCoursesByStudentId`, {
        headers: {
          id: studentId,
        },
      });
      return response.data;
    } else {
      // Si no hay studentId, intentar obtener todos los cursos (requiere admin)
      console.log('🔧 Obteniendo todos los cursos (requiere admin)');
      const response = await instanceCursos.get("/courses/getAllCourses");
      return response.data;
    }
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    throw error;
  }
};
  
export const registerStudentToCourse = async (enrollmentData) => {
  try {
    const response = await instanceEnrollmentss.post("/enrollments/registerToCourse", enrollmentData);
    return response.data;
  } catch (error) {
    console.error("Error registering student to course:", error);
    throw error;
  }
};

export const getCoursesByStudentId = async (studentId) => {
  try {
    const response = await instanceCursos.get(`/courses/getCoursesByStudentId`, {
      headers: {
        id: studentId, // Pasar el ID en los headers
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los cursos por studentId:", error);
    throw error;
  }
};

export const createModule = async (moduleData) => {
  try {
    const response = await instanceCursos.post(
      "/courses/createCourseModule",
      moduleData
    );
    return response.data;
  } catch (error) {
    console.error("Error al enviar los datos del módulo:", error);
    throw error;
  }
};

export const getModulosByCursos = async (curso) => {
  try {
    const response = await instanceCursos.post("/courses/cursos/:id/modulos", curso);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getModulesByCourseID = async (id) => {
  try {
    const response = await instanceCursos.get("/courses/getModulesByCourseId/" + id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getModulesByAlumnoAndCurso = async (userId, courseId) => {
  try {
    const response = await instanceCursos.get(
      `/courses/getCoursesWithModulesAndLessonsFilteredByCourseAndStudentId?student_id=${userId}&course_id=${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
  
export const createLesson = async (lessonData) => {
  try {
    const response = await instanceCursos.post("/courses/createLesson", lessonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};  

// CORREGIDA: Los parámetros estaban en el orden incorrecto
export const getLessonsByModuleIdAndCourseId = async (courseId, moduleId) => {
  try {
    // Corregido el orden de los parámetros para que coincida con el backend
    const response = await instanceCursos.get(
      `/courses/getLessonsByModuleIdAndCourseId?module_id=${moduleId}&course_id=${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};  
  

export default getCursos;