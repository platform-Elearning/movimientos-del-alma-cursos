import { legibleOpcional as legible } from "./etiquetas";
import { plata } from "./formato";

/** "2026-09-26T03:00:00.000Z" -> "2026-09-26" */
export const soloFecha = (f) => (f ? String(f).slice(0, 10) : "");

/** Un pago (de la ficha o del cierre del mes), en la forma que espera el formulario. */
export const pagoAFormulario = (p) => ({
  concept: p.concept,
  modules_count: p.modules_count ?? "",
  amount: String(p.amount),
  currency: p.currency,
  method: p.method || "",
  paid_at: soloFecha(p.paid_at),
  notes: p.notes || "",
  enrollment_id: p.enrollment_id ? String(p.enrollment_id) : "",
});

/**
 * La pregunta antes de borrar un pago. Dice qué se borra -- importe, concepto,
 * fecha y, si se conoce, de quién -- y no un "¿seguro?" genérico: el pago es el
 * único registro de que esa plata entró.
 */
export const confirmacionDeBorrado = (p) => {
  const quien = p.name ? ` de ${[p.name, p.lastname].filter(Boolean).join(" ")}` : "";
  return (
    `¿Eliminar el pago${quien} de ${plata(p.amount, p.currency)} (${legible(p.concept)}) ` +
    `del ${soloFecha(p.paid_at)}? No se puede deshacer.`
  );
};
