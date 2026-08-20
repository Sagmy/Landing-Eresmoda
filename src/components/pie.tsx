import { TIENDA } from '@/lib/tienda';
import { enlaceConsulta } from '@/lib/whatsapp';
import { IconoInstagram, IconoWhatsApp } from '@/components/iconos';
import { Marca } from '@/components/marca';

export function Pie() {
  return (
    <footer className="mt-16 border-t border-borde bg-arena">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div>
          <Marca tamano="lg" />
          <p className="mt-1 text-sm text-tinta-suave">
            Escríbenos y una de nuestras asesoras te atenderá personalmente.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={enlaceConsulta()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <IconoWhatsApp className="size-4" />
            {TIENDA.whatsappVisible}
          </a>

          <a
            href={TIENDA.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-borde-fuerte px-5 text-sm text-tinta transition-colors hover:bg-superficie"
          >
            <IconoInstagram className="size-4" />
            {TIENDA.instagramVisible}
          </a>
        </div>

        <p className="text-xs leading-relaxed text-tinta-tenue">
          Los precios están en dólares, a la tasa BCV € del día. La disponibilidad puede cambiar:
          tu asesora la confirma al cerrar el pedido.
        </p>
      </div>
    </footer>
  );
}
