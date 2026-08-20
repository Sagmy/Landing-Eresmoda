import type { NextConfig } from 'next';

/**
 * El host de Supabase donde vive el bucket público `prendas`. Se deriva de la
 * misma variable que usa el cliente para que no haya dos sitios que actualizar
 * si algún día cambia el proyecto.
 */
const hostSupabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://localhost').hostname;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Un error de tipos no debe poder llegar a producción disfrazado de build
  // exitoso. (En Next 16 el lint ya no corre dentro del build: va aparte.)
  typescript: { ignoreBuildErrors: false },

  images: {
    // Las fotos se sirven crudas desde el bucket y las optimiza Next: convierte
    // a WebP/AVIF, genera el srcset y respeta la proporción. Se descartó el
    // endpoint `render/image` de Supabase porque pasándole solo el ancho
    // deforma la foto (1106x1280 salía como 600x1280).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: hostSupabase,
        pathname: '/storage/v1/object/public/prendas/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // SAMEORIGIN y no DENY: es una página pública que sí puede querer
          // previsualizarse o embeberse desde el propio sitio.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
