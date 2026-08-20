'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { categoriasDe, filtrar } from '@/lib/prendas';
import { formatMoney } from '@/lib/money';
import { enlaceConsulta, totalCents, totalPiezas } from '@/lib/whatsapp';
import type { CampoEnvio } from '@/lib/envio';
import type { Prenda } from '@/types/catalogo';
import { claveLinea, ENVIO_VACIO, type DatosEnvio, type LineaCarrito } from '@/types/carrito';
import { BarraCategorias } from '@/components/barra-categorias';
import { Carrito } from '@/components/carrito';
import { Carrusel } from '@/components/carrusel';
import { Encabezado } from '@/components/encabezado';
import { HojaPrenda } from '@/components/hoja-prenda';
import { IconoWhatsApp } from '@/components/iconos';
import { Pie } from '@/components/pie';
import { TarjetaPrenda } from '@/components/tarjeta-prenda';
import { usePersistente } from '@/components/use-persistente';

/** Las cuatro primeras fotos se cargan sin esperar al scroll. */
const FOTOS_PRIORITARIAS = 4;

/** Constante de módulo, no un `[]` en la llamada: `usePersistente` necesita que
 *  el valor inicial sea el mismo objeto en cada render. */
const CARRITO_VACIO: LineaCarrito[] = [];

type Props = {
  prendas: Prenda[];
  /** Mezcladas en el servidor para la portada. */
  destacadas: Prenda[];
  error: string | null;
};

export function Tienda({ prendas, destacadas, error }: Props) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [prendaAbierta, setPrendaAbierta] = useState<Prenda | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<CampoEnvio, boolean>>>({});

  const [lineas, setLineas] = usePersistente<LineaCarrito[]>('eresmoda:carrito', CARRITO_VACIO);
  const [envio, setEnvio] = usePersistente<DatosEnvio>('eresmoda:envio', ENVIO_VACIO);

  const categorias = useMemo(() => categoriasDe(prendas), [prendas]);
  const visibles = useMemo(
    () => filtrar(prendas, categoria, busqueda),
    [prendas, categoria, busqueda],
  );

  const piezas = totalPiezas(lineas);

  // Con un filtro puesto, la portada estorba: lo que se busca es el resultado.
  const filtrando = categoria !== null || busqueda.trim() !== '';

  function agregar(prenda: Prenda, talla: string, cantidad: number) {
    const clave = claveLinea(prenda.id, talla);

    setLineas((previas) => {
      const existente = previas.find((l) => claveLinea(l.prendaId, l.talla) === clave);

      // Si ya estaba, se suma la cantidad en vez de crear una línea repetida.
      if (existente) {
        return previas.map((l) =>
          claveLinea(l.prendaId, l.talla) === clave
            ? { ...l, cantidad: Math.min(99, l.cantidad + cantidad) }
            : l,
        );
      }

      return [
        ...previas,
        {
          prendaId: prenda.id,
          productId: prenda.productId,
          nombre: prenda.nombre,
          marca: prenda.marca,
          color: prenda.color,
          talla,
          cantidad,
          precioCents: prenda.precioCents,
          imagen: prenda.imagenes[0] ?? null,
        },
      ];
    });

    setPrendaAbierta(null);
    setCarritoAbierto(true);
  }

  function cambiarCantidad(clave: string, cantidad: number) {
    if (cantidad < 1) return;
    setLineas((previas) =>
      previas.map((l) =>
        claveLinea(l.prendaId, l.talla) === clave ? { ...l, cantidad: Math.min(99, cantidad) } : l,
      ),
    );
  }

  function quitar(clave: string) {
    setLineas((previas) => previas.filter((l) => claveLinea(l.prendaId, l.talla) !== clave));
  }

  return (
    <>
      <Encabezado
        piezas={piezas}
        onAbrirCarrito={() => setCarritoAbierto(true)}
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        buscadorAbierto={buscadorAbierto}
        onAlternarBuscador={() => setBuscadorAbierto((a) => !a)}
      />

      <BarraCategorias
        categorias={categorias}
        categoria={categoria}
        onCategoria={setCategoria}
      />

      <main className="pb-28">
        {!filtrando ? <Carrusel prendas={destacadas} onAbrir={setPrendaAbierta} /> : null}

        <div className="mx-auto max-w-6xl px-4">
          {error !== null ? (
            <p className="mt-8 rounded-caja border border-borde bg-arena p-4 text-sm text-tinta-suave">
              No pudimos cargar el catálogo en este momento. Escríbenos por WhatsApp y te
              atendemos igual.
            </p>
          ) : visibles.length === 0 ? (
            <p className="mt-16 text-center text-sm text-tinta-suave">
              No encontramos prendas con esa búsqueda.
            </p>
          ) : (
            <>
              <h2 className="mt-8 text-xs uppercase tracking-[0.2em] text-tinta-tenue">
                {categoria ?? 'Todo el catálogo'}
                <span className="ml-2 normal-case tracking-normal">
                  ({visibles.length} {visibles.length === 1 ? 'prenda' : 'prendas'})
                </span>
              </h2>

              <section
                aria-label="Catálogo"
                className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
              >
                {visibles.map((prenda, i) => (
                  <TarjetaPrenda
                    key={prenda.id}
                    prenda={prenda}
                    prioridad={!filtrando ? false : i < FOTOS_PRIORITARIAS}
                    onAbrir={setPrendaAbierta}
                  />
                ))}
              </section>
            </>
          )}
        </div>

        <Pie />
      </main>

      {/* Con el carrito vacío, el flotante invita a preguntar; con prendas
          dentro, cede el sitio a la barra que lleva al pedido. */}
      {piezas === 0 ? (
        <a
          href={enlaceConsulta()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp"
          className="fixed bottom-5 right-4 z-30 grid size-13 place-items-center rounded-full bg-whatsapp text-white shadow-lg transition-opacity hover:opacity-90"
        >
          <IconoWhatsApp className="size-6" />
        </a>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-lienzo/95 p-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="mx-auto flex h-12 w-full max-w-md items-center justify-between gap-3 rounded-full bg-tinta px-5 text-sm font-medium text-marca-contra transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-4" aria-hidden="true" />
              Ver mi carrito ({piezas})
            </span>
            <span className="tabular">{formatMoney(totalCents(lineas))}</span>
          </button>
        </div>
      )}

      {prendaAbierta !== null ? (
        <HojaPrenda
          key={prendaAbierta.id}
          prenda={prendaAbierta}
          onCerrar={() => setPrendaAbierta(null)}
          onAgregar={agregar}
        />
      ) : null}

      <Carrito
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        lineas={lineas}
        onCantidad={cambiarCantidad}
        onQuitar={quitar}
        onVaciar={() => setLineas([])}
        envio={envio}
        onEnvio={setEnvio}
        tocados={tocados}
        onTocar={(campo) => setTocados((t) => ({ ...t, [campo]: true }))}
        onTocarTodo={() =>
          setTocados({ nombre: true, telefono: true, ciudad: true, direccion: true })
        }
      />
    </>
  );
}
