import { instanceLocalhost } from "./axiosInstances.js";

export const getCursos = async (user) => {
    try {
      const response = await instanceLocalhost.get("/cursos", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };