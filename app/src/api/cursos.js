import { instanceCursos } from "./axiosInstances";

  export const getCursos = async () => {
      try {
        const response = await instanceCursos.get("/getAllCourses");
        return response.data;
      } catch (error) {
        throw error; 
      }
    };

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
      const response = await instanceCursos.post("registerToCourse", enrollmentData);
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

  export const getCoursesByStudentId = async (studentId) => {
    try {
      const response = await instanceCursos.get(`/getCoursesById/${studentId}`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  }

export default getCursos;