import { describe, it, expect } from "vitest";
import { confirmacionDeBorrado, pagoAFormulario } from "../pagos";

describe("confirmacionDeBorrado", () => {
  it("desde el cierre del mes nombra a la alumna", () => {
    expect(
      confirmacionDeBorrado({
        name: "Ana",
        lastname: "Prueba",
        amount: "95000.00",
        currency: "ARS",
        concept: "modulo",
        paid_at: "2026-09-26T03:00:00.000Z",
      })
    ).toBe("¿Eliminar el pago de Ana Prueba de $ 95.000,00 (Módulo) del 2026-09-26? No se puede deshacer.");
  });

  it("desde la ficha, donde ya se sabe de quién es, no la repite", () => {
    expect(
      confirmacionDeBorrado({ amount: 120, currency: "USD", concept: "examen", paid_at: "2026-09-01" })
    ).toBe("¿Eliminar el pago de US$ 120,00 (Examen) del 2026-09-01? No se puede deshacer.");
  });
});

describe("pagoAFormulario", () => {
  it("una fila del cierre del mes se carga en el formulario tal cual", () => {
    expect(
      pagoAFormulario({
        concept: "modulo",
        modules_count: 2,
        amount: "94261.00",
        currency: "ARS",
        method: null,
        paid_at: "2026-09-30T03:00:00.000Z",
        notes: null,
        enrollment_id: 7,
      })
    ).toEqual({
      concept: "modulo",
      modules_count: 2,
      amount: "94261.00",
      currency: "ARS",
      method: "",
      paid_at: "2026-09-30",
      notes: "",
      enrollment_id: "7",
    });
  });
});
