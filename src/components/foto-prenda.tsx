import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  src: string | null;
  alt: string;
  /** Las primeras filas de la rejilla se cargan sin esperar al scroll. */
  prioridad?: boolean;
  /** Ancho que ocupará la foto, para que Next elija la resolución justa. */
  sizes: string;
  className?: string;
};

/**
 * La foto de una prenda, siempre en 4:5 y recortada al centro.
 *
 * La proporción la fija el contenedor y la imagen va con `fill`: las fotos son
 * verticales pero no todas iguales (1106×1280, por ejemplo), y sin una caja fija
 * la rejilla daría saltos según fuera cargando cada una.
 *
 * Optimiza Next, no Supabase: el endpoint `render/image` del bucket, pasándole
 * solo el ancho, devuelve la foto deformada (1106×1280 → 600×1280).
 */
export function FotoPrenda({ src, alt, prioridad = false, sizes, className }: Props) {
  return (
    <div className={cn('relative aspect-[4/5] overflow-hidden bg-arena', className)}>
      {src === null ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <ImageOff className="size-5 text-tinta-tenue" aria-hidden="true" />
          <span className="text-xs text-tinta-tenue">Sin foto</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={prioridad}
          className="foto-entra object-cover"
        />
      )}
    </div>
  );
}
