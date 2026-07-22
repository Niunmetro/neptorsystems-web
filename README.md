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

## Agua del hero (shader WebGL)

`src/scripts/hero-water.ts` — WebGL 1 sin librerías. **Técnica: textura caústica tileable
(Voronoi toroidal, F2−F1 afilado a filamentos, generada una vez en CPU) + doble muestreo con
`min()`** a escalas no múltiplas y velocidades distintas — el estándar de videojuegos; el `min()`
de dos redes en movimiento produce la danza orgánica. Referencia estudiada para el listón de
calidad: Evan Wallace, *Rendering Realtime Caustics in WebGL* (webgl-water, MIT); **ningún código
de terceros copiado** (Shadertoy es CC BY-NC-SA y no se usó). Encima: gradiente de profundidad,
**rayos de sol gaussianos** (4 haces, 8–18°, mitad derecha, tinte `#FFF6D8`/`#FFD700`, extinguidos
al 60 % de altura, balanceo ±2° y respiración ±20 % por noise) + dithering y viñeta izquierda que
protege el contraste del H1.

Presupuestos: init en `requestIdleCallback` (nunca bloquea el LCP), **30 FPS**, `devicePixelRatio`
limitado a 1.5, resolución interna al **0,70**, y **pausa total** con `document.hidden` o con el hero
fuera de viewport (IntersectionObserver). `uScroll` se alimenta del rAF ya existente de `motion.ts`
(cero listeners de scroll nuevos). JS total del sitio: **~5 KB gzip**.

**Fallbacks** (en este orden): `prefers-reduced-motion` → sin canvas; sin WebGL → se conserva el
efecto CSS animado (`[data-amb]` + `neptorGlowDrift`, que por eso NO se borra); con shader activo →
los `[data-amb]` pasan a `opacity:0`. Las burbujas DOM siguen flotando por encima del canvas.

### Afinado en vivo: `?agua=`
| Preset | Efecto |
|---|---|
| `?agua=suave` | **Por defecto.** Caústicas α≈0.17, rayos α≈0.075. |
| `?agua=alto` | +40 % de intensidad (para comparar en revisión). |
| `?agua=off` | Fuerza el fallback CSS (sin canvas). |

## Formulario de lista de espera

`WAITLIST_ENABLED = true`. El formulario recoge **Nombre, Email y Tipo (Particular / Empresa /
Entidad)** + consentimiento, y hace POST a `FORM_ENDPOINT`; el aviso llega **por email**.
`src/scripts/waitlist.ts` lo envía en segundo plano (fetch) y muestra el estado en línea; **sin JS
funciona igual** con un POST normal. Honeypot `_honey` incluido.

Por defecto usa **FormSubmit.co** (sin cuenta): el primer envío manda un **email de activación** a
`connect@neptorsystems.com` que hay que confirmar una sola vez. Para cambiar de proveedor
(p. ej. Formspree), define la variable de entorno `FORM_ENDPOINT` con la URL nueva: el resto no cambia.

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

## Estado de publicación

- **PUBLICADO** en https://neptorsystems.com (+ `/en/`) sobre **GitHub Pages**. Repo: `Niunmetro/neptorsystems-web` (público); deploy automático por GitHub Actions en cada push a `main`. DNS en IONOS: `A` de `@` y `www` → `185.199.108.153`. HTTPS (Let's Encrypt) gratuito; queda que GitHub emita el certificado y activar "enforce HTTPS".
- **Fotos** (hero piscina + origen taller) — ✅ **HECHO**: integradas y optimizadas (AVIF/WebP/JPG responsive vía `ImageSlot`, `alt` por idioma).
- **Logos oficiales** — ✅ **HECHO**: lockup blanco/navy = isotipo real de la gota + "NEPTOR SYSTEMS" (navy oficial muestreado); favicon e íconos del asset real.
- **Identificación corporativa** — ✅ **HECHO**: `ORG` en `config.ts` (NIF `B75815704`, `legalForm`, domicilio social completo), JSON-LD Organization con `vatID` + `PostalAddress`, y páginas legales con la identificación completa.
- **Páginas legales** — ✅ **HECHO**: contenido portado desde OLDWEB a `src/i18n/legal.ts` (Aviso Legal, Privacidad, Cookies × ES/EN), identificación normalizada, finalidad adaptada (sin demos comerciales / productos B2B), fecha de última actualización visible. Único marcador que queda: `[PENDIENTE — REGISTRO MERCANTIL: tomo, folio, hoja]` en el Aviso Legal / Legal notice.

## Pendientes (owner / dirección)

- **Activar el formulario (1 clic)** — el formulario ya está ON y envía a FormSubmit.co. En el **primer envío** llega un email de activación a `connect@neptorsystems.com`: hay que **pulsar el enlace una sola vez** y a partir de ahí los avisos llegan solos. (Si se prefiere otro proveedor, cambiar `FORM_ENDPOINT`.)
- **Registro Mercantil** — facilitar tomo, folio y hoja para sustituir el `[PENDIENTE]` del Aviso Legal.
- **Logos vectoriales oficiales** — sustituir `public/assets/logo-neptor-white.png` y `logo-neptor-navy.png` por los **vectores oficiales (SVG)** cuando los facilite **IDEA Design**; van en las mismas rutas y **no requieren cambios de código**.
- **`[PENDIENTE-VÍDEO]`** — "El origen" (S8) funciona con foto; activar `ORIGIN_VIDEO_ENABLED` cuando exista el vídeo + subtítulos.
- **SEO post-publicación** — alta en **Google Search Console**, envío del `sitemap.xml` y solicitud de indexación de `/` y `/en/`.
- **Lighthouse móvil ≥95 ×4** — ejecutar en CI/Chrome sobre `/` y `/en/`.

## Mantenimiento

- **Cifras de la sección "Una epidemia silenciosa"** (`s3bStat*`/`s3bSource` en `src/i18n/copy.ts`): datos de la **RFESS** de carácter **estacional**. Revisar antes de cada publicación y **actualizar el dato del año cerrado cada mes de enero**.
