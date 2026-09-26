import { describe, it, expect } from "vitest";
import { plata, plataRedonda, porcentaje } from "../formato";

describe("plata (importe exacto)", () => {
  it("muestra centavos con formato argentino", () => {
    expect(plata(35000.5, "ARS")).toBe("$ 35.000,50");
    expect(plata(35000, "ARS")).toBe("$ 35.000,00");
  });

  it("los dólares llevan su propio símbolo, nunca el de pesos", () => {
    expect(plata(120, "USD")).toBe("US$ 120,00");
  });

  it("acepta el importe como texto, que es como llega NUMERIC desde Postgres", () => {
    expect(plata("1500.25", "ARS")).toBe("$ 1.500,25");
  });
});

describe("plataRedonda (totales de tablero)", () => {
  it("redondea sin centavos", () => {
    expect(plataRedonda(1234.5, "ARS")).toBe("$ 1.235");
    expect(plataRedonda("99999.4", "USD")).toBe("US$ 99.999");
  });
});

describe("porcentaje", () => {
  it("pasa una proporción a porcentaje entero", () => {
    expect(porcentaje(0.456)).toBe("46%");
    expect(porcentaje(0)).toBe("0%");
  });

  it("sin dato muestra un guion y no 'NaN%'", () => {
    expect(porcentaje(null)).toBe("—");
    expect(porcentaje(undefined)).toBe("—");
  });
});
