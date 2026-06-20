import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Turbopack es el bundler por defecto en Next.js 16.
  // Fijamos la raíz del workspace al directorio del proyecto para evitar
  // que Turbopack detecte el Escritorio como raíz (por bun.lock externo +
  // pnpm-workspace.yaml), lo que causaba "Can't resolve 'tailwindcss'".
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;