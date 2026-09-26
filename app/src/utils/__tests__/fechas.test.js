import { describe, it, expect, afterEach, vi } from "vitest";
import { hoyLocal, mesLocal, mesCorriente } from "../fechas";

// Corre con TZ=America/Argentina/Buenos_Aires (ver el script "test"): el bug
// que esto cuida sólo aparece cuando la zona local no es UTC.
describe("fechas locales", () => {
  afterEach(() => vi.useRealTimers());

  it("un pago a las 22 del 30 de septiembre queda en septiembre, no en octubre", () => {
    // 22:30 en Argentina ya es 1 de octubre en UTC.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T01:30:00Z"));
    expect(hoyLocal()).toBe("2026-09-30");
    expect(mesLocal()).toBe("2026-09");
    expect(mesCorriente()).toEqual({ desde: "2026-09-01", hasta: "2026-09-30" });
  });

  it("el cierre de febrero termina el 29 en año bisiesto", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2028-02-10T15:00:00Z"));
    expect(mesCorriente()).toEqual({ desde: "2028-02-01", hasta: "2028-02-29" });
  });
});
