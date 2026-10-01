import { describe, it, expect } from "vitest";
import { mensajeDeError } from "../errores";

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
