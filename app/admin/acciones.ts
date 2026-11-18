"use server";
/**
 * Server actions del panel (F15, P8). Leen el token de la cookie httpOnly y llaman a la API con
 * `Authorization`; el navegador nunca ve el token. El backend vuelve a validar todo.
 * Un 401 (sesión vencida) borra la cookie y lleva a /login.
 */
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { escribirApi } from "@/lib/api/admin";
import { borrarSesion, leerSesion } from "@/lib/sesion";
import { AVISO_SIN_API, adminDisponible } from "@/lib/sesion-comun";
import type { ResultadoAccion } from "@/lib/validacion-admin";

const esId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0;

function mensajeDeError(status: number, mensaje?: string, hayCampos?: boolean): string {
  if (status === 0) return "No se pudo conectar con la API. Comprueba que el backend esté arrancado.";
  if (status === 400) return hayCampos ? "Revisa los campos marcados." : (mensaje ?? "Revisa los datos del formulario.");
  if (status === 403) return "Tu usuario no tiene permiso para modificar los datos.";
  if (status === 404) return "Ya no existe: quizá se borró hace un momento.";
  if (status === 409) return mensaje ?? "Ya existe un registro con esos datos.";
  return "No se pudo guardar. Vuelve a intentarlo en unos segundos.";
}

async function ejecutar(
  metodo: "POST" | "PUT" | "DELETE",
  ruta: string,
  cuerpo: unknown,
  volver: string,
): Promise<ResultadoAccion> {
  if (!adminDisponible()) return { ok: false, mensaje: AVISO_SIN_API };
  const sesion = await leerSesion();
  if (!sesion) redirect(`/login?volver=${encodeURIComponent(volver)}`);

  const r = await escribirApi(sesion.token, metodo, ruta, cuerpo);
  if (!r.ok && r.status === 401) {
    await borrarSesion();
    redirect(`/login?volver=${encodeURIComponent(volver)}`);
  }
  if (!r.ok) {
    const hayCampos = Boolean(r.campos && Object.keys(r.campos).length > 0);
    return { ok: false, mensaje: mensajeDeError(r.status, r.mensaje, hayCampos), campos: r.campos };
  }
  refresh();
  return { ok: true };
}

const INVALIDO: ResultadoAccion = { ok: false, mensaje: "Los datos no son válidos." };
const esObjeto = (c: unknown): c is Record<string, unknown> => typeof c === "object" && c !== null && !Array.isArray(c);

// ── Pokémon (FE.35) ──────────────────────────────────────────────────────────

/** id null → crear (POST); si no, editar (PUT). */
export async function guardarPokemon(id: number | null, cuerpo: unknown): Promise<ResultadoAccion> {
  if ((id !== null && !esId(id)) || !esObjeto(cuerpo)) return INVALIDO;
  return id === null
    ? ejecutar("POST", "/pokemons", cuerpo, "/admin/pokemon/nuevo")
    : ejecutar("PUT", `/pokemons/${id}`, cuerpo, `/admin/pokemon/${id}`);
}

export async function eliminarPokemon(id: number): Promise<ResultadoAccion> {
  if (!esId(id)) return INVALIDO;
  return ejecutar("DELETE", `/pokemons/${id}`, undefined, "/admin/pokemon");
}

// ── Movimientos (FE.36) ──────────────────────────────────────────────────────

export async function guardarMovimiento(id: number | null, cuerpo: unknown): Promise<ResultadoAccion> {
  if ((id !== null && !esId(id)) || !esObjeto(cuerpo)) return INVALIDO;
  return id === null
    ? ejecutar("POST", "/movimientos", cuerpo, "/admin/movimientos/nuevo")
    : ejecutar("PUT", `/movimientos/${id}`, cuerpo, `/admin/movimientos/${id}`);
}

export async function eliminarMovimiento(id: number): Promise<ResultadoAccion> {
  if (!esId(id)) return INVALIDO;
  return ejecutar("DELETE", `/movimientos/${id}`, undefined, "/admin/movimientos");
}
