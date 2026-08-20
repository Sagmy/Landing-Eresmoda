'use client';

import { ShoppingCart } from 'lucide-react';
import { TIENDA } from '@/lib/tienda';
import { enlaceConsulta } from '@/lib/whatsapp';
import { BotonBuscar, Buscador, FilaBuscador } from '@/components/buscador';
import { Marca } from '@/components/marca';
import { IconoInstagram, IconoWhatsApp } from '@/components/iconos';

type Props = {
  piezas: number;
  onAbrirCarrito: () => void;
  busqueda: string;
  onBusqueda: (texto: string) => void;
  buscadorAbierto: boolean;
  onAlternarBuscador: () => void;
};

export function Encabezado({
  piezas,
  onAbrirCarrito,
  busqueda,
  onBusqueda,
  buscadorAbierto,
  onAlternarBuscador,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-lienzo/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <a href="#" aria-label={`${TIENDA.nombre}, ir al inicio`} className="shrink-0">
          <Marca />
        </a>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <Buscador busqueda={busqueda} onBusqueda={onBusqueda} />

          <BotonBuscar abierto={buscadorAbierto} onAlternar={onAlternarBuscador} />

          <a
            href={TIENDA.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram de ${TIENDA.nombre}`}
            className="grid size-10 place-items-center rounded-full text-tinta-suave transition-colors hover:bg-arena hover:text-tinta"
          >
            <IconoInstagram className="size-5" />
          </a>

          {/* WhatsApp arriba y no solo flotando abajo: quien entra a preguntar
              en vez de a comprar tiene que ver por dónde escribir de entrada. */}
          <a
            href={enlaceConsulta()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribirnos por WhatsApp"
            className="grid size-10 place-items-center rounded-full text-whatsapp transition-colors hover:bg-arena"
          >
            <IconoWhatsApp className="size-5" />
          </a>

          <button
            type="button"
            onClick={onAbrirCarrito}
            className="relative grid size-10 place-items-center rounded-full text-tinta-suave transition-colors hover:bg-arena hover:text-tinta"
            aria-label={
              piezas === 0
                ? 'Tu carrito, vacío'
                : `Tu carrito, ${piezas} ${piezas === 1 ? 'prenda' : 'prendas'}`
            }
          >
            <ShoppingCart className="size-5" />

            {piezas > 0 ? (
              <span className="tabular absolute right-0 top-0.5 grid min-w-4.5 place-items-center rounded-full bg-tinta px-1 text-[10px] leading-4 font-medium text-marca-contra">
                {piezas}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {buscadorAbierto ? <FilaBuscador busqueda={busqueda} onBusqueda={onBusqueda} /> : null}
    </header>
  );
}
