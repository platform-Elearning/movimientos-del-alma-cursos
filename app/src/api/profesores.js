import axios from "axios";
import { instanceUsers } from "./axiosInstances";

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
    const token = localStorage.getItem("token");
    const response = await instanceUsers.post("/createCompleteTeacher", user, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (user_id) => {
  try {
    const response = await instanceUsers.put("/updateTeacher", user_id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProfesor = async (id) => {
  try {
    const response = await instanceUsers.delete(`/deleteTeacher/${id}`,id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

