/* Neptor Systems — site configuration & feature flags.
   Flags are read at build time. Override FORM_ENDPOINT via an env var. */

export const SITE = 'https://neptorsystems.com';

export const ORG = {
  name: 'NEPTOR SYSTEMS SL',
  vatID: 'B75815704',
  legalForm: 'Sociedad Limitada',
  // Datos registrales (tomo, folio, hoja). Vacío = no se muestra la fila.
  // Cuando la dirección los facilite, poner aquí p.ej. 'Tomo X, Folio Y, Hoja Z' y aparece solo.
  registryDetails: '',
  email: 'connect@neptorsystems.com',
  phone: '+34 652 34 00 14',
  phoneHref: '+34652340014',
  // Registered office (domicilio social) — confirmed by management.
  streetAddress: 'Avenida de Europa 15',
  postalCode: '28224',
  addressLocality: 'Pozuelo de Alarcón',
  addressRegion: 'Madrid',
  addressCountry: 'ES',
};

/* ---- Feature flags ---- */
// Waitlist form: OFF → the block keeps its design but the CTA is a mailto.
export const WAITLIST_ENABLED = false;
// "El origen" self-hosted video player in S8. OFF → photo slot only.
export const ORIGIN_VIDEO_ENABLED = false;
// Form submission endpoint (only used when WAITLIST_ENABLED). Empty until wired.
export const FORM_ENDPOINT = import.meta.env.FORM_ENDPOINT ?? '';

/* ---- Per-language SEO + OG ---- */
export const SEO = {
  es: {
    locale: 'es_ES',
    title: 'Neptor Systems — Seguridad acuática para familias',
    description:
      'Desarrollamos una pulsera acuática sin pantalla conectada a un hub local que gestiona varias pulseras y genera alertas claras. Proyecto en I+D desde Murcia.',
    ogImage: '/og/og-es.png',
    ogAlt: 'Una nueva capa de seguridad para la vida en el agua.',
    htmlLang: 'es',
    home: '/',
  },
  en: {
    locale: 'en_US',
    title: 'Neptor Systems — Water safety for families',
    description:
      'We are developing a screenless aquatic wristband connected to a local hub that manages several wristbands and generates clear alerts. An R&D project from Murcia, Spain.',
    ogImage: '/og/og-en.png',
    ogAlt: 'A new layer of safety for life in the water.',
    htmlLang: 'en',
    home: '/en/',
  },
} as const;

/* ---- Legal route map (used by footer links and the language selector) ---- */
export const LEGAL = {
  es: { legal: '/aviso-legal', privacy: '/privacidad', cookies: '/cookies' },
  en: { legal: '/en/legal-notice', privacy: '/en/privacy-policy', cookies: '/en/cookie-policy' },
} as const;

/* Equivalent-URL map for the ES | EN selector, keyed by page id. */
export const ALT = {
  home: { es: '/', en: '/en/' },
  legal: { es: LEGAL.es.legal, en: LEGAL.en.legal },
  privacy: { es: LEGAL.es.privacy, en: LEGAL.en.privacy },
  cookies: { es: LEGAL.es.cookies, en: LEGAL.en.cookies },
} as const;

export type PageId = keyof typeof ALT;
