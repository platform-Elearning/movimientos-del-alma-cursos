/**
 * Traduce un error de axios a algo que se pueda leer y accionar.
 *
 * La regla: nunca mandar a revisar los datos cuando el problema es del
 * servidor. "Revisá los datos e intentá de nuevo" frente a un backend caído
 * hace perder el tiempo buscando en el lugar equivocado — ya pasó.
 *
 * Los tres casos que de verdad se dan en este proyecto:
 *  - sin respuesta: el backend no está levantado (o no hay red).
 *  - 404: la ruta no existe todavía; casi siempre es un backend viejo en
 *    memoria, porque Node no recarga al guardar y hay que reiniciarlo.
 *  - cualquier otro: se muestra el motivo que mande el backend, si mandó uno.
 */
export const mensajeDeError = (err, accion = "cargar los datos") => {
  const delBackend = err?.response?.data?.error;
  if (delBackend) return delBackend;

  if (!err?.response) {
    return `No hay respuesta del servidor. Puede estar apagado: revisá que el backend esté corriendo.`;
  }
  if (err.response.status === 404) {
    return (
      "El servidor no conoce esta función todavía (404). Suele ser que está " +
      "corriendo una versión anterior: hay que reiniciarlo."
    );
  }
  return `No se pudo ${accion} por un error del servidor (${err.response.status}).`;
};
