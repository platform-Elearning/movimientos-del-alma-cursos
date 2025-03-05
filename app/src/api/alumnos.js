import axios from "axios";
import { instanceUsers } from "./axiosInstances";

export const getAlumnos = async () => {
    try {
      console.log(`Llamando a la API para obtener los alumnos ${instanceUsers}`);
      const response = await instanceUsers.get("/getStudentsWithCourses");
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


  export const deleteAlumno = async (user_id) => {
    try {
      const response = await instanceUsers.delete(`/deleteStudent/${user_id}`);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };


