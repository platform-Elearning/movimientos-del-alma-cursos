/**
 * Fechas en la zona de acá, no en UTC.
 *
 * El problema, con consecuencias contables: `new Date().toISOString()` devuelve
 * la fecha en UTC, y Argentina está en UTC-3. Después de las 21:00 el día UTC ya
 * es el siguiente, así que un pago cargado el 30 de septiembre a las 22 quedaba
 * con fecha 1 de octubre — y el cierre de septiembre no lo contaba.
 *
 * El mismo desfase ponía días de espera negativos en la bandeja: la fecha de
 * último contacto quedaba en el futuro.
 *
 * Todo lo que sea "hoy" o "este mes" para la pantalla sale de acá.
 */

/** Hoy, como YYYY-MM-DD, según el reloj de quien está mirando. */
export const hoyLocal = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

/** Este mes, como YYYY-MM. */
export const mesLocal = () => hoyLocal().slice(0, 7);

/** El primer y el último día del mes corriente, para el cierre mensual. */
export const mesCorriente = () => {
  const d = new Date();
  const aFecha = (x) => {
    const mes = String(x.getMonth() + 1).padStart(2, "0");
    const dia = String(x.getDate()).padStart(2, "0");
    return `${x.getFullYear()}-${mes}-${dia}`;
  };
  return {
    desde: aFecha(new Date(d.getFullYear(), d.getMonth(), 1)),
    // Día 0 del mes siguiente es el último del actual, y funciona con febrero.
    hasta: aFecha(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
};

/**
 * "hace 5 minutos", "hace 3 días": para el muro de logros, donde importa cuan
 * reciente es y no la hora exacta. ahora se pasa en los tests.
 */
export const tiempoRelativo = (fecha, ahora = new Date()) => {
  const momento = new Date(fecha);
  if (isNaN(momento)) return "";
  const segundos = Math.max(0, Math.round((ahora - momento) / 1000));
  const unidades = [
    [60 * 60 * 24 * 30, "mes", "meses"],
    [60 * 60 * 24 * 7, "semana", "semanas"],
    [60 * 60 * 24, "día", "días"],
    [60 * 60, "hora", "horas"],
    [60, "minuto", "minutos"],
  ];
  for (const [tamaño, singular, plural] of unidades) {
    const n = Math.floor(segundos / tamaño);
    if (n >= 1) return `hace ${n} ${n === 1 ? singular : plural}`;
  }
  return "recién";
};
