import type { CatalogoPublicoRow, Prenda } from '@/types/catalogo';

/**
 * Helpers de presentación del catálogo. Puros y sin dependencias del servidor:
 * los usan tanto la página que arma los datos como el carrito en el navegador.
 */

/** Sin acentos y en mayúsculas, para comparar sin sorpresas. */
function normalizar(valor: string): string {
  return valor
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

/**
 * `Único` y `Única` son los valores por defecto de la base para "esta prenda no
 * se distingue por color / por talla". Son marcadores internos, no atributos:
 * imprimir "Color: Único" en una tarjeta es ruido, así que se omiten.
 */
export function esGenerico(valor: string): boolean {
  const v = normalizar(valor);
  return v === 'UNICO' || v === 'UNICA';
}

/** Devuelve la etiqueta a pintar, o `null` si no hay que pintar nada. */
export function etiqueta(valor: string): string | null {
  return esGenerico(valor) ? null : capitalizar(valor);
}

/**
 * Primera letra en mayúscula, el resto tal cual.
 *
 * En la base conviven `blanco` y `Rosado` —y son justo los dos colores de la
 * misma prenda—, así que uno al lado del otro se verían descuadrados. Se
 * arregla al mostrar en vez de exigir que se reescriban los datos. Solo la
 * primera letra: "Negra detalles amarillos" tiene que sobrevivir intacto.
 */
export function capitalizar(valor: string): string {
  const v = valor.trim();
  if (v === '') return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
}

const ESCALA_TALLAS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

/**
 * Posición de una talla en el orden en que se enseña la ropa.
 *
 * Hace falta porque la vista las agrega con `array_agg(distinct v.size)`, que
 * devuelve orden ALFABÉTICO: el mono llega como ["M","XL","XS"], que mostrado
 * tal cual se ve roto.
 *
 * Lo que no se reconoce no se descarta, se manda al final —y ordenado por
 * número si lo es—, para que una talla nueva jamás desaparezca del selector.
 */
function rango(talla: string): number {
  const t = normalizar(talla);

  if (t === 'UNICA' || t === 'UNICO') return -1;

  const enEscala = ESCALA_TALLAS.indexOf(t);
  if (enEscala !== -1) return enEscala;

  const numero = Number(t.replace(',', '.'));
  if (Number.isFinite(numero)) return 100 + numero;

  return 1000;
}

/** ["M","XL","XS"] → ["XS","M","XL"] */
export function ordenarTallas(tallas: readonly string[]): string[] {
  return [...tallas].sort((a, b) => rango(a) - rango(b) || a.localeCompare(b, 'es'));
}

/** Ruta dentro del bucket → URL pública. Los segmentos se codifican por si el
 *  nombre del archivo trae espacios o acentos. */
export function urlFoto(baseSupabase: string, ruta: string): string {
  const segmentos = ruta.split('/').map(encodeURIComponent).join('/');
  return `${baseSupabase}/storage/v1/object/public/prendas/${segmentos}`;
}

/** Fila cruda de la vista → prenda lista para pintar. */
export function aPrenda(fila: CatalogoPublicoRow, baseSupabase: string): Prenda {
  return {
    id: `${fila.product_id}·${fila.color}`,
    productId: fila.product_id,
    nombre: fila.product_name.trim(),
    marca: fila.brand?.trim() ? capitalizar(fila.brand) : null,
    categoria: fila.category_name?.trim() || 'Otros',
    color: fila.color,
    colorEtiqueta: etiqueta(fila.color),
    precioCents: fila.price_from_cents,
    disponible: fila.is_available,
    tallas: ordenarTallas(fila.sizes_available ?? []),
    imagenes: (fila.images ?? []).map((ruta) => urlFoto(baseSupabase, ruta)),
  };
}

/**
 * Las categorías salen de los datos, nunca escritas en el código: se crean y
 * renombran desde Ajustes del inventario, así que codificarlas obligaría a
 * desplegar cada vez que se añade una.
 */
export function categoriasDe(prendas: readonly Prenda[]): string[] {
  return [...new Set(prendas.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, 'es'));
}

/** Filtra por categoría y por texto libre (nombre, marca o color). */
export function filtrar(
  prendas: readonly Prenda[],
  categoria: string | null,
  busqueda: string,
): Prenda[] {
  const q = normalizar(busqueda);

  return prendas.filter((p) => {
    if (categoria !== null && p.categoria !== categoria) return false;
    if (q === '') return true;

    return normalizar(`${p.nombre} ${p.marca ?? ''} ${p.color} ${p.categoria}`).includes(q);
  });
}

/**
 * Baraja una copia de la lista (Fisher-Yates).
 *
 * Se llama en el componente de servidor, no en el navegador: así el orden se
 * decide una vez por regeneración de la página —cada 5 minutos— y el HTML que
 * manda el servidor es el mismo que hidrata el cliente. Barajar durante el
 * render del cliente daría un orden distinto al del servidor y React lo
 * reportaría como error de hidratación.
 */
export function mezclar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copia[i] as T;
    const b = copia[j] as T;
    copia[i] = b;
    copia[j] = a;
  }

  return copia;
}
