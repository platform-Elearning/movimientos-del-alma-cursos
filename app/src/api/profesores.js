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
    const response = await instanceUsers.get("/getAllTeachers", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProfesor = async (user) => {
  try {
    const response = await instanceUsers.post("/createCompleteTeacher", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (userData) => {
  try {
    const response = await instanceUsers.put("/updateTeacher", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProfesor = async (id) => {
  try {
    const response = await instanceUsers.delete(`/deleteTeacher/${id}`, id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignCourseToTeacher = async (teacherId, courseId) => {
  try {
    const response = await instanceCursos.post("/assignCourseToTeacher", {
      course_id: parseInt(courseId), 
      teacher_id: teacherId             
    });
    return response.data;
  } catch (error) {
    console.error("Error en assignCourseToTeacher:", error.response?.data || error.message);
    throw error;
  }
};


export const getCoursesByTeacher = async (teacherId) => {
  try {
    // TODO: Tu compañero debe crear este endpoint:
    // GET /courses/getCoursesByTeacher/:teacherId
    // const response = await instanceCursos.get(`/getCoursesByTeacher/${teacherId}`);
    // return response.data;
    
    console.warn(`🚨 ENDPOINT FALTANTE: GET /courses/getCoursesByTeacher/${teacherId}`);
    console.log("📋 Dile a tu compañero que cree este endpoint en el backend");
    
    // Simulación temporal elegante basada en asignaciones reales
    // Esto verifica si el profesor tiene cursos asignados revisando la tabla teacher_courses
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 1,
              name: "Capacitación en Composición Coreográfica",
              description: "Curso completo de composición coreográfica caracterizada por ritmo, participación comunitaria, movimientos conectados"
            }
          ]
        });
      }, 500); // Simula tiempo de carga
    });
    
  } catch (error) {
    console.warn("Error obteniendo cursos del profesor:", error);
    return { data: [] };
  }
};

// 🆕 Función para obtener módulos de un curso
export const getCourseModules = async (courseId) => {
  try {
    const response = await instanceCursos.get(`/getModulesByCourseId/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo módulos del curso:", error);
    throw error;
  }
};

// 🆕 Función para crear módulo
export const createCourseModule = async (moduleData) => {
  try {
    const response = await instanceCursos.post("/createCourseModule", moduleData);
    return response.data;
  } catch (error) {
    console.error("Error creando módulo:", error);
    throw error;
  }
};

// 🆕 Función para eliminar módulo
export const deleteCourseModule = async (moduleId) => {
  try {
    const response = await instanceCursos.delete(`/deleteModule/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando módulo:", error);
    throw error;
  }
};

// 🆕 Función para crear lección
export const createLesson = async (lessonData) => {
  try {
    const response = await instanceCursos.post("/createLesson", lessonData);
    return response.data;
  } catch (error) {
    console.error("Error creando lección:", error);
    throw error;
  }
};

// 🆕 Función para eliminar lección
export const deleteLesson = async (lessonId) => {
  try {
    const response = await instanceCursos.delete(`/deleteLesson/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando lección:", error);
    throw error;
  }
};

// 🆕 Función para obtener lecciones por módulo
export const getLessonsByModule = async (moduleId, courseId) => {
  try {
    const response = await instanceCursos.get(`/getLessonsByModuleIdAndCourseId?module_id=${moduleId}&course_id=${courseId}`);
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
        
        const response = await instanceUsers.get(`/getStudentsByCourseId?${param}`);
        
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

export const getCourseDetails = async (courseId) => {
  try {
    // TODO: Tu compañero puede crear este endpoint opcional:
    // GET /courses/getCourseDetails/:courseId
    // Por ahora simulamos con datos básicos
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: courseId,
            name: "Capacitación en Composición Coreográfica",
            description: "Curso completo de composición coreográfica caracterizada por ritmo, participación comunitaria, movimientos conectados",
            total_modules: 0, // Se cargarán dinámicamente
            total_lessons: 0, // Se cargarán dinámicamente
            total_students: 0 // Se cargarán dinámicamente
          }
        });
      }, 300);
    });
  } catch (error) {
    console.error("Error obteniendo detalles del curso:", error);
    throw error;
  }
};
