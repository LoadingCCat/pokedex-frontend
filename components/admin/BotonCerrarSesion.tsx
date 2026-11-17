"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Boton from "@/components/ui/Boton";

/** Cierra la sesión (DELETE /api/sesion borra la cookie) y vuelve al login. */
export default function BotonCerrarSesion() {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);

  async function cerrar() {
    setCerrando(true);
    try {
      await fetch("/api/sesion", { method: "DELETE" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Boton onClick={cerrar} disabled={cerrando} className="min-h-9 px-3 sm:min-h-9">
      {cerrando ? "Cerrando…" : "Cerrar sesión"}
    </Boton>
  );
}
