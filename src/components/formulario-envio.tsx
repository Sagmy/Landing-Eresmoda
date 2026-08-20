'use client';

import { cn } from '@/lib/utils';
import type { CampoEnvio, ErroresEnvio } from '@/lib/envio';
import type { DatosEnvio } from '@/types/carrito';

type Props = {
  envio: DatosEnvio;
  onCambio: (envio: DatosEnvio) => void;
  errores: ErroresEnvio;
  /** Solo se pintan los errores de los campos que ya se tocaron. */
  tocados: Partial<Record<CampoEnvio, boolean>>;
  onTocar: (campo: CampoEnvio) => void;
};

type ConfigCampo = {
  campo: CampoEnvio;
  etiqueta: string;
  placeholder: string;
  tipo: string;
  autoComplete: string;
  /**
   * Explícito en los tres: con `exactOptionalPropertyTypes` no se puede pasar
   * `undefined` a una prop opcional de React, así que nada de ternarios aquí.
   */
  modo: 'text' | 'tel';
};

const CAMPOS: ConfigCampo[] = [
  {
    campo: 'nombre',
    etiqueta: 'Nombre y apellido',
    placeholder: 'María Pérez',
    tipo: 'text',
    autoComplete: 'name',
    modo: 'text',
  },
  {
    campo: 'telefono',
    etiqueta: 'Teléfono',
    placeholder: '0412 1234567',
    tipo: 'tel',
    autoComplete: 'tel',
    modo: 'tel',
  },
  {
    campo: 'ciudad',
    etiqueta: 'Ciudad o estado',
    placeholder: 'Caracas',
    tipo: 'text',
    autoComplete: 'address-level2',
    modo: 'text',
  },
];

export function FormularioEnvio({ envio, onCambio, errores, tocados, onTocar }: Props) {
  const mostrar = (campo: CampoEnvio) => (tocados[campo] === true ? errores[campo] : undefined);

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-tinta">Datos de entrega</h3>
        <p className="text-xs text-tinta-tenue">
          El costo del envío lo acuerdas con tu asesora por WhatsApp.
        </p>
      </div>

      {CAMPOS.map(({ campo, etiqueta, placeholder, tipo, autoComplete, modo }) => {
        const error = mostrar(campo);

        return (
          <Campo key={campo} id={campo} etiqueta={etiqueta} error={error}>
            <input
              id={campo}
              type={tipo}
              inputMode={modo}
              autoComplete={autoComplete}
              value={envio[campo]}
              placeholder={placeholder}
              onChange={(e) => onCambio({ ...envio, [campo]: e.target.value })}
              onBlur={() => onTocar(campo)}
              aria-invalid={error !== undefined}
              className={entrada(error !== undefined)}
            />
          </Campo>
        );
      })}

      <Campo id="direccion" etiqueta="Dirección" error={mostrar('direccion')}>
        <textarea
          id="direccion"
          rows={3}
          autoComplete="street-address"
          value={envio.direccion}
          placeholder="Urbanización, calle, edificio o casa, punto de referencia"
          onChange={(e) => onCambio({ ...envio, direccion: e.target.value })}
          onBlur={() => onTocar('direccion')}
          aria-invalid={mostrar('direccion') !== undefined}
          className={cn(entrada(mostrar('direccion') !== undefined), 'min-h-20 resize-y py-2')}
        />
      </Campo>
    </section>
  );
}

function entrada(conError: boolean) {
  return cn(
    'w-full rounded-caja border bg-superficie px-3 text-sm text-tinta placeholder:text-tinta-tenue focus:outline-none',
    'h-11',
    conError ? 'border-red-500 focus:border-red-500' : 'border-borde focus:border-borde-fuerte',
  );
}

function Campo({
  id,
  etiqueta,
  error,
  children,
}: {
  id: string;
  etiqueta: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-tinta-suave">
        {etiqueta}
      </label>
      {children}
      {error !== undefined ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
