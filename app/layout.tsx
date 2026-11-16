import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Cabecera from "@/components/ui/Cabecera";
import Pie from "@/components/ui/Pie";
import ScriptEnLinea from "@/components/ui/ScriptEnLinea";
import "./globals.css";

const fuenteTitulo = Space_Grotesk({
  variable: "--fuente-titulo",
  subsets: ["latin"],
});

const fuenteTexto = Inter({
  variable: "--fuente-texto",
  subsets: ["latin"],
});

const fuenteDatos = JetBrains_Mono({
  variable: "--fuente-datos",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pokedex+",
    template: "%s · Pokedex+",
  },
  description:
    "Pokédex en español con los 1025 Pokémon: tipos, estadísticas, dónde y cómo se obtienen, evoluciones y movimientos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fuenteTitulo.variable} ${fuenteTexto.variable} ${fuenteDatos.variable} h-full antialiased`}
      // El script de abajo agrega data-js antes de hidratar
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Marca que hay JavaScript antes de pintar: permite animar sin parpadeo (globals.css) */}
        <ScriptEnLinea html="document.documentElement.setAttribute('data-js','')" />
        <Cabecera />
        <main
          id="contenido"
          className="mx-auto w-full max-w-[75rem] flex-1 px-4 py-6 sm:px-6 sm:py-8"
        >
          {children}
        </main>
        <Pie />
      </body>
    </html>
  );
}
