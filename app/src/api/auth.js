import { instance, instanceUsers } from "./axiosInstances";

export const registerRequest = async (user) => {
    try {
      const response = await instance.post("/register", user);
      return response.data; // Devuelve los datos de la respuesta si la solicitud se completa con éxito
    } catch (error) {
      throw error; // Lanza el error si ocurre una excepción durante la solicitud
    }
  };

  export const loginRequest = async (user) => {
    try {
      console.log(user)
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
      throw error; // Lanza el error si ocurre una excepción durante la solicitud
    }
  }

export const verifyTokenRequest = () => instance.get(`/verify`)