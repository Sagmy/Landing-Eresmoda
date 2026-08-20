'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { esGenerico } from '@/lib/prendas';
import { cn } from '@/lib/utils';
import type { Prenda } from '@/types/catalogo';
import { FotoPrenda } from '@/components/foto-prenda';
import { Panel } from '@/components/panel';

type Props = {
  prenda: Prenda;
  onCerrar: () => void;
  onAgregar: (prenda: Prenda, talla: string, cantidad: number) => void;
};

/**
 * Ficha de la prenda: se elige talla y cantidad, y se agrega al carrito.
 *
 * El componente se monta con `key={prenda.id}` desde la tienda, así que cada
 * prenda abre con su propio estado limpio sin necesidad de reiniciarlo a mano.
 */
export function HojaPrenda({ prenda, onCerrar, onAgregar }: Props) {
  // Una sola talla no es una elección: se da por elegida y el selector se
  // esconde. Es el caso de casi todo el catálogo hoy.
  const tallaUnica = prenda.tallas.length === 1 ? prenda.tallas[0] ?? null : null;

  const [talla, setTalla] = useState<string | null>(tallaUnica);
  const [cantidad, setCantidad] = useState(1);
  const [portada, setPortada] = useState(0);

  const foto = prenda.imagenes[portada] ?? prenda.imagenes[0] ?? null;
  const hayQueElegir = prenda.tallas.length > 1;
  // Una talla "Única" es un marcador de la base, no algo que mostrar al cliente.
  const tallasVisibles = hayQueElegir && !prenda.tallas.every(esGenerico);

  return (
    <Panel
      abierto
      onCerrar={onCerrar}
      titulo={prenda.nombre}
      tituloVisible={false}
      pie={
        <button
          type="button"
          disabled={talla === null}
          onClick={() => {
            if (talla !== null) onAgregar(prenda, talla, cantidad);
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tinta text-sm font-medium text-marca-contra transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-borde-fuerte disabled:text-tinta-tenue"
        >
          {talla === null ? (
            'Elige una talla'
          ) : (
            <>
              <Check className="size-4" aria-hidden="true" />
              Agregar · {formatMoney(prenda.precioCents * cantidad)}
            </>
          )}
        </button>
      }
    >
      <div className="space-y-5">
        <FotoPrenda
          src={foto}
          alt={prenda.nombre}
          sizes="(max-width: 640px) 100vw, 26rem"
          className="rounded-caja"
          prioridad
        />

        {prenda.imagenes.length > 1 ? (
          <div className="flex gap-2">
            {prenda.imagenes.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPortada(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={i === portada}
                className={cn(
                  'w-16 overflow-hidden rounded-md border-2 transition-colors',
                  i === portada ? 'border-tinta' : 'border-transparent opacity-60',
                )}
              >
                <FotoPrenda src={src} alt="" sizes="4rem" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-1">
          <h3 className="font-display text-xl leading-tight text-tinta">{prenda.nombre}</h3>
          <p className="text-sm text-tinta-suave">
            {[prenda.marca, prenda.colorEtiqueta, prenda.categoria].filter(Boolean).join(' · ')}
          </p>
          <p className="tabular pt-1 text-lg text-tinta">{formatMoney(prenda.precioCents)}</p>
        </div>

        {tallasVisibles ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-tinta">Talla</legend>
            <div className="flex flex-wrap gap-2">
              {prenda.tallas.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTalla(t)}
                  aria-pressed={talla === t}
                  className={cn(
                    'min-w-12 rounded-full border px-3.5 py-2 text-sm transition-colors',
                    talla === t
                      ? 'border-tinta bg-tinta text-marca-contra'
                      : 'border-borde text-tinta-suave hover:border-borde-fuerte hover:text-tinta',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-tinta">Cantidad</span>

          <div className="flex items-center gap-1 rounded-full border border-borde p-1">
            <Paso
              etiqueta="Quitar una"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              deshabilitado={cantidad <= 1}
            >
              <Minus className="size-4" />
            </Paso>

            <span className="tabular w-8 text-center text-sm text-tinta">{cantidad}</span>

            <Paso etiqueta="Agregar una" onClick={() => setCantidad((c) => Math.min(99, c + 1))}>
              <Plus className="size-4" />
            </Paso>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-tinta-tenue">
          La disponibilidad se confirma con tu asesora al cerrar el pedido.
        </p>
      </div>
    </Panel>
  );
}

function Paso({
  etiqueta,
  onClick,
  deshabilitado = false,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  deshabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiqueta}
      className="grid size-9 place-items-center rounded-full text-tinta transition-colors hover:bg-arena disabled:text-tinta-tenue disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
