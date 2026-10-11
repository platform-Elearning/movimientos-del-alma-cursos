import { describe, it, expect } from "vitest";
import { destinoSegunRol, rutaPermitida } from "../roles";

describe("destinoSegunRol", () => {
  it("cada rol que existe tiene a dónde ir después del login", () => {
    for (const rol of ["student", "teacher", "admin", "seller", "marketing"]) {
      expect(destinoSegunRol(rol, "u1")).toBeTruthy();
    }
  });

  it("la vendedora va a su bandeja (antes se quedaba en el login)", () => {
    expect(destinoSegunRol("seller", "u1")).toBe("/ventas/seguimiento");
  });

  it("marketing va directo a su panel", () => {
    expect(destinoSegunRol("marketing", "u1")).toBe("/marketing");
  });

  it("alumnas y docentes van a lo suyo, con su id", () => {
    expect(destinoSegunRol("student", "u1")).toBe("/alumnos/miscursos/u1");
    expect(destinoSegunRol("teacher", "u1")).toBe("/profesores/profesoresMisCursos/u1");
  });

  it("un rol desconocido no inventa un destino", () => {
    expect(destinoSegunRol("otro", "u1")).toBeNull();
    expect(destinoSegunRol(undefined, "u1")).toBeNull();
  });
});

describe("rutaPermitida", () => {
  it("marketing entra a su panel y a cambiar la contraseña", () => {
    expect(rutaPermitida("marketing", "/marketing")).toBe(true);
    expect(rutaPermitida("marketing", "/changePassword")).toBe(true);
  });

  it("marketing no entra a ninguna otra pantalla", () => {
    for (const ruta of ["/admin", "/admin/pagos", "/admin/marketing", "/ventas/seguimiento", "/marketingfalso"]) {
      expect(rutaPermitida("marketing", ruta)).toBe(false);
    }
  });

  it("las pantallas de antes de entrar no se bloquean (el login después de salir)", () => {
    expect(rutaPermitida("marketing", "/login")).toBe(true);
    expect(rutaPermitida("marketing", "/OlvideContrase%C3%B1a")).toBe(true);
  });

  it("los otros roles no tienen restricción de rutas en el frontend", () => {
    expect(rutaPermitida("admin", "/admin/pagos")).toBe(true);
    expect(rutaPermitida("seller", "/ventas/pagos")).toBe(true);
    expect(rutaPermitida(null, "/admin")).toBe(true);
  });
});
