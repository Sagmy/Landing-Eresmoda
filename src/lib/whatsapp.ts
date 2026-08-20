import { formatMoney } from '@/lib/money';
import { esGenerico, capitalizar } from '@/lib/prendas';
import { TIENDA } from '@/lib/tienda';
import type { DatosEnvio, LineaCarrito } from '@/types/carrito';

/**
 * El pedido se cierra por WhatsApp: la landing no escribe nada en la base, solo
 * redacta el mensaje y se lo entrega a la asesora ya masticado.
 *
 * El desglose es el MISMO que la clienta acaba de revisar en el carrito. Que las
 * dos cosas coincidan al detalle es lo que evita el "yo pedí otra talla".
 */

/**
 * Tope de longitud del enlace, medido ya codificado.
 *
 * `encodeURIComponent` infla mucho: cada salto de línea son 3 caracteres y cada
 * acento otros 3 más. Pasado cierto punto, algunos navegadores móviles truncan
 * la URL y el mensaje llega cortado, así que por encima de este límite se manda
 * la versión compacta, de una línea por prenda.
 */
const LIMITE_CODIFICADO = 1800;

export function subtotalCents(linea: LineaCarrito): number {
  return linea.precioCents * linea.cantidad;
}

export function totalCents(lineas: readonly LineaCarrito[]): number {
  return lineas.reduce((suma, l) => suma + subtotalCents(l), 0);
}

export function totalPiezas(lineas: readonly LineaCarrito[]): number {
  return lineas.reduce((suma, l) => suma + l.cantidad, 0);
}

/**
 * Color y talla juntos, saltándose los marcadores genéricos: una prenda con
 * color "Único" y talla "Única" no debe imprimir nada.
 */
function detalle(linea: LineaCarrito): string {
  const partes: string[] = [];
  if (!esGenerico(linea.color)) partes.push(capitalizar(linea.color));
  if (!esGenerico(linea.talla)) partes.push(`Talla ${linea.talla}`);
  return partes.join(' · ');
}

function bloqueEnvio(envio: DatosEnvio): string {
  return [
    '*Datos de envío*',
    `Nombre: ${envio.nombre.trim()}`,
    `Teléfono: ${envio.telefono.trim()}`,
    `Ciudad: ${envio.ciudad.trim()}`,
    `Dirección: ${envio.direccion.trim()}`,
  ].join('\n');
}

function cierre(lineas: readonly LineaCarrito[], envio: DatosEnvio): string {
  return [`*Total:* ${formatMoney(totalCents(lineas))}`, '', bloqueEnvio(envio)].join('\n');
}

/** Versión larga: cada prenda con su precio unitario y su subtotal. */
function mensajeDetallado(lineas: readonly LineaCarrito[], envio: DatosEnvio): string {
  const items = lineas.map((linea, i) => {
    const d = detalle(linea);
    const precio =
      linea.cantidad > 1
        ? `${formatMoney(linea.precioCents)} c/u — *${formatMoney(subtotalCents(linea))}*`
        : `*${formatMoney(linea.precioCents)}*`;

    return [
      `*${i + 1}.* ${linea.nombre}`,
      [d, `Cantidad: ${linea.cantidad}`].filter(Boolean).join(' · '),
      precio,
    ].join('\n');
  });

  return [
    `¡Hola! Quiero hacer este pedido desde la web de ${TIENDA.nombre} 🛍️`,
    '',
    items.join('\n\n'),
    '',
    cierre(lineas, envio),
  ].join('\n');
}

/** Versión corta: una línea por prenda, para que el enlace no se rompa. */
function mensajeCompacto(lineas: readonly LineaCarrito[], envio: DatosEnvio): string {
  const items = lineas.map((linea, i) => {
    const d = detalle(linea);
    return `*${i + 1}.* ${linea.nombre}${d ? ` · ${d}` : ''} · x${linea.cantidad} · ${formatMoney(
      subtotalCents(linea),
    )}`;
  });

  return [
    `¡Hola! Quiero hacer este pedido desde la web de ${TIENDA.nombre} 🛍️`,
    '',
    items.join('\n'),
    '',
    cierre(lineas, envio),
  ].join('\n');
}

/** El texto tal cual le llegará a la asesora. */
export function mensajePedido(lineas: readonly LineaCarrito[], envio: DatosEnvio): string {
  const detallado = mensajeDetallado(lineas, envio);

  return encodeURIComponent(detallado).length <= LIMITE_CODIFICADO
    ? detallado
    : mensajeCompacto(lineas, envio);
}

/**
 * Enlace listo para un `<a href>`.
 *
 * Tiene que ser un enlace de verdad y no un `window.open` dentro de un handler:
 * Safari en iOS bloquea la apertura cuando ocurre de forma asíncrona.
 */
export function enlacePedido(lineas: readonly LineaCarrito[], envio: DatosEnvio): string {
  return `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(mensajePedido(lineas, envio))}`;
}

/** Enlace suelto, para quien solo quiere preguntar algo. */
export function enlaceConsulta(): string {
  const texto = `¡Hola! Vengo de la web de ${TIENDA.nombre} y quiero hacer una consulta.`;
  return `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(texto)}`;
}
