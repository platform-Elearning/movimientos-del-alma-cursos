import axios from "axios";

export const getAlumnos = async () => {
    try {
      const response = await axios.get("/alumnos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  
export const getCursosByAlumno = async (user) => {
    try {
      const response = await axios.get("/alumnos/cursos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };


  export const createAlumno = async (user) => {
    try {
      const response = await axios.post("/alumnos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const editAlumno = async () => {
    try {
      const response = await axios.put("/alumnos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const deleteAlumno = async () => {
    try {
      const response = await axios.delete("/alumnos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };