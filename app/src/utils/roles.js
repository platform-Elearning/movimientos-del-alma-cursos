/**
 * A dónde va cada rol después de entrar.
 *
 * Estaba escrito como una cadena de if en el login y la vendedora no figuraba:
 * entraba y se quedaba mirando la pantalla de login. Acá cada rol tiene su
 * destino y un rol sin destino es un error visible en los tests, no una
 * pantalla que no avanza.
 */
export const destinoSegunRol = (rol, userId) => {
  switch (rol) {
    case "student":
      return `/alumnos/miscursos/${userId}`;
    case "teacher":
      return `/profesores/profesoresMisCursos/${userId}`;
    case "admin":
      return "/admin";
    case "seller":
      return "/ventas/seguimiento";
    case "marketing":
      return "/marketing";
    default:
      return null;
  }
};

/**
 * Las rutas a las que puede entrar cada rol restringido. Los demás roles no
 * tienen lista acá: la barrera real es el backend, que responde 403.
 *
 * Marketing ve SOLO su panel. Sin esto, entrando por URL a otra pantalla veía
 * la pantalla vacía y con errores (el backend no le daba datos), que no es lo
 * mismo que no verla. Cambiar la contraseña sí puede, como cualquiera.
 */
const RUTAS_DE_ROL = {
  marketing: ["/marketing", "/changePassword"],
};

/** Las de antes de entrar (login, registro, recuperar contraseña). */
const RUTAS_PUBLICAS = ["/", "/login", "/register", "/OlvideContraseña", "/verify-code", "/reset-password"];

export const rutaPermitida = (rol, ruta) => {
  const permitidas = RUTAS_DE_ROL[rol];
  if (!permitidas) return true;
  const decodificada = decodeURIComponent(ruta || "");
  if (RUTAS_PUBLICAS.includes(decodificada)) return true;
  return permitidas.some((p) => decodificada === p || decodificada.startsWith(`${p}/`));
};
