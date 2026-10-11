import { describe, it, expect } from "vitest";
import { plata, plataRedonda, porcentaje, veces, variacion } from "../formato";

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

  it("sin decimales redondea la mitad hacia arriba, como siempre", () => {
    expect(porcentaje(0.125)).toBe("13%");
  });

  it("con decimales, para conversiones bajas", () => {
    expect(porcentaje(9 / 314, 1)).toBe("2,9%");
    expect(porcentaje(0, 1)).toBe("0,0%");
  });

  it("sin dato muestra un guion y no 'NaN%'", () => {
    expect(porcentaje(null)).toBe("—");
    expect(porcentaje(undefined)).toBe("—");
  });
});

describe("veces", () => {
  it("muestra el retorno con un decimal", () => {
    expect(veces(7.603)).toBe("7,6×");
    expect(veces(0)).toBe("0×");
    expect(veces(null)).toBe("—");
  });
});

describe("variacion", () => {
  it("compara contra el mes anterior", () => {
    expect(variacion(336, 300)).toBe("+12 %");
    expect(variacion(285, 300)).toBe("−5 %");
    expect(variacion(300, 300)).toBe("=");
  });

  it("sin mes anterior con dato no inventa un porcentaje", () => {
    expect(variacion(10, 0)).toBeNull();
    expect(variacion(10, null)).toBeNull();
    expect(variacion(null, 10)).toBeNull();
  });
});
