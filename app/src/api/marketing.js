import { instanceUsers } from "./axiosInstances";

/**
 * Inversión en publicidad.
 *
 * Es el único dato del sistema que no puede salir de la base: vive en Meta y en
 * Google, y alguien lo carga a mano.
 */

export const getOpcionesMarketing = async () => {
  const { data } = await instanceUsers.get("/marketing/opciones");
  return data.data;
};

export const getGastos = async ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const { data } = await instanceUsers.get(`/marketing?${params.toString()}`);
  return data.data;
};

/**
 * Carga el gasto. Si ya había gasto cargado para esa plataforma y ese mes, lo
 * devuelve como aviso — no bloquea, pero cargar dos veces el mismo mes duplica
 * la inversión y hunde el costo por inscripción.
 */
export const registrarGasto = async (gasto) => {
  const { data } = await instanceUsers.post("/marketing", gasto);
  return { gasto: data.data, yaHabia: data.yaHabiaGastoEsteMes };
};

export const eliminarGasto = async (id) => {
  const { data } = await instanceUsers.delete(`/marketing/${id}`);
  return data.data;
};

/**
 * La planilla de consultas e inscripciones, con las mismas columnas que la hoja
 * que se llenaba a mano: fecha, nombre, país, formación, origen, estado, si se
 * inscribió y cuánto pagó.
 */
export const getPlanilla = async ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const { data } = await instanceUsers.get(`/marketing/planilla?${params.toString()}`);
  return data.data;
};

/** Costo por consulta y por inscripción, con su cobertura de atribución. */
export const getMetricasInversion = async ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const { data } = await instanceUsers.get(`/marketing/metricas?${params.toString()}`);
  return data.data;
};
