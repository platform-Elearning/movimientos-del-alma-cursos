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
