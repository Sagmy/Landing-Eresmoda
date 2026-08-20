'use client';

import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Prenda } from '@/types/catalogo';
import { FotoPrenda } from '@/components/foto-prenda';

const ANCHOS = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

type Props = {
  prenda: Prenda;
  prioridad: boolean;
  onAbrir: (prenda: Prenda) => void;
};

/**
 * Una tarjeta = una prenda en un color. El short blanco y el rosado son dos
 * tarjetas del mismo producto, que es como se enseña la ropa.
 *
 * La agotada se pinta entera, con su foto y su precio, solo que apagada y sin
 * botón: la vista sigue entregando foto y precio aunque `sizes_available` venga
 * vacío, así que no hay razón para dejar un hueco.
 */
export function TarjetaPrenda({ prenda, prioridad, onAbrir }: Props) {
  const agotada = !prenda.disponible;
  const portada = prenda.imagenes[0] ?? null;

  // Ni la marca ni el color se imprimen si no aportan: "Color: Único" es un
  // marcador interno de la base, no un dato de la prenda. La misma línea sirve
  // para lo que se ve y para lo que anuncia el lector de pantalla.
  const detalle = [prenda.marca, prenda.colorEtiqueta].filter(Boolean).join(' · ');

  const contenido = (
    <>
      <div className="relative">
        <FotoPrenda
          src={portada}
          alt={prenda.nombre}
          prioridad={prioridad}
          sizes={ANCHOS}
          className={cn('rounded-caja', agotada && 'opacity-45 grayscale')}
        />

        {agotada ? (
          <span className="absolute left-2 top-2 rounded-full bg-tinta/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-marca-contra">
            Agotado
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 space-y-0.5">
        <h3 className="text-sm leading-snug font-medium text-tinta">{prenda.nombre}</h3>

        <p className="text-xs text-tinta-tenue">{detalle === '' ? ' ' : detalle}</p>

        <p className={cn('tabular pt-0.5 text-sm', agotada ? 'text-tinta-tenue' : 'text-tinta')}>
          {formatMoney(prenda.precioCents)}
        </p>
      </div>
    </>
  );

  if (agotada) {
    return (
      <article aria-label={`${prenda.nombre}, agotado`} className="text-left">
        {contenido}
      </article>
    );
  }

  const nombreAccesible = [
    prenda.nombre,
    detalle,
    `${formatMoney(prenda.precioCents)}. Ver tallas y agregar`,
  ]
    .filter((parte) => parte !== '')
    .join(', ');

  return (
    <article>
      <button
        type="button"
        onClick={() => onAbrir(prenda)}
        /* Sin esto el botón queda sin nombre en el árbol de accesibilidad: el
           texto vive dentro de un h3 y un p anidados, y no siempre se compone
           solo. */
        aria-label={nombreAccesible}
        className="w-full cursor-pointer text-left transition-opacity hover:opacity-80"
      >
        {contenido}
      </button>
    </article>
  );
}
