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
      const response = await instanceUsers.post("/login", user);

      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const logoutRequest = async (user) => {
    try {
      const response = await instance.get("/logout");
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
      const response = await instance.delete(`/users/${id}`)
      return response 
    } catch (error) {
      throw error; 
    }
  }

  export const changePassword = async ({ email, password, newPassword1, newPassword2 }) => {
    console.log(email, password, newPassword1, newPassword2)
    try {
      const response = await instanceUsers.post("/changePassword", {
        email,
        password,
        newPassword1,
        newPassword2,
      });
  
      return response.data;
    } catch (error) {
      // Manejar errores específicos de Axios
      if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(error.response.data.message || "Error al cambiar la contraseña.");
      } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        throw new Error("No se recibió respuesta del servidor.");
      } else {
        // Otro tipo de error
        throw new Error("Error al realizar la petición.");
      }
    }
  };

export const verifyTokenRequest = () => instance.get(`/verify`)