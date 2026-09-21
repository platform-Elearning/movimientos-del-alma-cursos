/**
 * Cómo se lee en pantalla cada valor de las listas cerradas.
 *
 * Vivía copiado en cinco archivos, y cada vez que la lista cambiaba había que
 * acordarse de los cinco. Cuando se separó la pauta del orgánico quedaron tres
 * pantallas actualizadas y una mostrando todavía «Orgánica», un valor que ya no
 * existía en la base.
 *
 * Las listas mismas siguen viniendo del backend — acá sólo está el nombre que
 * se muestra. Un valor sin traducir se muestra tal cual y no rompe nada.
 */
export const ETIQUETAS = {
  // Estado del contacto
  nueva: "Nueva",
  esperando_respuesta: "Esperando respuesta",
  en_conversacion: "En conversación",
  inscripta: "Inscripta",
  perdida: "Perdida",

  // De dónde vino. La pauta paga va separada del orgánico a propósito: sin esa
  // distinción no se puede calcular el costo por inscripción.
  meta_ads: "Meta Ads (pauta)",
  google_ads: "Google Ads (pauta)",
  ig: "Instagram",
  fb: "Facebook",
  whatsapp: "WhatsApp",
  web: "Página web",
  referida: "Referida",
  autoregistro: "Se registró sola",
  no_identificado: "No identificado",

  // Por qué se perdió
  falta_de_tiempo: "Falta de tiempo",
  precio: "Precio",
  otra_academia: "Se fue a otra academia",
  no_era_lo_que_buscaba: "No era lo que buscaba",
  nunca_respondio: "Nunca respondió",

  // Pagos
  matricula: "Matrícula",
  modulo: "Módulo",
  examen: "Examen",
  certificado: "Certificado",
  transferencia: "Transferencia",
  mercadopago: "MercadoPago",
  efectivo: "Efectivo",
  paypal: "PayPal",

  // Comunes
  otro: "Otro",
  sin_dato: "Sin dato",
  sin_asignar: "Sin asignar",
};

/** Traduce un valor; si no lo conoce lo devuelve tal cual. */
export const legible = (v) => ETIQUETAS[v] || v || "Sin dato";

/** Igual, pero para donde un valor vacío tiene que verse como un guión. */
export const legibleOpcional = (v) => ETIQUETAS[v] || v || "—";
