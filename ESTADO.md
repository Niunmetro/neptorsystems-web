# Estado — Web Neptor Systems

Actualizado: 2026-07-22 06:00 · **IMPLEMENTACIÓN COMPLETA**

## Qué hay
Sitio Astro estático de producción en `D:\NEPTOR-WEB`, construido desde el diseño aprobado
Claude Design v4. Build OK (`npm run build` → 9 páginas). Ver `README.md` para todo el detalle.

- 11 secciones portadas fielmente (S1–S11), copy ES/EN VERBATIM e inmutable (`src/i18n/copy.ts`).
- Rutas: `/`, `/en/`, 3 legales ES + 3 EN (cuerpo `[PENDIENTE]`), 404 bilingüe.
- SEO: canonical + hreflang recíproco + x-default, OG/Twitter por idioma, JSON-LD Organization.
- Fuentes self-hosted (Poppins/DM Sans/Inter, subset latin), 2 críticas con preload. Cero red externa.
- Movimiento portado (`src/scripts/motion.ts`), off con reduced-motion, contenido visible sin JS.
- Assets generados: 2 OG 1200×630, favicon set, manifest, robots, sitemap con hreflang.
- Flags: `WAITLIST_ENABLED`/`ORIGIN_VIDEO_ENABLED`/`FORM_ENDPOINT` (`src/config.ts`).
- Checklist §8 ejecutada sobre `dist` (ver README). 7/8 ✅; Lighthouse pendiente de CI/Chrome.

## Pendientes reales (owner/dirección) — detalle en README §Pendientes
- Hosting + redirección www→apex; endpoint del formulario; texto legal de las 6 páginas.
- `[PENDIENTE-FOTOS]` (hero y origen); `[PENDIENTE-VÍDEO]` (S8).
- ⚠ Logos white/navy: reconstruidos (isotipo real + wordmark en Poppins) porque los oficiales
  1024² superaban el límite de importación del design y llegaron truncados. Sustituir por los
  PNG oficiales en las mismas rutas cuando la dirección los facilite (no toca código).
- Lighthouse móvil ≥95 ×4; alta en Search Console tras publicar.

## Nota de material fuente
`design/` guarda el HTML del handoff, tokens, TTF de Poppins y los scripts de generación de
assets (`gen-assets.cjs`, `fetchfonts.cjs`). No se publica.
