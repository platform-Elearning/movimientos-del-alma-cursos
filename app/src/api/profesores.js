import axios from "axios";
import { instanceUsers, instanceCursos } from "./axiosInstances";

export const getCursosByProfesor = async (profesor) => {
  try {
    const response = await axios.get("/profesores/cursos", profesor);
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

export const createProfesor = async (user) => {
  try {
    const response = await instanceUsers.post("/users/createCompleteTeacher", user);
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
    const response = await instanceUsers.delete(`/users/deleteTeacher/${id}`, id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignCourseToTeacher = async (teacherId, courseId) => {
  try {
    console.log('🔍 Asignando curso - teacherId:', teacherId, 'courseId:', courseId);
    console.log('🔍 Tipos - teacherId:', typeof teacherId, 'courseId:', typeof courseId);
    
    // ✅ CORRECTO: course_id y teacher_id con tipos correctos
    const payload = {
      course_id: parseInt(courseId),    // Course ID debe ser entero
      teacher_id: String(teacherId)     // Teacher ID debe ser string
    };
    
    console.log('🔍 Payload enviado:', payload);
    console.log('🔍 Tipos en payload - teacher_id:', typeof payload.teacher_id, 'course_id:', typeof payload.course_id);
    
    const response = await instanceCursos.post("/courses/assignCourseToTeacher", payload);
    
    console.log('✅ Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en assignCourseToTeacher:', error.response?.data || error.message);
    throw error;
  }
};

// 🆕 Función para obtener cursos por ID de profesor (LISTA BÁSICA)
// USAR LA RUTA CORRECTA DEL BACKEND PARA TEACHERS
export const getCourseByTeacherId = async (teacherId) => {
  try {
    console.log(`🔍 getCourseByTeacherId llamada con teacherId: ${teacherId}`);
    
    // ✅ CORREGIDO: Usar la ruta correcta que acepta teachers
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    
    if (response.data && response.data.success && response.data.data) {
      // Extraer solo la información básica de los cursos
      const basicCourses = response.data.data.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description
      }));
      
      console.log('✅ getCourseByTeacherId respuesta (extraída):', basicCourses);
      return {
        success: true,
        data: basicCourses
      };
    }
    
    return { success: false, data: [] };
  } catch (error) {
    console.error('❌ Error en getCourseByTeacherId:', error.response?.data || error.message);
    throw error;
  }
};

// 🆕 Función para obtener curso completo con módulos y lecciones por ID de profesor
export const getCourseCompleteByTeacherId = async (teacherId) => {
  try {
    console.log(`🔍 getCourseCompleteByTeacherId llamada con teacherId: ${teacherId}`);
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    console.log('✅ getCourseCompleteByTeacherId respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getCourseCompleteByTeacherId:', error.response?.data || error.message);
    throw error;
  }
};

// 🆕 Función para obtener estudiantes por ID de curso
export const getStudentByCourseId = async (courseId) => {
  try {
    console.log(`🔍 getStudentByCourseId llamada con courseId: ${courseId}`);
    // NOTA: El backend usa "courseId" como parámetro, no "course_id"
    const response = await instanceUsers.get(`/users/getStudentsByCourseId?courseId=${courseId}`);
    console.log('✅ getStudentByCourseId respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en getStudentByCourseId:', error.response?.data || error.message);
    throw error;
  }
};

// 🆕 Función para obtener módulos de un curso
export const getCourseModules = async (courseId) => {
  try {
    const response = await instanceCursos.get(`/courses/getModulesByCourseId/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo módulos del curso:", error);
    throw error;
  }
};

// 🆕 Función para crear módulo
export const createCourseModule = async (moduleData) => {
  try {
    const response = await instanceCursos.post("/courses/createCourseModule", moduleData);
    return response.data;
  } catch (error) {
    console.error("Error creando módulo:", error);
    throw error;
  }
};

// 🆕 Función para eliminar módulo
export const deleteCourseModule = async (moduleId) => {
  try {
    const response = await instanceCursos.delete(`/courses/deleteModule/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando módulo:", error);
    throw error;
  }
};

// 🆕 Función para crear lección
export const createLesson = async (lessonData) => {
  try {
    const response = await instanceCursos.post("/courses/createLesson", lessonData);
    return response.data;
  } catch (error) {
    console.error("Error creando lección:", error);
    throw error;
  }
};

// 🆕 Función para eliminar lección
export const deleteLesson = async (lessonId) => {
  try {
    const response = await instanceCursos.delete(`/courses/deleteLesson/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando lección:", error);
    throw error;
  }
};

// 🆕 Función para obtener lecciones por módulo
export const getLessonsByModule = async (moduleId, courseId) => {
  try {
    const response = await instanceCursos.get(`/courses/getLessonsByModuleIdAndCourseId?module_id=${moduleId}&course_id=${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo lecciones:", error);
    throw error;
  }
};

export const getStudentsByCourse = async (courseId) => {
  try {
    console.log('🔍 getStudentsByCourse llamada con courseId:', courseId);
    console.log('🔍 Tipo de courseId:', typeof courseId);
    
    // Asegurar que courseId sea un entero
    const courseIdInt = parseInt(courseId);
    console.log('🔍 courseId convertido a int:', courseIdInt);
    
    // El backend dice "Course ID is required", probemos diferentes nombres de parámetros
    const possibleParams = [
      `course_id=${courseIdInt}`,      // Lo que estamos usando
      `courseId=${courseIdInt}`,       // camelCase
      `id=${courseIdInt}`,             // solo 'id'
      `course=${courseIdInt}`,         // sin '_id'
      `Course_ID=${courseIdInt}`,      // mayúsculas
      `COURSE_ID=${courseIdInt}`       // todo mayúsculas
    ];
    
    // Intentar con diferentes nombres de parámetros
    for (let i = 0; i < possibleParams.length; i++) {
      try {
        const param = possibleParams[i];
        console.log(`🔄 Intento ${i + 1}: /getStudentsByCourseId?${param}`);
        
        const response = await instanceUsers.get(`/users/getStudentsByCourseId?${param}`);
        
        console.log('✅ ¡ÉXITO! Respuesta exitosa con parámetro:', param);
        console.log('✅ Datos recibidos:', response.data);
        return response.data;
        
      } catch (error) {
        console.log(`❌ Falló intento ${i + 1} con parámetro: ${possibleParams[i]}`);
        console.log('❌ Error:', error.response?.data?.errorMessage || error.message);
        
        // Si no es el último intento, continuar
        if (i < possibleParams.length - 1) {
          continue;
        }
        
        // Si es el último intento, lanzar el error
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error después de todos los intentos:', error);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Data:', error.response?.data);
    
    // Agregar información útil para el backend
    console.warn('🚨 DILE A TU AMIGO DEL BACKEND:');
    console.warn('   El endpoint responde pero dice "Course ID is required"');
    console.warn('   Esto significa que el parámetro no se está recibiendo correctamente');
    console.warn('   Posibles soluciones:');
    console.warn('   1. Cambiar el nombre del parámetro en el backend');
    console.warn('   2. Verificar cómo está leyendo los query parameters');
    console.warn('   3. Revisar si usa req.query.course_id o req.params.course_id');
    
    throw error;
  }
};

// ✅ CORREGIDO: getCourseDetails usando la ruta correcta para teachers
export const getCourseDetails = async (courseId, teacherId) => {
  try {
    console.log(`🔍 getCourseDetails llamada con courseId: ${courseId}, teacherId: ${teacherId}`);
    
    if (!teacherId) {
      throw new Error('teacherId es requerido para obtener detalles del curso');
    }
    
    // ✅ USAR LA RUTA CORRECTA: getCourseCompleteByTeacherId que acepta teachers
    const response = await instanceCursos.get(`/courses/getCourseCompleteByTeacherId/${teacherId}`);
    
    if (response.data && response.data.success && response.data.data) {
      // Buscar el curso específico en la lista de cursos del teacher
      const courseData = response.data.data.find(course => course.id === parseInt(courseId));
      
      if (courseData) {
        console.log('✅ getCourseDetails respuesta:', courseData);
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
    console.error('❌ Error en getCourseDetails:', error.response?.data || error.message);
    throw error;
  }
};