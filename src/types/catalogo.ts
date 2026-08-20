/**
 * Fila cruda de `v_catalogo_publico`, la única vista que la llave anónima puede
 * leer en todo el esquema. Copiado de InventarioEresmoda/src/types/database.ts
 * para que el contrato quede escrito también de este lado.
 *
 * Una fila por PRENDA × COLOR: el short blanco y el rosado son dos filas del
 * mismo producto, porque así se enseña la ropa.
 */
export type CatalogoPublicoRow = {
  product_id: string;
  product_name: string;
  brand: string | null;
  category_name: string | null;
  color: string;
  /** El precio de la prenda, en centavos. Igual para todas sus tallas. */
  price_from_cents: number;
  is_available: boolean;
  /** Solo las tallas que se pueden comprar hoy. Vacío si está agotada. */
  sizes_available: string[];
  /** Rutas dentro del bucket `prendas`, en orden: la primera es la portada. */
  images: string[];
};

/**
 * La prenda ya masticada para pintarla: rutas convertidas en URLs, tallas
 * ordenadas como ropa y no como alfabeto, y las etiquetas genéricas ("Único",
 * "Única") resueltas a null para que nadie las imprima.
 */
export type Prenda = {
  /** `${product_id}·${color}` — identifica la tarjeta, no el producto. */
  id: string;
  productId: string;
  nombre: string;
  marca: string | null;
  categoria: string;
  /** Valor crudo de la base: es lo que la asesora necesita leer en el pedido. */
  color: string;
  /** Para pintar. `null` cuando la prenda no se distingue por color. */
  colorEtiqueta: string | null;
  precioCents: number;
  disponible: boolean;
  /** Ordenadas XS · S · M · L · XL. Vacío si está agotada. */
  tallas: string[];
  /** URLs completas y públicas. Puede venir vacío. */
  imagenes: string[];
};
