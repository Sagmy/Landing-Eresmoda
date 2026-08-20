'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  busqueda: string;
  onBusqueda: (texto: string) => void;
};

/**
 * Buscador del encabezado.
 *
 * En escritorio va siempre a la vista, junto a los iconos. En el celular no
 * cabe —el nombre de la tienda más tres iconos ya llenan los 375px—, así que
 * ahí queda como lupa y despliega `FilaBuscador` bajo el encabezado.
 */
export function Buscador({ busqueda, onBusqueda }: Props) {
  return (
    <div className="hidden sm:block">
      <Campo busqueda={busqueda} onBusqueda={onBusqueda} className="w-64 lg:w-72" />
    </div>
  );
}

export function BotonBuscar({
  abierto,
  onAlternar,
}: {
  abierto: boolean;
  onAlternar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAlternar}
      aria-label={abierto ? 'Cerrar el buscador' : 'Buscar prendas'}
      aria-expanded={abierto}
      className="grid size-10 place-items-center rounded-full text-tinta-suave transition-colors hover:bg-arena hover:text-tinta sm:hidden"
    >
      {abierto ? <X className="size-5" /> : <Search className="size-5" />}
    </button>
  );
}

/**
 * La fila que se despliega en el celular. Se monta solo cuando está abierta,
 * así que puede quedarse con el cursor al aparecer: si hubiera que pulsar dos
 * veces para escribir, la lupa no serviría de nada.
 */
export function FilaBuscador({ busqueda, onBusqueda }: Props) {
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  return (
    <div className="border-b border-borde bg-lienzo px-4 py-2 sm:hidden">
      <Campo busqueda={busqueda} onBusqueda={onBusqueda} campoRef={campo} className="w-full" />
    </div>
  );
}

function Campo({
  busqueda,
  onBusqueda,
  className,
  campoRef,
}: {
  busqueda: string;
  onBusqueda: (texto: string) => void;
  className: string;
  campoRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tinta-tenue"
        aria-hidden="true"
      />
      <input
        {...(campoRef ? { ref: campoRef } : {})}
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder="Buscar prenda o color"
        aria-label="Buscar prendas"
        className="h-10 w-full rounded-full border border-borde bg-superficie pl-9 pr-9 text-sm text-tinta placeholder:text-tinta-tenue focus:border-borde-fuerte focus:outline-none"
      />
      {busqueda !== '' ? (
        <button
          type="button"
          onClick={() => onBusqueda('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-tinta-tenue hover:text-tinta"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
