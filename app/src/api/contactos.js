import { instanceUsers } from "./axiosInstances";

/**
 * CRM de contactos: gente que consultó y todavía no se inscribió.
 *
 * Las mismas llamadas sirven al panel de admin y al de ventas: es el mismo
 * trabajo visto por dos roles, no dos conjuntos de datos.
 */

export const getOpcionesContacto = async () => {
  const { data } = await instanceUsers.get("/contacts/opciones");
  return data.data;
};

export const getContactos = async ({ estado, origen, busqueda, limite, offset } = {}) => {
  const params = new URLSearchParams();
  if (estado) params.append("estado", estado);
  if (origen) params.append("origen", origen);
  if (busqueda) params.append("busqueda", busqueda);
  if (limite) params.append("limite", limite);
  if (offset) params.append("offset", offset);
  const { data } = await instanceUsers.get(`/contacts?${params.toString()}`);
  return data;
};

/** La cola de seguimiento: a quién escribirle hoy, del que más espera al que menos. */
export const getSeguimiento = async (limite = 100) => {
  const { data } = await instanceUsers.get(`/contacts/seguimiento?limite=${limite}`);
  return data.data;
};

export const getContacto = async (id) => {
  const { data } = await instanceUsers.get(`/contacts/${id}`);
  return data.data;
};

export const crearContacto = async (contacto) => {
  const { data } = await instanceUsers.post("/contacts", contacto);
  return data.data;
};

export const actualizarContacto = async (id, contacto) => {
  const { data } = await instanceUsers.put(`/contacts/${id}`, contacto);
  return data.data;
};

/** Registra una interacción y, si se pasa, mueve el estado en el mismo paso. */
export const registrarEvento = async (id, { note, status, event_date } = {}) => {
  const { data } = await instanceUsers.post(`/contacts/${id}/eventos`, {
    note,
    status,
    event_date,
  });
  return data.data;
};

export const getMetricasContactos = async () => {
  const { data } = await instanceUsers.get("/contacts/metricas");
  return data.data;
};
