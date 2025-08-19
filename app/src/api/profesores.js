import { instanceUsers, instanceCursos, instanceEnrollments } from "./axiosInstances";

export const createProfesor = async (user) => {
  try {
    const response = await instanceUsers.post(
      "/users/createCompleteTeacher",
      user
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfesores = async (user) => {
  try {
    const response = await instanceUsers.get("/users/getAllTeachers", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (userData) => {
  try {
    const response = await instanceUsers.put("/users/updateTeacher", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProfesor = async (id) => {
  try {
    const response = await instanceUsers.delete(
      `/users/deleteTeacher/${id}`,
      id
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignCourseToTeacher = async (teacherId, courseId) => {
  try {
    const payload = {
      course_id: parseInt(courseId),  
      teacher_id: String(teacherId)    
    };
    const response = await instanceCursos.post("/courses/assignCourseToTeacher", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseByTeacherId = async (teacherId) => {
  try {
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    if (response.data && response.data.success && response.data.data) {
      const basicCourses = response.data.data.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description
      }));
      return {
        success: true,
        data: basicCourses
      };
    }
    
    return { success: false, data: [] };
  } catch (error) {
    throw error;
  }
};

export const getCourseCompleteByTeacherId = async (teacherId) => {
  try {
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentByCourseId = async (courseId) => {
  try {
    const response = await instanceUsers.get(`/users/getStudentsByCourseId?courseId=${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentsByCourse = async (courseId) => {
  try {
    const response = await instanceUsers.get(`/users/getStudentsByCourseId?courseId=${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ NUEVA FUNCIÓN: Agregar módulos a un alumno
export const addModuleToStudent = async (studentDni, courseId, modulesToAdd = 1) => {
  try {
    const enrollmentData = {
      identification_number: studentDni,
      course_id: parseInt(courseId),
      modules_covered: modulesToAdd,
      notes: `Módulo agregado via admin - ${new Date().toLocaleDateString()}`
    };

    const response = await instanceEnrollments.post("/enrollments/registerToCourse", enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ NUEVA FUNCIÓN: Quitar módulos a un alumno
export const removeModuleFromStudent = async (studentDni, courseId, modulesToRemove = 1) => {
  try {
    const enrollmentData = {
      identification_number: studentDni,
      course_id: parseInt(courseId),
      modules_covered: -modulesToRemove, // Número negativo para restar
      notes: `Módulo removido via admin - ${new Date().toLocaleDateString()}`
    };

    const response = await instanceEnrollments.post("/enrollments/registerToCourse", enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getCourseDetails = async (courseId, teacherId) => {
  try {
    if (!teacherId) {
      throw new Error('teacherId es requerido para obtener detalles del curso');
    }
    
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    
    if (response.data && response.data.success && response.data.data) {
      const courseData = response.data.data.find(course => course.id === parseInt(courseId));
      
      if (courseData) {
        return {
          success: true,
          data: courseData
        };
      } else {
        throw new Error(`No se encontró el curso con ID ${courseId} para el profesor ${teacherId}`);
      }
    }
    
    throw new Error('No se pudieron obtener los cursos del profesor');
  } catch (error) {
    throw error;
  }
};