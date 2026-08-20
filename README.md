# Landing Eresmoda

El escaparate público de la tienda: enseña el catálogo real, deja armar un
pedido y lo termina por WhatsApp con la asesora.

---

## De dónde salen las prendas

De la misma base de datos que el inventario (`../InventarioEresmoda`). Esta
aplicación **no tiene base de datos propia y no escribe nada**: lee una sola
vista y ya.

```
v_catalogo_publico   ← lo único que la llave anónima puede leer del esquema
bucket `prendas`     ← las fotos, de lectura pública
```

Una fila por **prenda × color**, porque así se enseña la ropa: el short blanco y
el rosado son dos tarjetas del mismo producto. De cada fila llegan el nombre, la
marca, la categoría, el color, el precio en centavos, si se puede comprar, las
tallas con stock y las rutas de las fotos.

Lo que deliberadamente **no** sale de ahí: los costos, los márgenes y las
cantidades exactas de stock. No es que la interfaz los esconda, es que el dato no
cruza la puerta.

### Consecuencias que explican el diseño

**Las categorías no están escritas en el código.** Se crean y se renombran desde
Ajustes del inventario, así que los filtros se construyen con lo que llega. Una
categoría nueva aparece sola, sin desplegar.

**La landing no reserva nada.** Sin permiso de escritura, la disponibilidad que
se ve puede quedar vieja y dos personas pueden pedir la última pieza. Eso lo
resuelve la asesora por WhatsApp, y por eso la ficha lo dice en voz alta.

**El precio es firme; el envío no.** El precio es el mismo para cualquier talla y
color de una prenda, así que el carrito suma un total real. Lo único por acordar
es el envío, y así se rotula.

---

## Puesta en marcha

```bash
npm install
```

Copia `.env.example` a `.env.local` y pon los valores del proyecto de Supabase
(los mismos que usa el inventario):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Esa llave está pensada para viajar al navegador: sin sesión no abre nada más que
la vista del catálogo. **Nunca** pongas aquí la `service_role`.

```bash
npm run dev
```

Abre `http://localhost:3200`.

---

## Comandos

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm run lint
```

---

## Decisiones que conviene conocer

**El catálogo se regenera cada 5 minutos.** La página se sirve como HTML ya
hecho: entra rápido en el celular y la pueden leer los buscadores. Una prenda
agotada desaparece en cuestión de minutos, no al instante, y es un intercambio
consciente.

**Las fotos las optimiza Next, no Supabase.** El endpoint `render/image` del
bucket, pasándole solo el ancho, devuelve la imagen deformada (una foto de
1106×1280 sale como 600×1280). `next/image` resuelve la proporción, el `srcset` y
el WebP sin pelearse con nada.

**La marca del encabezado está dibujada, no es una imagen.** `components/marca.tsx`
es un lockup en SVG —el vestido dorado en la percha, "ERES" en serif y "MODA"
debajo— inspirado en el logo de la tienda. El único archivo del logo que hay hoy
es un montaje fotográfico sobre una pared, con sombras y perspectiva: recortarlo
se vería sucio, y sobre fondo oscuro peor. Dibujado se adapta al tema claro y
oscuro, se ve nítido en cualquier pantalla y no cuesta una descarga más. **El día
que exista el logo original en PNG con transparencia o en SVG, se sustituye ese
componente por una `<Image>` y no hay que tocar nada más.**

**La portada se sortea en el servidor.** El carrusel enseña prendas de todas las
categorías en orden aleatorio, pero el sorteo ocurre en el componente de
servidor: se decide una vez por regeneración de la página —cada 5 minutos— y el
HTML que llega al navegador ya viene barajado. Barajar durante el render del
cliente daría un orden distinto al del servidor y React lo reportaría como error
de hidratación. Solo entran prendas disponibles y con foto: la portada no debe
abrir con algo agotado.

**Las tallas se reordenan al pintarlas.** La vista las agrega con
`array_agg(distinct ...)`, que devuelve orden alfabético: un mono con M, XL y XS
llega como `["M","XL","XS"]`. Se ordenan como ropa, y lo que no se reconoce va al
final en vez de descartarse, para que una talla nueva nunca desaparezca del
selector.

**`Único` y `Única` no se imprimen.** Son los valores por defecto de la base para
"esta prenda no se distingue por color / por talla". Escribir "Color: Único" en
una tarjeta es ruido.

**El color y la marca se capitalizan al mostrarlos.** En la base conviven
`blanco` y `Rosado`, `shein` y `Shein`. Se arregla al pintar en vez de exigir que
se reescriban los datos desde el inventario.

**El botón de WhatsApp es un enlace de verdad.** No un `window.open` dentro de un
manejador de eventos: Safari en iOS bloquea la apertura cuando ocurre de forma
asíncrona. Y si el mensaje se alarga demasiado, se manda una versión compacta de
una línea por prenda, porque algunos navegadores móviles truncan las URLs largas.

**La bolsa vive en `localStorage`** y se lee con `useSyncExternalStore`, que es el
primitivo que React trae para leer de un sistema externo sin provocar un render
en cascada ni romper la hidratación. De regalo, se sincroniza entre pestañas.
