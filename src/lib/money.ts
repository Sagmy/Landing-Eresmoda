/**
 * Todo el dinero llega desde la base en CENTAVOS enteros.
 *
 * Nunca en decimales flotantes: 0.1 + 0.2 no da 0.3 en JavaScript, y sumando
 * las líneas de un pedido el total deja de cuadrar. La conversión a decimal
 * ocurre en un único punto: al mostrar.
 *
 * Copiado de InventarioEresmoda/src/lib/money.ts para que las dos aplicaciones
 * escriban las cifras exactamente igual.
 */

/**
 * Formato de cifras. Sin `style: 'currency'` a propósito: con esa opción, es-VE
 * escribe el código ISO ("USD 12,00"), que además de leerse mal se come el
 * espacio del nombre de la prenda en el celular. Se antepone el símbolo a mano.
 */
const formatter = new Intl.NumberFormat('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1500 → "$15,00" · 150000 → "$1.500,00" */
export function formatMoney(cents: number): string {
  return `$${formatter.format((cents ?? 0) / 100)}`;
}
