/**
 * Cómo se muestran importes y porcentajes.
 *
 * Estaban copiados en Pagos, Marketing y Tableros. Las copias no eran iguales, y
 * a propósito: un pago se muestra con centavos porque es un importe exacto, y un
 * total de tablero se redondea porque los centavos ahí son ruido. Por eso hay
 * dos funciones y no una.
 *
 * Los importes van SIEMPRE con su moneda pegada: nunca un número solo, y nunca
 * pesos y dólares sumados en una misma cifra.
 */

const simbolo = (moneda) => (moneda === "USD" ? "US$" : "$");

/** Un importe exacto, con centavos: "$ 35.000,50". */
export const plata = (monto, moneda) =>
  `${simbolo(moneda)} ${Number(monto).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Un total redondeado, para tableros: "$ 35.001". */
export const plataRedonda = (monto, moneda) =>
  `${simbolo(moneda)} ${Number(monto).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;

/** Una proporción (0..1) como porcentaje entero; sin dato, un guion. */
export const porcentaje = (v) =>
  v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`;
