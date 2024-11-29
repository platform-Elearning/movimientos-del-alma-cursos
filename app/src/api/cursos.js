import axios from "./axios.js"

export const getCursos = async (user) => {
    try {
      const response = await axios.post("/cursos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };