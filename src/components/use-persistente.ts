'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Estado que sobrevive a recargar la página, guardado en `localStorage`.
 *
 * Se usa `useSyncExternalStore` y no un `useState` + `useEffect` que lea al
 * montar. Esa versión funcionaba, pero llama a `setState` dentro del efecto y
 * eso provoca un render en cascada: React pinta el carrito vacío y acto seguido
 * la vuelve a pintar con lo guardado. Este hook es el primitivo que React trae
 * justo para leer de un sistema externo, con una instantánea distinta para el
 * servidor —donde `localStorage` no existe— y otra para el navegador.
 *
 * De regalo, sincroniza entre pestañas: quien tenga la tienda abierta dos veces
 * ve el mismo carrito en las dos.
 */

type Entrada = { crudo: string | null; valor: unknown };

/**
 * Lo último leído por clave.
 *
 * `useSyncExternalStore` compara instantáneas con `Object.is`, así que parsear
 * el JSON en cada llamada devolvería un objeto nuevo cada vez y React entraría
 * en un bucle de renders. Se guarda el texto crudo junto al valor: si el texto
 * no cambió, se devuelve exactamente el mismo objeto.
 */
const cache = new Map<string, Entrada>();
const oyentes = new Map<string, Set<() => void>>();

function leerCrudo(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    // Navegación privada en iOS bloquea el acceso. Se sigue en memoria.
    return null;
  }
}

function instantanea<T>(clave: string, inicial: T): T {
  const crudo = leerCrudo(clave);
  const previo = cache.get(clave);

  if (previo !== undefined && previo.crudo === crudo) return previo.valor as T;

  let valor = inicial;
  if (crudo !== null) {
    try {
      valor = JSON.parse(crudo) as T;
    } catch {
      // Guardado corrupto: se descarta y se empieza de cero.
      valor = inicial;
    }
  }

  cache.set(clave, { crudo, valor });
  return valor;
}

function suscribir(clave: string, alCambiar: () => void): () => void {
  let grupo = oyentes.get(clave);
  if (grupo === undefined) {
    grupo = new Set();
    oyentes.set(clave, grupo);
  }
  grupo.add(alCambiar);

  // `storage` solo se dispara en las OTRAS pestañas, que es justo lo que hace
  // falta: la que escribe ya se entera por su cuenta.
  const alStorage = (e: StorageEvent) => {
    if (e.key === clave) {
      cache.delete(clave);
      alCambiar();
    }
  };
  window.addEventListener('storage', alStorage);

  return () => {
    grupo.delete(alCambiar);
    window.removeEventListener('storage', alStorage);
  };
}

/**
 * Devuelve el valor y una función para cambiarlo, como `useState`.
 *
 * `inicial` tiene que ser una constante estable (definida fuera del componente):
 * un literal nuevo en cada render haría que la instantánea del servidor cambiara
 * sola.
 */
export function usePersistente<T>(clave: string, inicial: T) {
  const valor = useSyncExternalStore(
    useCallback((alCambiar: () => void) => suscribir(clave, alCambiar), [clave]),
    () => instantanea(clave, inicial),
    () => inicial,
  );

  const guardar = useCallback(
    (accion: T | ((previo: T) => T)) => {
      const siguiente =
        typeof accion === 'function'
          ? (accion as (previo: T) => T)(instantanea(clave, inicial))
          : accion;

      const crudo = JSON.stringify(siguiente);

      try {
        window.localStorage.setItem(clave, crudo);
      } catch {
        // Sin espacio o sin permiso: se pierde la persistencia, no la tienda.
      }

      cache.set(clave, { crudo, valor: siguiente });
      oyentes.get(clave)?.forEach((avisar) => avisar());
    },
    [clave, inicial],
  );

  return [valor, guardar] as const;
}
