import { instanceUsers } from "./axiosInstances";

/**
 * Pagos de las alumnas.
 *
 * Los montos son libres y el concepto los explica: no hay tarifa que los ate.
 * Los totales vienen separados por moneda y así hay que mostrarlos — sumar
 * pesos y dólares en una sola cifra da un número que no significa nada.
 */

export const getOpcionesPago = async () => {
  const { data } = await instanceUsers.get("/payments/opciones");
  return data.data;
};

export const buscarAlumnas = async (busqueda = "") => {
  const params = new URLSearchParams();
  if (busqueda) params.append("busqueda", busqueda);
  const { data } = await instanceUsers.get(`/payments/alumnas?${params.toString()}`);
  return data.data;
};

/** Pagos, totales por moneda y por qué módulo va en cada formación. */
export const getPagosDeAlumna = async (studentId) => {
  const { data } = await instanceUsers.get(`/payments/alumna/${studentId}`);
  return data.data;
};

export const registrarPago = async (pago) => {
  const { data } = await instanceUsers.post("/payments", pago);
  return data.data;
};

export const getPagosDelPeriodo = async ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);
  const { data } = await instanceUsers.get(`/payments/periodo?${params.toString()}`);
  return data.data;
};

export const eliminarPago = async (id) => {
  const { data } = await instanceUsers.delete(`/payments/${id}`);
  return data.data;
};
