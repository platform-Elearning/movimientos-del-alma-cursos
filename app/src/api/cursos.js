import { instanceCursos, instanceEnrollmentss } from "./axiosInstances";

  export const getCursos = async () => {
      try {
        const response = await instanceCursos.get("/getAllCourses");
        return response.data;
      } catch (error) {
        throw error; 
      }
    };

  export const createCourse = async (course) => {
    try {
      console.log("course", course);
      const response = await instanceCursos.post("/createCourse", course);
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

  export const createProfesor = async (user) => {
    try {
       const response = await instanceCursos.post("/profesor", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };
  
  export const editProfesor = async () => {
    try {
      const response = await instanceCursos.put("/profesor", user);
      return response.data;
     } catch (error) {
        throw error; 
      }
    };
  
    export const deleteProfesor = async () => {
      try {
        const response = await instanceCursos.delete("/Profesor", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const getModulosByCursos = async (curso) => {
    try {
      const response = await instanceCursos.post("/cursos/:id/modulos", curso);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const registerStudentToCourse = async (enrollmentData) => {
    try {
      const response = await instanceEnrollmentss.post("registerToCourse", enrollmentData);
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

  export const getCoursesByStudentId = async (studentId) => {
    try {
      const response = await instanceCursos.get(`/getCoursesByStudentId`, {
        headers: {
          "id": studentId, // Pasar el ID en los headers
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
      const response = await instanceCursos.post("/createCourseModule", moduleData);
      return response.data;
    } catch (error) {
      console.error("Error al enviar los datos del módulo:", error);
      throw error;
    }
  };


export default getCursos;