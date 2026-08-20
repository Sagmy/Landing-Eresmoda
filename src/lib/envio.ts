import { z } from 'zod';
import type { DatosEnvio } from '@/types/carrito';

/**
 * Lo mínimo para que la asesora pueda cerrar el pedido sin tener que pedir los
 * datos otra vez por chat.
 *
 * No se calcula costo de envío ni se ofrecen zonas: el inventario no modela
 * tarifas, así que la landing no puede prometer un precio de envío. Eso se
 * acuerda por WhatsApp.
 */
export const esquemaEnvio = z.object({
  nombre: z.string().trim().min(3, 'Escribe tu nombre y apellido'),
  telefono: z
    .string()
    .trim()
    .min(7, 'Escribe un teléfono de contacto')
    .regex(/^[\d\s()+-]+$/, 'El teléfono solo lleva números'),
  ciudad: z.string().trim().min(3, 'Escribe tu ciudad o estado'),
  direccion: z.string().trim().min(10, 'Escribe la dirección lo más completa que puedas'),
});

export type CampoEnvio = keyof DatosEnvio;

export type ErroresEnvio = Partial<Record<CampoEnvio, string>>;

/** Devuelve los errores por campo. Objeto vacío = todo correcto. */
export function validarEnvio(envio: DatosEnvio): ErroresEnvio {
  const resultado = esquemaEnvio.safeParse(envio);
  if (resultado.success) return {};

  const errores: ErroresEnvio = {};

  for (const issue of resultado.error.issues) {
    const campo = issue.path[0] as CampoEnvio | undefined;
    // Solo el primer error de cada campo: encadenar dos mensajes bajo el mismo
    // input no ayuda a nadie.
    if (campo !== undefined && errores[campo] === undefined) {
      errores[campo] = issue.message;
    }
  }

  return errores;
}

export function envioValido(envio: DatosEnvio): boolean {
  return esquemaEnvio.safeParse(envio).success;
}
