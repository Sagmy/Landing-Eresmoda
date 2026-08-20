/**
 * Una línea del pedido: prenda + color + talla. Guarda una instantánea del
 * nombre y el precio para poder pintar el carrito sin volver a consultar, y
 * para que lo que la clienta revisó sea exactamente lo que se manda.
 */
export type LineaCarrito = {
  /** `${productId}·${color}` — la tarjeta de la que salió. */
  prendaId: string;
  productId: string;
  nombre: string;
  marca: string | null;
  /** Valor crudo de la base: es lo que la asesora busca en el inventario. */
  color: string;
  talla: string;
  cantidad: number;
  precioCents: number;
  imagen: string | null;
};

/** Clave única de una línea. Dos tallas del mismo color son dos líneas. */
export function claveLinea(prendaId: string, talla: string): string {
  return `${prendaId}·${talla}`;
}

export type DatosEnvio = {
  nombre: string;
  telefono: string;
  ciudad: string;
  direccion: string;
};

export const ENVIO_VACIO: DatosEnvio = {
  nombre: '',
  telefono: '',
  ciudad: '',
  direccion: '',
};
