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

export const getContactos = async ({
  estado,
  origen,
  asignado,
  busqueda,
  limite,
  offset,
} = {}) => {
  const params = new URLSearchParams();
  if (estado) params.append("estado", estado);
  if (origen) params.append("origen", origen);
  if (asignado) params.append("asignado", asignado);
  if (busqueda) params.append("busqueda", busqueda);
  if (limite) params.append("limite", limite);
  if (offset) params.append("offset", offset);
  const { data } = await instanceUsers.get(`/contacts?${params.toString()}`);
  // Vienen los contactos y el total: la lista dice cuántos hay más allá de la
  // página que se está mirando.
  return { contactos: data.contactos, total: data.total };
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

/**
 * Guarda y, si el backend reconoció a la misma persona, devuelve el aviso.
 *
 * El duplicado no es un error: el contacto se guarda igual y el aviso dice
 * dónde mirar. Rechazar el alta obligaría a resolverlo en el momento, con la
 * consulta esperando del otro lado.
 */
export const crearContacto = async (contacto) => {
  const { data } = await instanceUsers.post("/contacts", contacto);
  return { contacto: data.data, duplicados: data.duplicados };
};

export const actualizarContacto = async (id, contacto) => {
  const { data } = await instanceUsers.put(`/contacts/${id}`, contacto);
  return { contacto: data.data, duplicados: data.duplicados };
};

/**
 * Borra un contacto.
 *
 * El backend rechaza los que ya son alumnas: ese contacto es el único registro
 * de cómo llegó la persona. Para esos casos se edita.
 */
export const eliminarContacto = async (id) => {
  const { data } = await instanceUsers.delete(`/contacts/${id}`);
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

/**
 * Convierte el contacto en alumna: crea la cuenta y deja la vinculación hecha.
 *
 * Si la persona ya tenía cuenta no se crea otra, se vincula — y entonces no
 * viene contraseña, porque sigue usando la suya.
 */
export const inscribirContacto = async (id, datos) => {
  const { data } = await instanceUsers.post(`/contacts/${id}/inscribir`, datos);
  return data.data;
};

export const getMetricasContactos = async () => {
  const { data } = await instanceUsers.get("/contacts/metricas");
  return data.data;
};
