import { instanceCursos } from "./axiosInstances";

// Progreso de la alumna. El backend saca la alumna del token: ninguna de estas
// llamadas manda su id.

export const getResumenDeProgreso = async () => {
  const response = await instanceCursos.get("/progress/resumen");
  return response.data.data;
};

export const getProgresoDelCurso = async (courseId) => {
  const response = await instanceCursos.get(`/progress/cursos/${courseId}`);
  return response.data.data;
};

export const registrarVisitaDeClase = async (lessonId) => {
  await instanceCursos.post(`/progress/clases/${lessonId}/visita`);
};

/** Devuelve { completada, logrosNuevos }. */
export const marcarClaseCompletada = async (lessonId, completada) => {
  const response = await instanceCursos.put(`/progress/clases/${lessonId}/completada`, {
    completada,
  });
  return response.data.data;
};

/** Devuelve { logros, compartirLogros }. */
export const getMuroDelCurso = async (courseId) => {
  const response = await instanceCursos.get(`/progress/cursos/${courseId}/muro`);
  return response.data.data;
};

export const elegirCompartirLogros = async (compartir) => {
  const response = await instanceCursos.put("/progress/muro/compartir", { compartir });
  return response.data.data;
};
