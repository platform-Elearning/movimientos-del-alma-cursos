import { instanceUsers } from "./axiosInstances";

export const createAlumno = async (user) => {
  try {
    const token = localStorage.getItem("token");
    const response = await instanceUsers.post("/users/createCompleteStudent", user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlumnos = async () => {
  try {
    console.log(`Llamando a la API para obtener los alumnos ${instanceUsers}`);
    const response = await instanceUsers.get("/users/getStudentsWithCourses");
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



