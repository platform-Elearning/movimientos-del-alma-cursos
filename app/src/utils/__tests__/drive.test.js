import { describe, it, expect } from "vitest";
import { obtenerLinkDirecto } from "../drive";

const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";

describe("obtenerLinkDirecto", () => {
  it("convierte un link de visor de Drive en uno que sirve como imagen", () => {
    expect(obtenerLinkDirecto(`https://drive.google.com/file/d/${ID}/view?usp=sharing`)).toBe(
      `https://drive.google.com/thumbnail?id=${ID}`
    );
  });

  it("también el formato open?id=", () => {
    expect(obtenerLinkDirecto(`https://drive.google.com/open?id=${ID}`)).toBe(
      `https://drive.google.com/thumbnail?id=${ID}`
    );
  });

  it("una URL que no es de Drive se devuelve tal cual", () => {
    expect(obtenerLinkDirecto("https://ejemplo.com/foto.jpg")).toBe("https://ejemplo.com/foto.jpg");
  });

  it("sin URL no rompe la pantalla", () => {
    expect(obtenerLinkDirecto(undefined)).toBeUndefined();
    expect(obtenerLinkDirecto(null)).toBeNull();
  });
});
