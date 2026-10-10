import { describe, it, expect } from "vitest";
import { mensajeDeError, esSesionVencida } from "../errores";

// La regla que protege: nunca mandar a revisar los datos cuando el problema es
// del servidor. Ya pasó que un backend caído se leía como "revisá los datos".
describe("mensajeDeError", () => {
  it("usa el motivo que manda el backend si mandó uno", () => {
    const err = { response: { status: 400, data: { error: "Falta la alumna" } } };
    expect(mensajeDeError(err)).toBe("Falta la alumna");
  });

  it("sin respuesta dice que el servidor puede estar apagado", () => {
    expect(mensajeDeError(new Error("Network Error"))).toMatch(/No hay respuesta del servidor/);
  });

  it("un 404 sin motivo apunta a un backend desactualizado", () => {
    expect(mensajeDeError({ response: { status: 404, data: {} } })).toMatch(/reiniciarlo/);
  });

  it("un 500 dice que es del servidor y nombra la acción", () => {
    const msg = mensajeDeError({ response: { status: 500, data: {} } }, "registrar el pago");
    expect(msg).toBe("No se pudo registrar el pago por un error del servidor (500).");
    expect(msg).not.toMatch(/revis/i);
  });
});

describe("esSesionVencida", () => {
  const con = (status, data) => ({ response: { status, data } });

  it("un 401 es sesión vencida", () => {
    expect(esSesionVencida(con(401, { error: "Authentication required" }))).toBe(true);
  });

  it("un 403 de token vencido o inválido también", () => {
    expect(esSesionVencida(con(403, { error: "Forbidden", expired: true }))).toBe(true);
    expect(esSesionVencida(con(403, undefined))).toBe(true);
  });

  it("un 403 con motivo propio es un permiso denegado: no hay que cerrar la sesión", () => {
    expect(
      esSesionVencida(con(403, { success: false, error: "Este curso no está asignado a tu usuario" }))
    ).toBe(false);
  });

  it("otros errores y la falta de respuesta no son sesión vencida", () => {
    expect(esSesionVencida(con(500, { error: "x" }))).toBe(false);
    expect(esSesionVencida(con(404, {}))).toBe(false);
    expect(esSesionVencida({})).toBe(false);
    expect(esSesionVencida(undefined)).toBe(false);
  });
});
