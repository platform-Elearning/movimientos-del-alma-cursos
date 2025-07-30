import { instanceCursos, instanceEnrollments } from "./axiosInstances";

// =====================================================
// 🎓 GESTIÓN DE CURSOS
// =====================================================

export const createCourse = async (course) => {
  try {
    const response = await instanceCursos.post("/courses/createCourse", course);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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
      const response = await instanceCursos.get(`/courses/getCoursesByStudentId`, {
        headers: {
          id: studentId,
        },
      });
      return response.data;
    } else {
      const response = await instanceCursos.get("/courses/getAllCourses");
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const getCoursesByStudentId = async (studentId) => {
  try {
    const response = await instanceCursos.get(`/courses/getCoursesByStudentId`, {
      headers: {
        id: studentId, // Pasar el ID en los headers como espera el backend
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 📚 GESTIÓN DE MÓDULOS
// =====================================================

export const createModule = async (moduleData) => {
  try {
    const response = await instanceCursos.post(
      "/courses/createCourseModule",
      moduleData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCourseModule = createModule;

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

export const getCourseModules = async (courseId) => {
  try {
    const response = await instanceCursos.get(`/courses/getModulesByCourseId/${courseId}`);
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

export const deleteCourseModule = async (moduleId) => {
  try {
    const response = await instanceCursos.delete(`/courses/deleteModule/${moduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 📖 GESTIÓN DE LECCIONES
// =====================================================

export const createLesson = async (lessonData) => {
  try {
    const response = await instanceCursos.post("/courses/createLesson", lessonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await instanceCursos.delete(`/courses/deleteLesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonsByModuleIdAndCourseId = async (courseId, moduleId) => {
  try {
    const response = await instanceCursos.get(
      `/courses/getLessonsByModuleIdAndCourseId?module_id=${moduleId}&course_id=${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonsByModule = async (moduleId, courseId) => {
  try {
    const response = await instanceCursos.get(`/courses/getLessonsByModuleIdAndCourseId?module_id=${moduleId}&course_id=${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// =====================================================
// 🎯 INSCRIPCIONES Y REGISTROS
// =====================================================

export const registerStudentToCourse = async (enrollmentData) => {
  try {
    const response = await instanceEnrollments.post("/enrollments/registerToCourse", enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default getCursos;