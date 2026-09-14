import { instanceUsers, instanceCursos } from "./axiosInstances";

export const createAlumno = async (user) => {
  try {
    const response = await instanceUsers.post("/users/createCompleteStudent", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlumnos = async (page = 1, limit = 25, search = "") => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    const response = await instanceUsers.get(`/users/getStudentsWithCourses?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (student) => {
  try {
    const response = await instanceUsers.put("/users/updateStudent", student);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentActivo = async (user_id, activo) => {
  try {
    const response = await instanceUsers.put("/users/updateStudentActivo", {
      user_id,
      activo,
    });
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

export const getEnrollmentsByAlumnoId = async (student_id) => {
  try {
    const response = await instanceUsers.get( `/enrollments/getAllEnrollmentsByStudentId/${student_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getNotificationByStudentId = async (id_student) => {
  try {
    const response = await instanceCursos.get(
      `/lesson-comment-replies/notifications/${id_student}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markReplyNotificationAsViewed = async (id) => {
  try {
    const response = await instanceCursos.patch(
      `/lesson-comment-replies/mark-notification-as-viewed/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
