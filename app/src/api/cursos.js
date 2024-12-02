import axios from "./axios.js"

export const getCursos = async () => {
    try {
      const response = await axios.post("/cursos");
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

  export const getModulosByCursos = async (curso) => {
    try {
      const response = await axios.post("/cursos/:id/modulos", curso);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };