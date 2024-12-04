import axios from "axios";

  export const getCursosByProfesor = async (profesor) => {
    try {
      const response = await axios.get("/profesores/cursos", profesor);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const getProfesor = async () => {
      try {
        const response = await axios.get("/profesor", user);
        return response.data;
      } catch (error) {
        throw error; 
      }
    };
  
  
    export const createProfesor = async (user) => {
      try {
        const response = await axios.post("/profesor", user);
        return response.data;
      } catch (error) {
        throw error; 
      }
    };
  
    export const editProfesor = async () => {
      try {
        const response = await axios.put("/profesor", user);
        return response.data;
      } catch (error) {
        throw error; 
      }
    };
  
    export const deleteProfesor = async () => {
      try {
        const response = await axios.delete("/Profesor", user);
        return response.data;
      } catch (error) {
        throw error; 
      }
    };