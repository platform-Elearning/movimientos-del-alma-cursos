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

/**
 * Una proporción (0..1) como porcentaje; sin dato, un guion. Entero por
 * defecto; con decimales para lo que se mueve en pocos puntos, como una
 * conversión de 2,87 % que redondeada a "3%" pierde la diferencia entre meses.
 */
export const porcentaje = (v, decimales = 0) => {
  if (v === null || v === undefined) return "—";
  // Sin decimales, Math.round como siempre: toLocaleString redondea al par
  // (12,5 -> 12) y cambiaría lo que ya muestran otras pantallas.
  if (!decimales) return `${Math.round(v * 100)}%`;
  return `${(v * 100).toLocaleString("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}%`;
};

/** Un retorno como multiplicador: 7.603 -> "7,6×". Sin dato, un guion. */
export const veces = (v) =>
  v === null || v === undefined
    ? "—"
    : `${Number(v).toLocaleString("es-AR", { maximumFractionDigits: 1 })}×`;

/**
 * Cuánto cambió respecto del mes anterior: "+12 %", "−5 %", "=".
 * Sin base para comparar (anterior en 0 o sin dato) no hay variación que dar:
 * pasar de 0 a 10 no es "+infinito %".
 */
export const variacion = (actual, anterior) => {
  if (actual === null || actual === undefined || !anterior) return null;
  const cambio = Math.round(((actual - anterior) / anterior) * 100);
  if (cambio === 0) return "=";
  return `${cambio > 0 ? "+" : "−"}${Math.abs(cambio)} %`;
};
