import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { TIENDA } from '@/lib/tienda';
import './globals.css';

/* Dos fuentes y no más: una serif con carácter para el nombre y los titulares,
   y una sans neutra para todo lo demás. `display: swap` para que el texto se
   lea desde el primer instante aunque la fuente tarde. */
const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-sans',
});

const display = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-display',
});

/**
 * La URL pública del sitio. Hace falta para que las miniaturas de Open Graph
 * salgan con ruta absoluta; sin esto, al compartir el enlace por WhatsApp no
 * aparecería la vista previa. En Vercel se rellena sola.
 */
const urlSitio =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3200');

const descripcion =
  'Ropa para mujer: pantalones, blusas, faldas, shorts, monos, conjuntos y accesorios. ' +
  'Arma tu pedido y termínalo por WhatsApp con tu asesora.';

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: {
    default: `${TIENDA.nombre} · Tienda de ropa`,
    template: `%s · ${TIENDA.nombre}`,
  },
  description: descripcion,
  applicationName: TIENDA.nombre,
  openGraph: {
    type: 'website',
    locale: 'es_VE',
    siteName: TIENDA.nombre,
    title: `${TIENDA.nombre} · Tienda de ropa`,
    description: descripcion,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TIENDA.nombre} · Tienda de ropa`,
    description: descripcion,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111010' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Sin `maximumScale`: bloquear el zoom deja fuera a quien necesita ampliar
  // para leer, y no arregla nada que no arregle ya el `font-size: 16px`.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
