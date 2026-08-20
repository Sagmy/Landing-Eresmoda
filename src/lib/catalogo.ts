import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { aPrenda } from '@/lib/prendas';
import type { CatalogoPublicoRow, Prenda } from '@/types/catalogo';

/**
 * Cada cuánto se vuelve a preguntar el catálogo. Cinco minutos: suficiente para
 * que una prenda agotada desaparezca pronto, y lo bastante alto como para que la
 * página se sirva casi siempre desde caché.
 */
export const REVALIDAR_SEGUNDOS = 300;

/**
 * Cliente público de Supabase.
 *
 * Sin `@supabase/ssr` ni manejo de cookies a propósito: aquí no hay sesión ni
 * usuarios. La llave anónima solo abre `v_catalogo_publico` y nada más, así que
 * viaja tranquila. Tampoco hay escritura posible: el rol `anon` no tiene
 * INSERT, UPDATE ni DELETE sobre ninguna tabla del esquema.
 */
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    // Se envuelve el fetch para que la petición entre en la caché de Next. Sin
    // esto la lectura sería `no-store` y la página se volvería dinámica.
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, next: { revalidate: REVALIDAR_SEGUNDOS } }),
  },
});

export type ResultadoCatalogo = {
  prendas: Prenda[];
  /** Mensaje si la lectura falló. La página se pinta igual, con un aviso. */
  error: string | null;
};

/**
 * Lee el catálogo público. No lanza: si Supabase falla, la tienda tiene que
 * seguir mostrando la cabecera y el WhatsApp en vez de una pantalla de error.
 */
export async function obtenerCatalogo(): Promise<ResultadoCatalogo> {
  const { data, error } = await supabase
    .from('v_catalogo_publico')
    .select('*')
    // Lo que se puede comprar, primero. Después por categoría y nombre: la vista
    // no expone `created_at`, así que no hay forma de ordenar por novedad.
    .order('is_available', { ascending: false })
    .order('category_name', { ascending: true })
    .order('product_name', { ascending: true })
    .order('color', { ascending: true });

  if (error) {
    return { prendas: [], error: error.message };
  }

  const filas = (data ?? []) as CatalogoPublicoRow[];

  return {
    prendas: filas.map((fila) => aPrenda(fila, env.NEXT_PUBLIC_SUPABASE_URL)),
    error: null,
  };
}
