import { describe, it, expect } from "vitest";
import { filtrarPorTexto, moverEnLista, normalizarTexto } from "../buscar";

describe("normalizarTexto", () => {
  it("ignora mayúsculas, acentos y espacios de los bordes", () => {
    expect(normalizarTexto("  María JOSÉ ")).toBe("maria jose");
    expect(normalizarTexto(null)).toBe("");
  });
});

describe("filtrarPorTexto", () => {
  const filas = [
    { nombre: "María Pérez", formacion: "Jazz", dni: "12345678" },
    { nombre: "Ana Gómez", formacion: "Jazz", dni: "87654321" },
    { nombre: "Ana López", formacion: "Clásica", dni: null },
  ];
  const campos = (f) => [f.nombre, f.formacion, f.dni];

  it("sin búsqueda devuelve todo", () => {
    expect(filtrarPorTexto(filas, "  ", campos)).toHaveLength(3);
  });

  it("encuentra sin acentos ni mayúsculas", () => {
    expect(filtrarPorTexto(filas, "maria", campos).map((f) => f.nombre)).toEqual(["María Pérez"]);
  });

  it("cada palabra tiene que aparecer en algún campo", () => {
    expect(filtrarPorTexto(filas, "ana jazz", campos).map((f) => f.nombre)).toEqual(["Ana Gómez"]);
  });

  it("busca también por DNI, y un campo vacío no rompe", () => {
    expect(filtrarPorTexto(filas, "8765", campos).map((f) => f.nombre)).toEqual(["Ana Gómez"]);
  });
});

describe("moverEnLista", () => {
  it("sube y baja un elemento sin tocar la lista original", () => {
    const lista = ["a", "b", "c", "d"];
    expect(moverEnLista(lista, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(moverEnLista(lista, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(lista).toEqual(["a", "b", "c", "d"]);
  });

  it("fuera de rango o al mismo lugar devuelve la misma lista", () => {
    const lista = ["a", "b"];
    expect(moverEnLista(lista, 0, 0)).toBe(lista);
    expect(moverEnLista(lista, 0, 5)).toBe(lista);
    expect(moverEnLista(lista, -1, 1)).toBe(lista);
  });
});
