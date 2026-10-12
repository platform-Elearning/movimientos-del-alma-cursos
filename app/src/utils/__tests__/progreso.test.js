import { describe, it, expect } from "vitest";
import {
  describirLogro,
  fraseDelMuro,
  ordenarClases,
  vecinasDe,
  porcentaje,
  fraseDeAvance,
  fraseDeRacha,
  fraseDeCelebracion,
  insigniasDelCurso,
  tieneConstancia,
} from "../progreso";

const modulos = [
  { id: 10, name: "Raíces", classes: [{ id: 1 }, { id: 2 }] },
  { id: 11, name: "Vacío", classes: [] },
  { id: 12, name: "Ondas", classes: [{ id: 3 }] },
];

describe("recorrido de clases", () => {
  it("pone todas las clases en orden, con su modulo, salteando modulos vacios", () => {
    expect(ordenarClases(modulos)).toEqual([
      { id: 1, moduleId: 10, moduleName: "Raíces" },
      { id: 2, moduleId: 10, moduleName: "Raíces" },
      { id: 3, moduleId: 12, moduleName: "Ondas" },
    ]);
  });

  it("la siguiente de la ultima clase de un modulo es la primera del siguiente", () => {
    const { anterior, siguiente } = vecinasDe(ordenarClases(modulos), "2");
    expect(anterior.id).toBe(1);
    expect(siguiente).toMatchObject({ id: 3, moduleName: "Ondas" });
  });

  it("en los extremos no hay vecina, y una clase desconocida no tiene actual", () => {
    const clases = ordenarClases(modulos);
    expect(vecinasDe(clases, 1).anterior).toBeNull();
    expect(vecinasDe(clases, 3).siguiente).toBeNull();
    expect(vecinasDe(clases, 99).actual).toBeNull();
  });
});

describe("avance", () => {
  it("porcentaje sin dividir por cero ni pasarse de 100", () => {
    expect(porcentaje(0, 0)).toBe(0);
    expect(porcentaje(7, 12)).toBe(58);
    expect(porcentaje(13, 12)).toBe(100);
  });

  it("frase segun cuanto lleva", () => {
    expect(fraseDeAvance(0, 12)).toMatch(/primera clase/);
    expect(fraseDeAvance(7, 12)).toBe("Llevás 7 de 12 clases 💃");
    expect(fraseDeAvance(12, 12)).toMatch(/Completaste/);
    expect(fraseDeAvance(0, 0)).toMatch(/no hay clases/);
  });
});

describe("racha", () => {
  it("sin practica no dice nada", () => {
    expect(fraseDeRacha({ diasEstaSemana: 0, semanasSeguidas: 0 })).toBeNull();
    expect(fraseDeRacha(null)).toBeNull();
  });

  it("cuenta los dias de esta semana, en singular y plural", () => {
    expect(fraseDeRacha({ diasEstaSemana: 1, semanasSeguidas: 1 })).toBe("Bailaste 1 día esta semana 🔥");
    expect(fraseDeRacha({ diasEstaSemana: 3, semanasSeguidas: 4 })).toBe(
      "Bailaste 3 días esta semana 🔥 · 4 semanas seguidas"
    );
  });

  it("si esta semana todavia no bailo, invita en vez de retar", () => {
    expect(fraseDeRacha({ diasEstaSemana: 0, semanasSeguidas: 2 })).toMatch(/te espera/);
  });
});

describe("logros y muro", () => {
  it("describe el logro con el modulo donde se gano", () => {
    expect(describirLogro({ kind: "modulo_completo", module_name: "Ondas" })).toMatchObject({
      titulo: "Módulo completo",
      detalle: "Terminaste el módulo “Ondas”",
    });
  });

  it("habla de vos con los propios y en tercera persona con los ajenos", () => {
    expect(fraseDelMuro({ kind: "curso_completo", es_mio: true })).toMatch(/^Vos completaste/);
    expect(fraseDelMuro({ kind: "primer_paso", es_mio: true })).toBe("Vos diste tu primer paso 🌱");
    expect(fraseDelMuro({ kind: "primer_paso", es_mio: false, quien: "Ana P." })).toBe(
      "Ana P. dio su primer paso 🌱"
    );
    expect(fraseDelMuro({ kind: "curso_completo", es_mio: false, quien: "Ana P." })).toMatch(
      /^Ana P\. completó/
    );
  });

  it("la frase de celebracion es estable para la misma semilla", () => {
    expect(fraseDeCelebracion(5)).toBe(fraseDeCelebracion(5));
    expect(typeof fraseDeCelebracion(undefined)).toBe("string");
  });
});

describe("insignias por formacion", () => {
  const logros = [
    { kind: "primer_paso", course_id: 1 },
    { kind: "modulo_completo", course_id: 1, module_id: 10 },
    { kind: "primer_paso", course_id: 2 },
    { kind: "modulo_completo", course_id: 2, module_id: 20 },
    { kind: "modulo_completo", course_id: 2, module_id: 21 },
    { kind: "constancia", course_id: null },
  ];
  const porTipo = (lista) => Object.fromEntries(lista.map((i) => [i.kind, i]));

  it("cada formacion cuenta solo sus logros", () => {
    const afro = porTipo(insigniasDelCurso(logros, 1, 3));
    expect(afro.primer_paso.ganada).toBe(true);
    expect(afro.modulo_completo).toMatchObject({ ganada: true, etiqueta: "1 de 3 módulos" });
    expect(afro.curso_completo.ganada).toBe(false);

    const jazz = porTipo(insigniasDelCurso(logros, 2, 4));
    expect(jazz.modulo_completo.etiqueta).toBe("2 de 4 módulos");
  });

  it("una formacion sin logros las muestra todas por ganar", () => {
    const nada = insigniasDelCurso(logros, 3, 5);
    expect(nada.every((i) => !i.ganada)).toBe(true);
    expect(nada.find((i) => i.kind === "modulo_completo").etiqueta).toBe("0 de 5 módulos");
  });

  it("la constancia no es de ninguna formacion", () => {
    expect(insigniasDelCurso(logros, 1, 3).some((i) => i.kind === "constancia")).toBe(false);
    expect(tieneConstancia(logros)).toBe(true);
    expect(tieneConstancia([])).toBe(false);
  });

  it("nunca dice mas modulos completos que modulos", () => {
    // Si se quito un modulo despues de completarlo, no queda "2 de 1".
    expect(porTipo(insigniasDelCurso(logros, 2, 1)).modulo_completo.etiqueta).toBe("2 de 2 módulos");
  });
});
