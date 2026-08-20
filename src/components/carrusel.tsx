'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { TIENDA } from '@/lib/tienda';
import { cn } from '@/lib/utils';
import type { Prenda } from '@/types/catalogo';

/** Cada cuánto avanza solo. */
const INTERVALO = 3500;

type Props = {
  /** Ya mezcladas y solo disponibles: la portada no debe enseñar lo agotado. */
  prendas: Prenda[];
  onAbrir: (prenda: Prenda) => void;
};

/**
 * Portada: una tira de fotos que va pasando sola.
 *
 * Se mueve con `scrollBy` sobre un contenedor con scroll-snap en vez de con un
 * `transform` calculado a mano. Sale mucho menos código y, sobre todo, el
 * deslizamiento con el dedo y el scroll con el teclado los hace el navegador,
 * que siempre lo hará mejor.
 *
 * Cada foto es un botón: la portada no es decoración, lleva a la prenda.
 */
export function Carrusel({ prendas, onAbrir }: Props) {
  const pista = useRef<HTMLDivElement>(null);
  const [enPausa, setEnPausa] = useState(false);
  const [detenido, setDetenido] = useState(false);

  const avanzar = useCallback((direccion: 1 | -1) => {
    const caja = pista.current;
    if (caja === null) return;

    const primera = caja.firstElementChild as HTMLElement | null;
    const paso = primera?.offsetWidth ?? caja.clientWidth;

    // Al llegar al final vuelve al principio, para que la vuelta no se acabe.
    const finDeCarrera = caja.scrollWidth - caja.clientWidth - 4;
    const destino =
      direccion === 1
        ? caja.scrollLeft >= finDeCarrera
          ? 0
          : caja.scrollLeft + paso
        : caja.scrollLeft <= 4
          ? finDeCarrera
          : caja.scrollLeft - paso;

    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    caja.scrollTo({ left: destino, behavior: sinMovimiento ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    // Quien pidió menos movimiento no recibe una portada que se mueve sola.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (detenido || enPausa || prendas.length < 2) return;

    const reloj = window.setInterval(() => avanzar(1), INTERVALO);
    return () => window.clearInterval(reloj);
  }, [avanzar, detenido, enPausa, prendas.length]);

  // Con la pestaña de fondo no tiene sentido seguir pasando fotos.
  useEffect(() => {
    const alCambiar = () => setEnPausa(document.hidden);
    document.addEventListener('visibilitychange', alCambiar);
    return () => document.removeEventListener('visibilitychange', alCambiar);
  }, []);

  if (prendas.length === 0) return null;

  return (
    <section
      aria-label="Prendas destacadas"
      aria-roledescription="carrusel"
      className="relative"
      onMouseEnter={() => setEnPausa(true)}
      onMouseLeave={() => setEnPausa(false)}
      onFocusCapture={() => setEnPausa(true)}
      onBlurCapture={() => setEnPausa(false)}
    >
      <div
        ref={pista}
        className="sin-barra flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {prendas.map((prenda, i) => (
          <button
            key={prenda.id}
            type="button"
            onClick={() => onAbrir(prenda)}
            aria-label={`Ver ${prenda.nombre}`}
            className="relative h-[58vh] max-h-[34rem] min-h-72 w-1/2 shrink-0 snap-start overflow-hidden bg-arena sm:w-1/3 lg:w-1/4"
          >
            <Image
              src={prenda.imagenes[0] ?? ''}
              alt={prenda.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              // Solo las primeras cuatro entran sin esperar: son las que se ven.
              priority={i < 4}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* El velo y el texto no interceptan el dedo: por debajo siguen estando
          los botones de cada foto. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-auto h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8">
        <p className="font-display text-4xl leading-none text-white drop-shadow-sm sm:text-6xl">
          Sí, se nota.
        </p>
        <p className="mt-3 max-w-sm text-base leading-snug text-white/90 sm:max-w-md sm:text-lg">
          Te arreglas diferente cuando te sientes segura.
        </p>
      </div>

      <Control
        lado="izquierda"
        onClick={() => avanzar(-1)}
        etiqueta={`Foto anterior de ${TIENDA.nombre}`}
      >
        <ChevronLeft className="size-5" />
      </Control>

      <Control lado="derecha" onClick={() => avanzar(1)} etiqueta="Foto siguiente">
        <ChevronRight className="size-5" />
      </Control>

      <button
        type="button"
        onClick={() => setDetenido((d) => !d)}
        aria-label={detenido ? 'Reanudar el carrusel' : 'Detener el carrusel'}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
      >
        {detenido ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </section>
  );
}

function Control({
  lado,
  onClick,
  etiqueta,
  children,
}: {
  lado: 'izquierda' | 'derecha';
  onClick: () => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className={cn(
        /* Colores fijos, no fichas del tema: estos botones flotan SOBRE las
           fotos, no sobre el fondo de la página. Con `text-tinta` la flecha se
           volvía casi blanca en modo oscuro y quedaba blanco sobre blanco. */
        'absolute top-1/2 hidden -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/65 sm:grid sm:size-10',
        lado === 'izquierda' ? 'left-3' : 'right-3',
      )}
    >
      {children}
    </button>
  );
}
