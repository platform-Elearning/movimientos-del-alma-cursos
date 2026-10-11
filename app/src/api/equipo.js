import { instanceUsers } from "./axiosInstances";

/**
 * El equipo: quienes trabajan en un panel y no son alumnas ni docentes (ventas
 * y marketing). Solo el admin lo ve y lo da de alta.
 */

/** { equipo: [{ id, email, role }], roles: { seller: "Ventas", ... } } */
export const getEquipo = async () => {
  const { data } = await instanceUsers.get("/users/equipo");
  return { equipo: data.data, roles: data.roles };
};

/**
 * Da de alta a alguien del equipo. El servidor genera la contraseña y la
 * devuelve UNA sola vez: { miembro, password }.
 */
export const crearMiembroDeEquipo = async ({ email, role }) => {
  const { data } = await instanceUsers.post("/users/equipo", { email, role });
  return { miembro: data.data, password: data.password };
};
