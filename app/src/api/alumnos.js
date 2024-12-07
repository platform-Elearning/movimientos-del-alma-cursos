import axios from "axios";
import { instanceUsers } from "./axiosInstances";

export const getAlumnos = async () => {
    try {
      console.log(`Llamando a la API para obtener los alumnos ${instanceUsers}`);
      const response = await instanceUsers.get("/getAllStudents");
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
      const response = await instanceUsers.post("/createCompleteStudent", user);
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