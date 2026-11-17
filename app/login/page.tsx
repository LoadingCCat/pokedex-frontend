import type { Metadata } from "next";
import { Suspense } from "react";
import AvisoSinApi from "@/components/admin/AvisoSinApi";
import FormularioLogin from "@/components/admin/FormularioLogin";
import Esqueleto from "@/components/ui/Esqueleto";
import { adminDisponible, destinoSeguro } from "@/lib/sesion-comun";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

/** P7 · Iniciar sesión (docs/pantallas.md). Sin API (sitio con mock), solo el aviso. */
export default function Login({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex flex-col items-center gap-6">
      <header className="flex w-full max-w-sm flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Iniciar sesión</h1>
        <p className="text-texto-secundario">Entra con tu usuario de administración para gestionar los datos.</p>
      </header>
      {adminDisponible() ? (
        <Suspense fallback={<Esqueleto className="h-64 w-full max-w-sm rounded-lg" />}>
          <ContenidoLogin searchParams={searchParams} />
        </Suspense>
      ) : (
        <div className="w-full max-w-xl">
          <AvisoSinApi />
        </div>
      )}
    </div>
  );
}

async function ContenidoLogin({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { volver } = await searchParams;
  return <FormularioLogin volver={destinoSeguro(Array.isArray(volver) ? volver[0] : volver)} />;
}
