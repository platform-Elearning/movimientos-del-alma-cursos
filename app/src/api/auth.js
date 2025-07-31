import { instance, instanceUsers } from "./axiosInstances.js";


export const registerRequest = async (user) => {
  try {
    const response = await instance.post("/register", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginRequest = async (user) => {
  try {
    const response = await instanceUsers.post("/session/login", user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutRequest = async () => {
  try {
    const response = await instanceUsers.post("/session/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsersRequest = async () => {
  try {
    const response = await instance.get("/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserRequest = async (id) => {
  try {
    const response = await instance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async ({ email, password, newPassword1, newPassword2 }) => {
  try {
    const response = await instanceUsers.post("/users/changePassword", {
      email,
      password,
      newPassword1,
      newPassword2,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Error al cambiar la contraseña.");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor.");
    } else {
      throw new Error("Error al realizar la petición.");
    }
  }
};

export const refreshTokenRequest = async () => {
  try {
    const response = await instanceUsers.post("/session/refresh-token", {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};