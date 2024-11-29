import axios from "./axios.js"


export const registerRequest = async (user) => {
    try {
      const response = await axios.post("/register", user);
      return response.data; // Devuelve los datos de la respuesta si la solicitud se completa con éxito
    } catch (error) {
      throw error; // Lanza el error si ocurre una excepción durante la solicitud
    }
  };

  export const loginRequest = async (user) => {
    try {
      const response = await axios.post("/users/login", user);
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const logoutRequest = async (user) => {
    try {
      const response = await axios.get("/logout");
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const getUsersRequest = async () => {
    try {
      const response = await axios.get("/users");
      return response.data;
    } catch (error) {
      throw error; 
    }
  };

  export const deleteUserRequest = async (id) => {
    try {
      const response = await axios.delete(`/users/${id}`)
      return response 
    } catch (error) {
      throw error; // Lanza el error si ocurre una excepción durante la solicitud
    }
  }

export const verifyTokenRequest = () => axios.get(`/verify`)