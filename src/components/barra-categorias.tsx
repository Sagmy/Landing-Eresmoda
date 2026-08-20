'use client';

import { cn } from '@/lib/utils';

type Props = {
  categorias: readonly string[];
  categoria: string | null;
  onCategoria: (categoria: string | null) => void;
};

/**
 * Las categorías, como barra de navegación bajo el encabezado.
 *
 * Llegan derivadas de los datos, no escritas aquí: se crean y renombran desde
 * Ajustes del inventario, así que codificarlas obligaría a desplegar la landing
 * cada vez que se añade una.
 *
 * Va pegada arriba junto al encabezado para que se pueda cambiar de categoría
 * sin volver al principio de la página; con once categorías y un catálogo que
 * crece, subir a buscarlas cada vez sería una lata.
 */
export function BarraCategorias({ categorias, categoria, onCategoria }: Props) {
  return (
    <nav
      aria-label="Categorías"
      className="sticky top-16 z-30 border-b border-borde bg-lienzo/85 backdrop-blur-md"
    >
      {/* En el celular la fila se arrastra con el dedo; en escritorio caben
          todas y se centran. */}
      <div className="sin-barra mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 lg:justify-center">
        <Enlace activo={categoria === null} onClick={() => onCategoria(null)}>
          Todo
        </Enlace>

        {categorias.map((c) => (
          <Enlace key={c} activo={categoria === c} onClick={() => onCategoria(c)}>
            {c}
          </Enlace>
        ))}
      </div>
    </nav>
  );
}

function Enlace({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activo ? 'true' : 'false'}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap uppercase tracking-wide transition-colors',
        activo ? 'bg-tinta text-marca-contra' : 'text-tinta-suave hover:bg-arena hover:text-tinta',
      )}
    >
      {children}
    </button>
  );
}
