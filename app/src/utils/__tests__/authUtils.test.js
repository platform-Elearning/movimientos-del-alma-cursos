import { describe, it, expect, vi } from "vitest";
import AuthUtils from "../authUtils";

// Un JWT armado a mano: el frontend sólo decodifica el payload, no verifica la
// firma (eso lo hace el backend), así que la firma puede ser cualquier cosa.
const jwt = (payload) => {
  const b64url = (o) =>
    Buffer.from(JSON.stringify(o)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.firma`;
};

const ahora = () => Math.floor(Date.now() / 1000);

describe("AuthUtils.decodeToken", () => {
  it("lee el rol y los datos del payload, con acentos", () => {
    const token = jwt({ id: "abc", role: "seller", name: "Sofía" });
    expect(AuthUtils.decodeToken(token)).toMatchObject({ id: "abc", role: "seller", name: "Sofía" });
  });

  it("un token roto devuelve null en vez de tumbar la app", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(AuthUtils.decodeToken("no-es-un-jwt")).toBeNull();
    silencio.mockRestore();
  });
});

describe("AuthUtils.isTokenExpired", () => {
  it("vigente si exp está en el futuro", () => {
    expect(AuthUtils.isTokenExpired(jwt({ exp: ahora() + 3600 }))).toBe(false);
  });

  it("vencido si exp ya pasó", () => {
    expect(AuthUtils.isTokenExpired(jwt({ exp: ahora() - 1 }))).toBe(true);
  });

  it("sin exp o ilegible se trata como vencido: ante la duda, pedir login", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(AuthUtils.isTokenExpired(jwt({ id: "abc" }))).toBe(true);
    expect(AuthUtils.isTokenExpired("basura")).toBe(true);
    silencio.mockRestore();
  });
});
