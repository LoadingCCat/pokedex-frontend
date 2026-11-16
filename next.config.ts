import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sprites de los Pokémon (imagenUrl de la API)
    remotePatterns: [new URL("https://raw.githubusercontent.com/PokeAPI/sprites/**")],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
