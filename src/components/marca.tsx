import { cn } from '@/lib/utils';

/**
 * La marca: el vestido dorado en la percha, "ERES" en serif y "MODA" debajo.
 *
 * Es un lockup tipográfico inspirado en el logo, no el logo en sí. El archivo
 * que hay hoy es un montaje fotográfico sobre una pared —con sombras, textura y
 * perspectiva—, así que recortarlo se vería sucio, y en modo oscuro peor. Para
 * usar el original hace falta un PNG con fondo transparente o un SVG; el día
 * que exista, se sustituye este componente por una <Image> y ya.
 *
 * Dibujado en vez de puesto como imagen para que se adapte al tema claro y
 * oscuro, se vea nítido en cualquier pantalla y no cueste una descarga más.
 */

type Props = {
  /** `sm` para el encabezado, `lg` para el pie. */
  tamano?: 'sm' | 'lg';
  className?: string;
};

export function Marca({ tamano = 'sm', className }: Props) {
  const grande = tamano === 'lg';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* El vestido es más alto que las letras, como en el logo: el gancho
          asoma por encima y el bajo de la falda cae por debajo. */}
      <VestidoEnPercha className={cn('shrink-0 text-oro', grande ? 'h-16' : 'h-11')} />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-semibold tracking-tight text-tinta',
            grande ? 'text-3xl' : 'text-xl',
          )}
        >
          ERES
        </span>
        {/* Con "ERES" más pequeño y "MODA" más grande, las dos palabras casi
            igualan de ancho; se recorta el espaciado para que "MODA" siga
            quedando algo más estrecha, como en el logo. */}
        <span
          className={cn(
            'font-display self-end text-tinta-suave',
            grande ? 'text-xl tracking-[0.22em]' : 'text-[13px] tracking-[0.18em]',
          )}
        >
          MODA
        </span>
      </span>
    </span>
  );
}

/**
 * Vestido sin mangas —escote en V, cintura marcada y falda en A— colgado de una
 * percha de alambre.
 *
 * La percha va a trazo y no rellena: se lee como alambre y deja respirar la
 * silueta del vestido, que es lo que tiene que destacar a tamaño pequeño.
 */
function VestidoEnPercha({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 112" className={className} fill="none" aria-hidden="true">
      {/* Gancho */}
      <path
        d="M32 17v-5.4c0-3.4-2.5-6.1-5.6-6.1s-5.6 2.7-5.6 6.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Percha de alambre */}
      <path
        d="M32 17 14.6 27.6h34.8L32 17Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Vestido */}
      <path
        d="M23.5 28.6 32 38.6l8.5-10 2.5 14.2-4.2 14 13 42.4q-19.8 7-39.6 0l13-42.4-4.2-14 2.5-14.2Z"
        fill="currentColor"
      />

      {/* Cintura */}
      <path
        d="M25.6 57.2h12.8"
        stroke="var(--color-lienzo)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  );
}
