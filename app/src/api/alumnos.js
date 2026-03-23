import { instanceUsers } from "./axiosInstances";

export const createAlumno = async (user) => {
  try {
    const response = await instanceUsers.post("/users/createCompleteStudent", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlumnos = async (page = 1, limit = 25) => {
  try {
    const response = await instanceUsers.get(`/users/getStudentsWithCourses?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (user_id) => {
  try {
    const response = await instanceUsers.put("/users/updateStudent", user_id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAlumno = async (user_id) => {
  try {
    const response = await instanceUsers.delete(`/users/deleteStudent/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCursosByAlumno = async (user) => {
  try {
    const response = await instanceUsers.get("/users/alumnos/cursos", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentWithDni = async (identification_number) => {
  try {
    const response = await instanceUsers.get(`/users/getStudentWithDni/${identification_number}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};