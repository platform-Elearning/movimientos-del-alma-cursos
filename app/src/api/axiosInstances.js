<<<<<<< HEAD
import axios from "axios"
import Cookies from "js-cookie"

// Función para obtener el token de las cookies
const getAuthToken = () => {
  return Cookies.get('token');
};

// Interceptor para agregar el token a todas las peticiones
const addAuthInterceptor = (instance) => {
  // Interceptor de peticiones (request)
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuestas (response) para manejar tokens expirados
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido, redirigir al login
        Cookies.remove('token');
        // Si tienes un contexto de autenticación, puedes usarlo aquí
        // window.location.href = '/login';
        console.warn('Token expirado. Por favor, inicia sesión nuevamente.');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const instance = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true
}));

export const instanceUsers = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/users`,
}));

export const instanceCursos = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/courses`,
}));

export const instanceEnrollmentss = addAuthInterceptor(axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
}));
=======
import axios from "axios";
import Cookies from "js-cookie";

export const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

export const instanceUsers = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/users`,
});

// Interceptor para agregar el token a todas las peticiones de instanceUsers
instanceUsers.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const instanceCursos = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/courses`,
});

// Interceptor para agregar el token a todas las peticiones de instanceCursos
instanceCursos.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const instanceEnrollmentss = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
});

// Interceptor para agregar el token a todas las peticiones de instanceEnrollmentss
instanceEnrollmentss.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
>>>>>>> d67044b3c972a28e889fc0b11a4370b8c798375c

export const instanceReports = addAuthInterceptor(axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/report-problem`,
<<<<<<< HEAD
  headers: {
    "Content-Type": "application/json",
  }
}));
=======
});
>>>>>>> d67044b3c972a28e889fc0b11a4370b8c798375c

export default instance;
