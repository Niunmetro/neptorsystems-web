# Neptor Systems — sitio web

Sitio estático de producción (Astro) para **Neptor Systems**. Bilingüe ES/EN, HTML
pre-renderizado real por ruta, cero peticiones externas (fuentes y assets self-hosted).

Implementa el diseño aprobado en Claude Design **v4** (`Neptor Systems - Web v4.dc.html`).
El copy de ambos idiomas es **inmutable**; el diseño manda en estructura/copy/color/tipografía
y el `BRIEF.md` manda en implementación, arquitectura y movimiento.

## Comandos

```bash
npm install      # dependencias
npm run dev      # desarrollo   → http://localhost:4321
npm run build    # build estático a ./dist
npm run preview  # sirve ./dist para verificación local
```

Requiere Node 18+. El build no necesita red.

## Estructura

```
src/
  config.ts               Flags, SEO por idioma, mapa de rutas legales y equivalencias ES↔EN
  i18n/copy.ts            Diccionarios ES/EN VERBATIM del diseño (inmutables)
  layouts/Base.astro      <head>: title/description, canonical, hreflang, OG/Twitter,
                          JSON-LD Organization, iconos, preload de fuentes críticas
  components/
    Page.astro            Las 11 secciones (S1–S11) de la home, parametrizadas por idioma
    LegalBody.astro       Plantilla de páginas legales (cuerpo [PENDIENTE])
    ImageSlot.astro       Slot de foto: <picture> si hay src, si no placeholder [PENDIENTE-FOTOS]
  scripts/motion.ts       Movimiento: entrada del hero, reveals, scrollspy, coreografía
                          de "De la señal a la respuesta", burbujas, parallax
  styles/
    tokens.css            Tokens de marca (color/tipografía/espaciado/efectos) — exactos
    fonts.css             @font-face self-hosted (Poppins/DM Sans/Inter, subset latin)
    global.css            Base, keyframes, componentes (.btn/.card/.field/.checkbox),
                          responsive y prefers-reduced-motion
  pages/
    index.astro           /            (es)
    en/index.astro        /en/         (en)
    aviso-legal.astro · privacidad.astro · cookies.astro
    en/legal-notice.astro · en/privacy-policy.astro · en/cookie-policy.astro
    404.astro             404 bilingüe (noindex)
public/
    fonts/*.woff2          fuentes self-hosted (DM Sans/Inter variables + Poppins 500/600/700)
    assets/logo-*.png      lockups blanco/navy + isotipo de la gota
    og/og-es.png, og-en.png   imágenes sociales 1200×630
    favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png, site.webmanifest
    robots.txt, sitemap.xml   (sitemap con anotaciones hreflang)
design/                    Material fuente del handoff + scripts de generación de assets (no se publica)
```

## Tokens

Definidos en `src/styles/tokens.css` (portados exactos del design system). Claves de marca:
Deep Navy `#0A1F44`, Aqua `#00C2D1`, Safety Gold `#FFD700` (solo acento). Tipografías:
Poppins (titulares), DM Sans (UI/subtítulos/botones/eyebrows), Inter (cuerpo).

## Flags de configuración (`src/config.ts`)

| Flag | Defecto | Efecto |
|------|---------|--------|
| `WAITLIST_ENABLED` | `false` | `false`: el bloque de lista de espera mantiene el diseño pero el CTA es un **mailto** a connect@neptorsystems.com (asunto "Lista de espera Neptor" / "Neptor waitlist"). `true`: el formulario hace `POST` a `FORM_ENDPOINT` (nombre + email + consentimiento obligatorio + honeypot + validación nativa). |
| `ORIGIN_VIDEO_ENABLED` | `false` | Reservado para el reproductor propio de "El origen" (S8). `false`: la sección funciona con la foto. Al activarlo habrá que añadir el vídeo mp4/webm self-hosted y subtítulos `.vtt` ES/EN. |
| `FORM_ENDPOINT` | env `FORM_ENDPOINT` | Endpoint del formulario. Solo se usa con `WAITLIST_ENABLED=true`. |

## Movimiento

`src/scripts/motion.ts`, portado del runtime del diseño. Reglas: curva única
`cubic-bezier(0.16,1,0.3,1)`, solo `transform`/`opacity`, scroll con rAF, ambiente del hero
en pausa con pestaña oculta. **Todo el movimiento se desactiva con `prefers-reduced-motion`**
y el contenido es siempre visible sin JS (el script solo oculta-y-revela; si no corre, no oculta nada).

## Checklist de verificación (§8 del brief) — resultado

Ejecutado sobre `./dist` tras `npm run build`:

1. **Copy idéntico ES/EN** — ✅ Diccionarios `i18n/copy.ts` portados verbatim; render verificado en `/` y `/en/`.
2. **Grep de prohibidos = 0** — ✅ ES (`certific`, `garant`, `100 %`, `detecta el ahogamiento`, `salva`, `reloj`, `smartwatch`, `patent`, `IA` suelto) = 0. EN (`smartwatch`, `detects drowning`, `guarantee`, `certified`, `patented`, `saves lives`, `medically`, `unique in the world`, `100%`, `AI` suelto) = 0.
   - Notas (falsos positivos esperados, copy inmutable del diseño): en EN aparece el **verbo** "to watch several people at once" (no el dispositivo), y `100%` solo en valores CSS (gradientes/anchos), nunca como claim.
3. **Disclaimer ×2 por ruta home** — ✅ `/` y `/en/`: exactamente 2 (S4 + footer).
4. **hreflang + canonical + selector** — ✅ hreflang recíproco es↔en + x-default→es en todas las rutas; canonical por ruta; el selector ES|EN enlaza URLs equivalentes (no es estado JS).
5. **prefers-reduced-motion + teclado** — ✅ media query desactiva todo el movimiento; skip-link, `:focus-visible` (anillo aqua) y navegación por teclado presentes.
6. **Lighthouse móvil ≥95 ×4** — ⏳ **pendiente de ejecutar en CI/Chrome** (no hay runner en el entorno de build). Fundamentos cubiertos: JS ≈6,5 KB (gzip 2,3 KB, muy por debajo de 30 KB), fuentes self-hosted con preload de las 2 críticas, cero peticiones externas, imágenes con `aspect-ratio` reservado, hero con `fetchpriority=high`.
7. **OG ×2 + favicon + sitemap(hreflang) + robots** — ✅ `og/og-es.png`, `og/og-en.png` (1200×630), set de favicon/app-icons, `sitemap.xml` con `xhtml:link` hreflang, `robots.txt`.
8. **Cero lovable/r2.dev/terceros; cero peticiones externas** — ✅ Grep de `googleapis`/`gstatic`/`lovable`/`r2.dev`/CDNs = 0; todas las fuentes y assets self-hosted.

## Pendientes (owner / dirección)

- **Hosting y redirección `www → apex` (301)** — configurar en el hosting/DNS. El sitio asume `https://neptorsystems.com`.
- **Endpoint del formulario** — fijar `FORM_ENDPOINT` y poner `WAITLIST_ENABLED=true` cuando el proveedor esté listo.
- **Contenido legal (6 páginas)** — las plantillas muestran `[PENDIENTE — contenido facilitado por dirección]`. No se redacta contenido legal; la dirección aporta el texto.
- **`[PENDIENTE-FOTOS]`** — faltan las 2 fotos (hero y origen). Al recibirlas: colocarlas en `public/assets/`, pasar el `src` a `ImageSlot` en `Page.astro` (los `alt` por idioma ya están puestos), servir AVIF/WebP con `srcset`.
- **`[PENDIENTE-VÍDEO]`** — "El origen" (S8) funciona con foto; activar `ORIGIN_VIDEO_ENABLED` cuando exista el vídeo + subtítulos.
- **Logos `logo-neptor-white.png` / `logo-neptor-navy.png`** — ⚠ los lockups oficiales (1024²) superaban el límite de importación (256 KB) del design y llegaron **truncados**. Los actuales son una **reconstrucción limpia**: el isotipo real de la gota + "Neptor Systems" compuesto en Poppins SemiBold (la fuente de titulares de la marca). Se ven correctos y on-brand, pero **conviene sustituirlos por los PNG oficiales** en las mismas rutas cuando la dirección los facilite (no cambia ningún código). El isotipo (`logo-neptor-mark.png`) y el favicon sí derivan del asset real completo.
- **Lighthouse móvil ≥95 ×4** — ejecutar en CI/Chrome sobre `/` y `/en/`.
- **SEO post-publicación** — alta en Google Search Console y solicitud de reindexación tras publicar.
