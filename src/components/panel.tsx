'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  /** Barra fija abajo: el total y el botón de pedido viven ahí. */
  pie?: React.ReactNode;
  /**
   * Si es falso, el título nombra el diálogo para el lector de pantalla pero no
   * se pinta. Lo usa la ficha de la prenda, que ya enseña el nombre en grande
   * bajo la foto: repetirlo arriba en pequeño es decir dos veces lo mismo.
   */
  tituloVisible?: boolean;
};

/**
 * Capa flotante: hoja que sube desde abajo en el celular, panel lateral en
 * escritorio. La usan tanto la ficha de la prenda como el carrito.
 *
 * Sube desde abajo en móvil porque es donde llega el pulgar; un diálogo
 * centrado obligaría a estirar la mano hasta el centro de la pantalla.
 */
export function Panel({ abierto, onCerrar, titulo, children, pie, tituloVisible = true }: Props) {
  const cajaRef = useRef<HTMLDivElement>(null);

  /**
   * El `onCerrar` más reciente, guardado en una ref.
   *
   * Los efectos de abajo dependen SOLO de `abierto`. Antes dependían también de
   * `onCerrar`, que el padre recrea en cada render, así que al escribir una
   * letra en el formulario el efecto se rehacía y `focus()` devolvía el foco al
   * panel: había que volver a pulsar el campo por cada letra. De paso, ese salto
   * disparaba el `onBlur` y los errores de validación saltaban al primer
   * carácter.
   */
  const cerrarRef = useRef(onCerrar);

  useEffect(() => {
    cerrarRef.current = onCerrar;
  });

  // Al abrir: el foco entra al panel —para que el teclado y el lector de
  // pantalla no se queden atrás, en el catálogo— y el fondo deja de
  // desplazarse. Sin lo segundo, al arrastrar dentro del panel se mueve la
  // página de detrás y al cerrar uno aparece en otro punto del catálogo.
  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cajaRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarRef.current();
    };

    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-tinta/40 backdrop-blur-[2px]"
      />

      <div
        ref={cajaRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="panel-entra relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-superficie shadow-2xl outline-none sm:max-h-none sm:w-[26rem] sm:rounded-none"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-borde px-4 py-3">
          {tituloVisible ? (
            <h2 className="font-display text-lg text-tinta">{titulo}</h2>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-1 grid size-9 place-items-center rounded-full text-tinta-suave hover:bg-arena hover:text-tinta"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>

        {pie ? <div className="shrink-0 border-t border-borde bg-superficie p-4">{pie}</div> : null}
      </div>
    </div>
  );
}
