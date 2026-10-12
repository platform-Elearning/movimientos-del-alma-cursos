import { describe, it, expect } from "vitest";
import { conVariacion, explicarCobrado, explicarCostos, nombreDelMes } from "../resumen";

const mes = ({ consultas = 314, inscriptas = 9, identificadas, sin_identificar, plataformas = [] }) => ({
  consultas,
  inscriptas,
  atribucion: { identificadas, sin_identificar },
  porPlataforma: plataformas.map(([platform, n, currency = "ARS"]) => ({
    platform,
    currency,
    atribuido: { consultas: n },
  })),
});

const texto = (explicacion, titulo) => explicacion.find((e) => e.titulo === titulo)?.texto;

describe("explicarCostos", () => {
  it("con consultas de otro origen, avisa que el del mes completo se queda corto", () => {
    const e = explicarCostos(
      mes({ identificadas: 285, sin_identificar: 29, plataformas: [["meta_ads", 1]] })
    );
    expect(texto(e, "Del mes completo")).toMatch(/314 consultas y 9 inscriptas/);
    expect(texto(e, "Del mes completo")).toMatch(/284 consultas cargadas con otro origen/);
    expect(texto(e, "Del mes completo")).toMatch(/más alto/);
  });

  it("si nadie cargó el origen de la plataforma, dice que el atribuido no se puede calcular", () => {
    const e = explicarCostos(
      mes({ identificadas: 285, sin_identificar: 29, plataformas: [["meta_ads", 0]] })
    );
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).toMatch(/no se puede calcular/);
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).not.toMatch(/más bajo/);
  });

  it("con consultas sin origen, avisa que el atribuido se pasa", () => {
    const e = explicarCostos(
      mes({ identificadas: 300, sin_identificar: 14, plataformas: [["meta_ads", 250]] })
    );
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).toMatch(/250 consultas cargadas/);
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).toMatch(/14 consultas sin origen.*más bajo/);
  });

  it("con todo identificado, el atribuido es exacto y no dice 'más bajo'", () => {
    const e = explicarCostos(
      mes({ identificadas: 314, sin_identificar: 0, plataformas: [["meta_ads", 200]] })
    );
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).toMatch(/es exacto/);
    expect(texto(e, "Atribuido a Meta Ads (pauta)")).not.toMatch(/más bajo/);
  });

  it("si todo vino de la pauta, el del mes completo es el costo real", () => {
    const e = explicarCostos(
      mes({ identificadas: 314, sin_identificar: 0, plataformas: [["meta_ads", 314]] })
    );
    expect(texto(e, "Del mes completo")).toMatch(/es el costo real/);
  });

  it("una plataforma con gasto en dos monedas se explica una sola vez", () => {
    const e = explicarCostos(
      mes({
        identificadas: 314,
        sin_identificar: 0,
        plataformas: [
          ["meta_ads", 100, "ARS"],
          ["meta_ads", 100, "USD"],
        ],
      })
    );
    expect(e.filter((x) => x.titulo.startsWith("Atribuido"))).toHaveLength(1);
    // 214 de otro origen, no 114: las 100 de Meta se cuentan una vez.
    expect(texto(e, "Del mes completo")).toMatch(/214 consultas cargadas con otro origen/);
  });

  it("usa singular cuando es una", () => {
    const e = explicarCostos(
      mes({ consultas: 1, inscriptas: 1, identificadas: 1, sin_identificar: 0, plataformas: [["meta_ads", 1]] })
    );
    expect(texto(e, "Del mes completo")).toMatch(/1 consulta y 1 inscripta/);
  });
});

describe("textos del resumen", () => {
  it("nombre del mes con mayúscula sólo al principio", () => {
    expect(nombreDelMes("2026-09")).toBe("Septiembre de 2026");
  });

  it("distingue cero de sin datos en la comparación", () => {
    expect(conVariacion(9, 0, "agosto")).toBe("0 en agosto");
    expect(conVariacion(9, undefined, "agosto")).toBe("sin datos de agosto");
    expect(conVariacion(336, 300, "agosto")).toBe("+12 % vs agosto");
  });
});

describe("explicarCobrado", () => {
  const septiembre = {
    currency: "ARS",
    ingresos: 465000,
    alumnas_que_pagaron: 4,
    cobrado_mes: 1034261,
    alumnas_que_pagaron_mes: 9,
  };

  it("dice cuánto y de cuántas alumnas viene de quienes ya cursaban", () => {
    expect(explicarCobrado(septiembre)).toMatch(/\$ 569\.261 de 5 alumnas que ya cursaban/);
  });

  it("en singular cuando es una", () => {
    expect(explicarCobrado({ ...septiembre, alumnas_que_pagaron_mes: 5 })).toMatch(/1 alumna que ya cursaba/);
  });

  it("si todo lo cobrado es de las nuevas, no hay nada que explicar", () => {
    expect(explicarCobrado({ ...septiembre, cobrado_mes: 465000, alumnas_que_pagaron_mes: 4 })).toBeNull();
    expect(explicarCobrado({ ...septiembre, cobrado_mes: 0 })).toBeNull();
  });
});
