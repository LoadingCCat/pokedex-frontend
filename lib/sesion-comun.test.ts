import { afterEach, describe, expect, it, vi } from "vitest";
import { adminDisponible, datosDelToken, destinoSeguro } from "./sesion-comun";

/** JWT de prueba sin firma real: lib/sesion-comun no la verifica (lo hace el backend). */
function token(carga: object): string {
  const parte = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${parte({ alg: "HS256" })}.${parte(carga)}.firma`;
}

describe("F15 · sesión del panel", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("solo hay panel si existe API_URL", () => {
    vi.stubEnv("API_URL", "");
    expect(adminDisponible()).toBe(false);
    vi.stubEnv("API_URL", "http://localhost:8080/api");
    expect(adminDisponible()).toBe(true);
  });

  it("tras el login solo vuelve a rutas del panel", () => {
    expect(destinoSeguro("/admin/pokemon?pagina=2")).toBe("/admin/pokemon?pagina=2");
    expect(destinoSeguro("/admin")).toBe("/admin");
    expect(destinoSeguro(undefined)).toBe("/admin");
    expect(destinoSeguro("https://otro-sitio.com/admin")).toBe("/admin");
    expect(destinoSeguro("//otro-sitio.com/admin")).toBe("/admin");
    expect(destinoSeguro("/administrador-falso")).toBe("/admin");
    expect(destinoSeguro("/pokemon/25")).toBe("/admin");
  });

  it("lee el usuario de un token vigente y descarta uno vencido o mal formado", () => {
    const ahora = Date.UTC(2026, 10, 17, 12);
    const vigente = token({ sub: "admin", exp: ahora / 1000 + 3600 });
    expect(datosDelToken(vigente, ahora)).toEqual({ usuario: "admin", venceEn: new Date(ahora + 3600_000) });
    expect(datosDelToken(token({ sub: "admin", exp: ahora / 1000 - 1 }), ahora)).toBeNull();
    expect(datosDelToken(token({ exp: ahora / 1000 + 3600 }), ahora)).toBeNull();
    expect(datosDelToken("no-es-un-jwt", ahora)).toBeNull();
    expect(datosDelToken("a.%%%.c", ahora)).toBeNull();
  });
});
