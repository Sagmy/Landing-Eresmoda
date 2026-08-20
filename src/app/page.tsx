import { obtenerCatalogo } from '@/lib/catalogo';
import { mezclar } from '@/lib/prendas';
import { Tienda } from '@/components/tienda';

/**
 * Se regenera cada 5 minutos (el mismo valor que `REVALIDAR_SEGUNDOS` en
 * `lib/catalogo.ts`; aquí tiene que ser un literal porque Next lee este export
 * de forma estática, sin ejecutar el módulo).
 *
 * Así la página se sirve como HTML ya hecho —rápida en el celular y legible
 * para los buscadores— y una prenda agotada desaparece en cuestión de minutos.
 */
export const revalidate = 300;

export default async function Pagina() {
  const { prendas, error } = await obtenerCatalogo();

  // La portada mezcla prendas de todas las categorías, y solo las que se pueden
  // comprar: no tiene sentido que lo primero que se vea esté agotado. El orden
  // se sortea aquí, en el servidor, una vez por regeneración: así cambia cada
  // pocos minutos sin que el HTML del servidor y el del navegador difieran.
  const destacadas = mezclar(prendas.filter((p) => p.disponible && p.imagenes.length > 0));

  return <Tienda prendas={prendas} destacadas={destacadas} error={error} />;
}
