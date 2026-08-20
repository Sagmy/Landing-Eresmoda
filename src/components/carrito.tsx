'use client';

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { capitalizar, esGenerico } from '@/lib/prendas';
import { enlacePedido, subtotalCents, totalCents } from '@/lib/whatsapp';
import { validarEnvio, type CampoEnvio, type ErroresEnvio } from '@/lib/envio';
import type { DatosEnvio, LineaCarrito } from '@/types/carrito';
import { claveLinea } from '@/types/carrito';
import { FotoPrenda } from '@/components/foto-prenda';
import { FormularioEnvio } from '@/components/formulario-envio';
import { Panel } from '@/components/panel';
import { IconoWhatsApp } from '@/components/iconos';

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  lineas: LineaCarrito[];
  onCantidad: (clave: string, cantidad: number) => void;
  onQuitar: (clave: string) => void;
  onVaciar: () => void;
  envio: DatosEnvio;
  onEnvio: (envio: DatosEnvio) => void;
  tocados: Partial<Record<CampoEnvio, boolean>>;
  onTocar: (campo: CampoEnvio) => void;
  onTocarTodo: () => void;
};

/**
 * El carrito: el resumen que se revisa antes de mandar el pedido.
 *
 * Va desglosado a propósito, no solo el total. Lo que la clienta ve aquí es
 * exactamente lo que se redacta en el mensaje de WhatsApp; que las dos cosas
 * coincidan al detalle es lo que evita el "yo pedí otra talla".
 */
export function Carrito({
  abierto,
  onCerrar,
  lineas,
  onCantidad,
  onQuitar,
  onVaciar,
  envio,
  onEnvio,
  tocados,
  onTocar,
  onTocarTodo,
}: Props) {
  const errores: ErroresEnvio = validarEnvio(envio);
  const datosListos = Object.keys(errores).length === 0;
  const hayPrendas = lineas.length > 0;
  const puedePedir = hayPrendas && datosListos;

  return (
    <Panel
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Tu carrito"
      pie={
        hayPrendas ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-tinta-suave">Total</span>
              <span className="tabular font-display text-xl text-tinta">
                {formatMoney(totalCents(lineas))}
              </span>
            </div>

            <p className="-mt-1 text-xs text-tinta-tenue">+ envío a convenir con tu asesora</p>

            {puedePedir ? (
              /* Un enlace de verdad, no un window.open dentro de un handler:
                 Safari en iOS bloquea la apertura si ocurre de forma asíncrona. */
              <a
                href={enlacePedido(lineas, envio)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <IconoWhatsApp className="size-5" />
                Enviar pedido por WhatsApp
              </a>
            ) : (
              <button
                type="button"
                onClick={onTocarTodo}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-borde-fuerte text-sm font-medium text-tinta-suave"
              >
                Completa tus datos de entrega
              </button>
            )}
          </div>
        ) : null
      }
    >
      {!hayPrendas ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ShoppingCart className="size-8 text-tinta-tenue" aria-hidden="true" />
          <p className="text-sm text-tinta-suave">Tu carrito está vacío.</p>
          <button
            type="button"
            onClick={onCerrar}
            className="text-sm text-tinta underline underline-offset-4"
          >
            Ver el catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-borde">
            {lineas.map((linea) => (
              <Linea
                key={claveLinea(linea.prendaId, linea.talla)}
                linea={linea}
                onCantidad={onCantidad}
                onQuitar={onQuitar}
              />
            ))}
          </ul>

          <button
            type="button"
            onClick={onVaciar}
            className="text-xs text-tinta-tenue underline underline-offset-4 hover:text-tinta"
          >
            Vaciar el carrito
          </button>

          <FormularioEnvio
            envio={envio}
            onCambio={onEnvio}
            errores={errores}
            tocados={tocados}
            onTocar={onTocar}
          />
        </div>
      )}
    </Panel>
  );
}

function Linea({
  linea,
  onCantidad,
  onQuitar,
}: {
  linea: LineaCarrito;
  onCantidad: (clave: string, cantidad: number) => void;
  onQuitar: (clave: string) => void;
}) {
  const clave = claveLinea(linea.prendaId, linea.talla);

  // Ni el color ni la talla se imprimen cuando son los marcadores genéricos de
  // la base ("Único", "Única"): no son atributos de la prenda.
  const detalle = [
    esGenerico(linea.color) ? null : capitalizar(linea.color),
    esGenerico(linea.talla) ? null : `Talla ${linea.talla}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex gap-3 py-3 first:pt-0">
      <FotoPrenda
        src={linea.imagen}
        alt=""
        sizes="4rem"
        className="w-16 shrink-0 rounded-md"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-tinta">{linea.nombre}</p>
            {detalle !== '' ? <p className="text-xs text-tinta-tenue">{detalle}</p> : null}
          </div>

          <button
            type="button"
            onClick={() => onQuitar(clave)}
            aria-label={`Quitar ${linea.nombre}`}
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-tinta-tenue hover:bg-arena hover:text-tinta"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5 rounded-full border border-borde">
            <button
              type="button"
              onClick={() => onCantidad(clave, linea.cantidad - 1)}
              disabled={linea.cantidad <= 1}
              aria-label="Quitar una"
              className="grid size-8 place-items-center rounded-full text-tinta hover:bg-arena disabled:text-tinta-tenue disabled:hover:bg-transparent"
            >
              <Minus className="size-3.5" />
            </button>

            <span className="tabular w-6 text-center text-sm text-tinta">{linea.cantidad}</span>

            <button
              type="button"
              onClick={() => onCantidad(clave, linea.cantidad + 1)}
              aria-label="Agregar una"
              className="grid size-8 place-items-center rounded-full text-tinta hover:bg-arena"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="text-right">
            {/* El precio unitario solo se repite cuando hay más de una: con
                cantidad 1 sería la misma cifra dos veces. */}
            {linea.cantidad > 1 ? (
              <p className="tabular text-[11px] text-tinta-tenue">
                {formatMoney(linea.precioCents)} c/u
              </p>
            ) : null}
            <p className="tabular text-sm text-tinta">{formatMoney(subtotalCents(linea))}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
