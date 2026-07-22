# BRIEF TÉCNICO DEFINITIVO — WEB NEPTOR SYSTEMS (Claude Design → Claude Code) · v2.0 julio 2026
(Sustituye a cualquier brief anterior)

Fuente de diseño (Claude Design):
https://claude.ai/design/p/6f30119e-02ac-4e26-8c75-ce5284db02fa?file=Neptor+Systems+-+Web+v4.dc.html
Fichero a implementar: `Neptor Systems - Web v4.dc.html` (v4, bilingüe, aprobada)

## 0. Cómo usar este brief
1. En Claude Design, sobre la versión final aprobada (v4, bilingüe): botón Handoff to Claude Code.
2. Abre el proyecto resultante en Claude Code.
3. El diseño del handoff manda en estructura, copy (ES y EN), colores y tipografías. Este brief manda en
   implementación, arquitectura, movimiento y técnica. El copy de ambos idiomas es inmutable: ni una palabra
   nueva, ni un dato nuevo, ni traducciones propias. Si falta algo: marcador `[PENDIENTE]`.

## 1. Objetivo y stack
* Sitio estático de producción con **Astro**. Nada de SPA: HTML pre-renderizado real por ruta.
* Rutas: `/` (es) · `/en/` (en) · `/aviso-legal` · `/privacidad` · `/cookies` ·
  `/en/legal-notice` · `/en/privacy-policy` · `/en/cookie-policy`
  (legales con plantilla y cuerpo `[PENDIENTE — contenido facilitado por dirección]`; **no redactar contenido legal**)
  · 404 bilingüe sencilla.
* Un solo conjunto de componentes; el contenido ES/EN sale del handoff. El selector ES | EN del header enlaza
  entre URLs equivalentes (no es estado JS).
* `<html lang="es">` en `/` y `<html lang="en">` en `/en/`.
* CSS global con los tokens del diseño; JS mínimo en módulos (motion + formulario), total < 30 KB gzip.
  Fuentes Poppins / DM Sans / Inter self-hosted woff2, `font-display: swap`, preload solo de las 2 críticas.

## 2. SEO bilingüe
* ES — title: `Neptor Systems — Seguridad acuática para familias`
  description: `Desarrollamos una pulsera acuática sin pantalla conectada a un hub local que gestiona varias pulseras y genera alertas claras. Proyecto en I+D desde Murcia.`
* EN — title: `Neptor Systems — Water safety for families`
  description: `We are developing a screenless aquatic wristband connected to a local hub that manages several wristbands and generates clear alerts. An R&D project from Murcia, Spain.`
* `hreflang`: en ambas páginas, alternates `es` ↔ `en` + `x-default` → `/`.
* Canonical por ruta (`https://neptorsystems.com/` y `https://neptorsystems.com/en/`); redirección 301
  www → apex documentada en README (se configura en hosting).
* Open Graph / Twitter por idioma: `og:locale` es_ES / en_US; dos imágenes sociales 1200×630 en `/og/`:
  fondo Deep Navy #0A1F44, logo blanco, onda aqua inferior, y el claim en Poppins blanco —
  ES: "Una nueva capa de seguridad para la vida en el agua." /
  EN: "A new layer of safety for life in the water." Nada más.
  `twitter:card: summary_large_image`. Cero restos de imágenes o dominios anteriores (r2.dev, lovable).
* Favicon + app icons desde el isotipo de la gota (SVG + PNG 32/180/512) + webmanifest.
* `sitemap.xml` con las rutas de ambos idiomas y anotaciones hreflang; `robots.txt` (allow all + sitemap).
* JSON-LD `Organization` en ambas: name NEPTOR SYSTEMS SL, url, logo, email connect@neptorsystems.com,
  telephone +34 652 34 00 14, address del domicilio social (Madrid). Sin claims de producto.

## 3. Sistema de movimiento
Conservar lo que traiga el handoff y completarlo hasta ESTA especificación.
Reglas globales: curva única `cubic-bezier(0.16, 1, 0.3, 1)`; solo `transform`/`opacity`; scroll con
rAF-throttle; todo desactivado con `prefers-reduced-motion`; contenido siempre visible sin JS
(estados iniciales de animación solo bajo clase `.js`).

**3.1 Entrada del hero** (una vez, al cargar; timeline propia, independiente del IntersectionObserver de reveals):
eyebrow 0 ms → H1 120 ms (onda bajo "en el agua"/"in the water" dibujada con stroke-dashoffset, 700 ms,
inicio 400 ms) → subtítulo 260 ms → CTAs 380 ms → tarjeta conceptual 520 ms.
Cada pieza: opacity 0→1 + translateY 16px→0, 600 ms.

**3.2 Ambiente del hero**: deriva caústica con dos radial-gradients en bucle de 14–16 s, opacidad máx 0.22;
burbujas: 10–14 elementos DOM, círculos aqua 3–9 px, blur 1–2 px, opacity 0.12–0.30, ascenso 9–15 s con leve
vaivén, escalonadas, pausadas con reduced-motion y `document.hidden`. Lectura de agua, no de partículas tech.
Levitación de la tarjeta (7 s) se conserva.

**3.3 La firma — flujo "De la señal a la respuesta" ligado al scroll**: línea conectora con relleno de progreso
(`data-flow-fill`) mapeado a p∈[0,1] del scroll de la sección + pulso luminoso (segmento 60–90 px, gradiente
aqua→transparente, viaja según p, drop-shadow aqua sutil). Pasos activados en p ≥ i/6: opacity .45 → color
pleno + halo `0 0 0 6px rgba(0,194,209,.12)`, número en aqua, 300 ms. Paso 06 con p ≥ 0.95: halo y número en
dorado. Móvil ≤980 px: línea vertical, misma lógica. Sin scroll-jacking.

**3.4 Micro**: botón oro con barrido de brillo al hover (pseudo-elemento, gradiente blanco 25 %, 600 ms) además
de la elevación; tarjetas con lift 2 px + borde aqua al hover, unificado; foco visible (outline aqua 2 px,
offset 2 px) en todo interactivo; skip-link.

**3.5 Prohibido**: contador en 300.000/300,000 (estático en ambos idiomas); pantallas simuladas, cifras
biométricas, radares o alertas ficticias; partículas en red, tilt 3D, typing, marquee, scroll-jacking,
autoplay de vídeo.

## 4. Imágenes
* Fotos de los dos huecos (hero y origen) desde el handoff o los archivos que se aporten; si no llegan:
  conservar los slots y marcar `[PENDIENTE-FOTOS]`.
* Servir en AVIF/WebP con fallback y `srcset` responsive; hero con `fetchpriority="high"` y sin lazy;
  origen lazy. `aspect-ratio` reservado (cero CLS).
* Alt por idioma — hero ES: "Niño jugando en una piscina bajo la supervisión de un adulto." /
  EN: "Child playing in a pool under adult supervision." ·
  origen ES: "Taller de prototipado con impresora 3D y electrónica." /
  EN: "Prototyping workshop with a 3D printer and electronics."
* Las fotos de la web van **sin** marca de agua. Opcional (nice-to-have): script `scripts/social-variants` que
  genere copias para redes superponiendo el PNG oficial del logo en esquina inferior derecha al ~65 % de opacidad.

## 5. Vídeo "El origen" (preparado, desactivado)
* Flag `ORIGIN_VIDEO_ENABLED` (por defecto `false`). Con el flag activo, la sección S8 muestra un reproductor
  propio: imagen poster + click-para-reproducir, mp4/webm self-hosted, sin autoplay y sin embeds de terceros,
  con pistas de subtítulos `.vtt` ES y EN.
* Hasta que exista el vídeo: `[PENDIENTE-VÍDEO]` y la sección funciona como ahora con la foto.

## 6. Formulario de lista de espera (preparado, sin activar)
* Campos nombre + email + checkbox de consentimiento obligatorio con el texto del idioma correspondiente;
  validación nativa + honeypot.
* Envío contra `FORM_ENDPOINT` (variable de entorno). No conectar a ningún proveedor todavía.
* Flag `WAITLIST_ENABLED` (por defecto `false`): apagado, el bloque mantiene el diseño pero el CTA es mailto a
  connect@neptorsystems.com con asunto "Lista de espera Neptor" / "Neptor waitlist" según idioma.
  La casilla enlaza a `/privacidad` o `/en/privacy-policy` según idioma.

## 7. Rendimiento y accesibilidad
* Lighthouse móvil ≥ 95 en las cuatro categorías, en las dos rutas (`/` y `/en/`).
* Accesibilidad AA: contraste, jerarquía H1→H3, `aria-hidden` en SVG decorativos, labels reales, navegable por
  teclado, skip-link, reduced-motion completo.

## 8. Entrega y verificación
* README: estructura, comandos, tokens, flags (`WAITLIST_ENABLED`, `ORIGIN_VIDEO_ENABLED`, `FORM_ENDPOINT`), y
  pendientes: hosting y redirecciones www→apex, endpoint del formulario, contenido legal (6 páginas),
  `[PENDIENTE-FOTOS]`/`[PENDIENTE-VÍDEO]` si aplica, alta en Google Search Console y solicitud de reindexación
  tras publicar.
* Checklist final (ejecutar y reportar resultado):
  1. Copy idéntico al diseño aprobado en ES y EN (diff textual por ruta, cero desviaciones).
  2. Grep prohibidos = 0 — ES: `certific`, `garant`, `100 %`, `detecta el ahogamiento`, `salva`, `reloj`,
     `smartwatch`, `patent`, `IA` fuera de los dos contextos permitidos.
     EN: `watch`, `smartwatch`, `detects drowning`, `guarantee`, `certified`, `patented`, `saves lives`,
     `medically`, `AI` fuera de los dos contextos permitidos, `unique in the world`, `100%`.
  3. Disclaimer ("No sustituye la supervisión…" / "It does not replace supervision…") exactamente 2 veces por ruta.
  4. hreflang recíproco válido y canonicals correctos; selector de idioma enlazando URLs equivalentes.
  5. `prefers-reduced-motion`: ambas rutas completas y legibles sin movimiento; teclado 100 % con foco visible.
  6. Lighthouse móvil ≥ 95 ×4 en ambas rutas.
  7. Dos OG images propias, favicon, sitemap con hreflang, robots.
  8. Cero referencias a lovable, r2.dev o recursos de terceros; cero peticiones externas (fuentes y assets self-hosted).
