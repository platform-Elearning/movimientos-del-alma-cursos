import { describe, it, expect } from "vitest";
import { legible, legibleOpcional } from "../etiquetas";

describe("etiquetas", () => {
  it("traduce los valores conocidos", () => {
    expect(legible("no_identificado")).toBe("No identificado");
  });

  it("un valor nuevo del backend se muestra tal cual, sin romper", () => {
    expect(legible("tiktok_ads")).toBe("tiktok_ads");
  });

  it("sin valor muestra un marcador y no 'undefined'", () => {
    expect(legible(undefined)).toBe("Sin dato");
    expect(legibleOpcional(null)).toBe("—");
  });
});
