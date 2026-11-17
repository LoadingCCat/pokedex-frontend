"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { clasesBoton } from "@/components/ui/Boton";
import Campo, { AvisoFormulario } from "@/components/ui/Campo";

type Errores = { usuario?: string; contrasena?: string; general?: string };

/**
 * P7 · Formulario de inicio de sesión. Valida los vacíos antes de enviar y manda los datos al
 * route handler /api/sesion, que guarda el token en una cookie httpOnly. Al entrar, va a `volver`.
 */
export default function FormularioLogin({ volver }: { volver: string }) {
  const router = useRouter();
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, iniciarTransicion] = useTransition();
  const [esperando, setEsperando] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const usuario = String(datos.get("usuario") ?? "").trim();
    const contrasena = String(datos.get("contrasena") ?? "");

    const nuevos: Errores = {};
    if (!usuario) nuevos.usuario = "Escribe tu usuario.";
    if (!contrasena) nuevos.contrasena = "Escribe tu contraseña.";
    setErrores(nuevos);
    if (nuevos.usuario || nuevos.contrasena) {
      formulario.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus();
      return;
    }

    setEsperando(true);
    try {
      const respuesta = await fetch("/api/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });
      if (respuesta.ok) {
        iniciarTransicion(() => {
          router.replace(volver);
          router.refresh();
        });
        return;
      }
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { mensaje?: string; campos?: Errores };
      setErrores({ ...cuerpo.campos, general: cuerpo.mensaje ?? "No se pudo iniciar sesión. Vuelve a intentarlo." });
    } catch {
      setErrores({ general: "No se pudo iniciar sesión. Revisa tu conexión y vuelve a intentarlo." });
    } finally {
      setEsperando(false);
    }
  }

  const ocupado = esperando || enviando;
  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={alEnviar}
      aria-busy={ocupado}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-borde-suave bg-superficie p-4 sm:p-6"
    >
      <AvisoFormulario mensaje={errores.general} />
      <Campo
        id="login-usuario"
        name="usuario"
        etiqueta="Usuario"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        error={errores.usuario}
      />
      <Campo
        id="login-contrasena"
        name="contrasena"
        type="password"
        etiqueta="Contraseña"
        autoComplete="current-password"
        error={errores.contrasena}
      />
      <button type="submit" disabled={ocupado} className={clasesBoton("principal", "w-full")}>
        {ocupado ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
