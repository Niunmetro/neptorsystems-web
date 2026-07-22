/* Neptor Systems — motion.
   Ported from the approved Claude Design v4 runtime, de-Reactified for the static build.
   Rules: transform/opacity only, single ease, rAF-throttled scroll, everything off under
   prefers-reduced-motion, and content is always visible without JS (this script only
   hides-then-reveals; if it never runs, nothing is hidden). */

const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  raf: 0 as number,
  solid: null as boolean | null,
  navActive: null as string | null,
  flowActive: -1,
  flowGold: false,
  flowInit: false,
  rvIO: null as IntersectionObserver | null,
};

/* ---- bubbles: few, slow, blurred — water, not "tech" ---- */
function initBubbles() {
  const field = document.querySelector<HTMLElement>('[data-bubblefield]');
  if (!field || field.childElementCount || reduce) return;
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span');
    s.setAttribute('data-bubble', '');
    const size = (3 + Math.random() * 6).toFixed(1);
    s.style.cssText =
      'position:absolute;bottom:-12px;left:' + (4 + Math.random() * 92).toFixed(2) + '%;width:' + size +
      'px;height:' + size + 'px;border-radius:50%;background:var(--aqua-500);filter:blur(' +
      (1 + Math.random()).toFixed(2) + 'px);--o:' + (0.12 + Math.random() * 0.18).toFixed(3) + ';--sway:' +
      Math.round(Math.random() * 24 - 12) + 'px;opacity:0;animation:neptorBubble ' +
      (9 + Math.random() * 6).toFixed(1) + 's linear infinite;animation-delay:' +
      (-Math.random() * 15).toFixed(1) + 's;';
    field.appendChild(s);
  }
}

/* ---- hero entrance (load choreography, once) ---- */
function initHeroIntro() {
  if (reduce) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-hs]'));
  const delays = [0, 120, 260, 380, 440, 500, 560];
  els.forEach((el, i) => {
    const d = delays[i] != null ? delays[i] : i * 90;
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition =
      'opacity .6s ' + EASE + ' ' + d + 'ms, transform .6s ' + EASE + ' ' + d + 'ms';
  });
  const wave = document.querySelector<SVGPathElement>('[data-h1wave]');
  if (wave && (wave as any).getTotalLength) {
    const L = wave.getTotalLength();
    wave.style.strokeDasharray = L + ' ' + L;
    wave.style.strokeDashoffset = String(L);
    wave.style.transition = 'stroke-dashoffset .7s ' + EASE + ' .4s';
  }
  setTimeout(() => {
    els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    if (wave) wave.style.strokeDashoffset = '0';
  }, 40);
  // safety: nothing may stay hidden, whatever happens
  setTimeout(() => {
    document.querySelectorAll<HTMLElement>('[data-hs]').forEach((el) => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
    if (wave) wave.style.strokeDashoffset = '0';
    document.querySelectorAll<HTMLElement>('[data-rv]').forEach((g) => {
      ((g as any).__rvKids || []).forEach((k: HTMLElement) => { k.style.opacity = '1'; k.style.transform = 'none'; });
    });
  }, 2500);
}

/* ---- scroll reveal: fade + 14px, children staggered 70ms ---- */
function initReveals() {
  if (reduce || !('IntersectionObserver' in window)) return;
  state.rvIO = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      ((e.target as any).__rvKids || []).forEach((k: HTMLElement) => { k.style.opacity = '1'; k.style.transform = 'none'; });
      state.rvIO!.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const vh = window.innerHeight;
  document.querySelectorAll<HTMLElement>('[data-rv]').forEach((g) => {
    if (g.getBoundingClientRect().top < vh * 0.85) return;
    const kids = g.hasAttribute('data-rv-self') ? [g] : Array.from(g.children) as HTMLElement[];
    if (!kids.length) return;
    kids.forEach((k, i) => {
      k.style.opacity = '0';
      k.style.transform = 'translateY(14px)';
      k.style.transition =
        'opacity .56s ' + EASE + ' ' + (i * 70) + 'ms, transform .56s ' + EASE + ' ' + (i * 70) + 'ms';
    });
    (g as any).__rvKids = kids;
    state.rvIO!.observe(g);
  });
}

function onScroll() {
  if (state.raf) return;
  state.raf = requestAnimationFrame(() => {
    state.raf = 0;
    const y = window.scrollY;
    updateNav(y);
    updateSpy();
    updateFlow();
    updateParallax(y);
  });
}

function updateNav(y: number) {
  const h = document.querySelector<HTMLElement>('[data-header]');
  if (!h) return;
  const solid = y > window.innerHeight * 0.75;
  if (solid !== state.solid) {
    state.solid = solid;
    h.style.background = solid ? 'rgba(255,255,255,0.88)' : 'rgba(6,21,47,0.35)';
    h.style.borderBottomColor = solid ? 'var(--line-200)' : 'rgba(255,255,255,0.10)';
    h.style.boxShadow = solid ? 'var(--shadow-sm)' : 'none';
    const logo = h.querySelector<HTMLImageElement>('[data-logo]');
    if (logo) logo.src = solid ? '/assets/logo-neptor-navy.png' : '/assets/logo-neptor-white.png';
  }
  h.querySelectorAll<HTMLElement>('[data-navlink]').forEach((a) => {
    const active = a.getAttribute('href') === state.navActive;
    if (state.solid) {
      a.style.color = active ? 'var(--aqua-700)' : 'var(--navy-800)';
      a.style.background = active ? 'var(--aqua-050)' : 'transparent';
    } else {
      a.style.color = active ? '#fff' : 'rgba(255,255,255,0.85)';
      a.style.background = active ? 'rgba(0,194,209,0.16)' : 'transparent';
    }
  });
  h.querySelectorAll<HTMLElement>('[data-langlink]').forEach((b) => {
    const on = b.getAttribute('aria-current') === 'true';
    b.style.color = state.solid ? (on ? 'var(--navy-800)' : 'var(--ink-400)') : (on ? '#fff' : 'rgba(255,255,255,0.6)');
  });
  const sep = h.querySelector<HTMLElement>('[data-langsep]');
  if (sep) sep.style.color = state.solid ? 'rgba(10,31,68,0.25)' : 'rgba(255,255,255,0.35)';
}

function updateSpy() {
  const mid = window.innerHeight * 0.4;
  const ids = ['#que-es', '#como-funciona', '#estado', '#colabora'];
  let current: string | null = null;
  ids.forEach((id) => {
    const el = document.querySelector(id);
    if (el && el.getBoundingClientRect().top <= mid) current = id;
  });
  state.navActive = current;
  const rail = ['#top', '#que-es', '#solucion', '#como-funciona', '#estado', '#colabora'];
  let railCurrent = '#top';
  rail.forEach((id) => {
    const el = document.querySelector(id);
    if (el && el.getBoundingClientRect().top <= mid) railCurrent = id;
  });
  document.querySelectorAll<HTMLElement>('[data-raildot]').forEach((d) => {
    const on = d.getAttribute('href') === railCurrent;
    d.style.background = on ? 'var(--aqua-500)' : 'rgba(0,194,209,0.35)';
    d.style.height = on ? '22px' : '8px';
    d.style.boxShadow = on ? '0 0 0 3px rgba(0,194,209,0.15)' : 'none';
  });
}

function updateFlow() {
  if (reduce) return;
  const steps = document.querySelectorAll<HTMLElement>('[data-step]');
  if (!steps.length) return;
  let p: number;
  if (window.innerWidth <= 980) {
    const grid = document.querySelector<HTMLElement>('[data-flow]');
    if (!grid) return;
    const r = grid.getBoundingClientRect();
    p = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - r.top) / (r.height || 1)));
    const vf = document.querySelector<HTMLElement>('[data-flow-vfill]');
    const vp = document.querySelector<HTMLElement>('[data-flow-vpulse]');
    if (vf) vf.style.height = (p * 100).toFixed(2) + '%';
    if (vp) vp.style.top = (p * 100).toFixed(2) + '%';
  } else {
    const wrap = document.querySelector<HTMLElement>('[data-flow-wrap]');
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    const fill = document.querySelector<HTMLElement>('[data-flow-fill]');
    const head = document.querySelector<HTMLElement>('[data-flow-head]');
    if (fill) fill.style.width = (p * 100).toFixed(2) + '%';
    if (head) { head.style.display = 'block'; head.style.left = (p * 100).toFixed(2) + '%'; }
  }
  const active = Math.min(5, Math.floor(p * 6.001));
  const gold = p >= 0.95;
  if (active === state.flowActive && gold === state.flowGold && state.flowInit) return;
  state.flowActive = active; state.flowGold = gold; state.flowInit = true;
  steps.forEach((s, i) => {
    const on = i <= active;
    const isFinal = i === 5 && gold;
    const tile = s.querySelector<HTMLElement>('[data-tile]');
    const num = s.querySelector<HTMLElement>('[data-num]');
    const lbl = s.querySelector<HTMLElement>('[data-lbl]');
    if (tile) {
      tile.style.opacity = on ? '1' : '0.45';
      tile.style.boxShadow = on
        ? (isFinal ? '0 0 0 2px var(--gold-500), 0 0 0 8px rgba(255,215,0,0.18)' : '0 0 0 6px rgba(0,194,209,0.12)')
        : 'none';
    }
    if (num) num.style.color = on ? (isFinal ? 'var(--gold-600)' : 'var(--aqua-700)') : 'var(--ink-400)';
    if (lbl) lbl.style.color = on ? 'var(--navy-800)' : 'var(--ink-400)';
  });
}

function updateParallax(y: number) {
  if (reduce) return;
  const ph = document.querySelector<HTMLElement>('[data-hero-photo]');
  if (ph) ph.style.transform = 'translateY(' + Math.min(y, 800) * 0.05 + 'px)';
  const pu = document.querySelector<HTMLElement>('[data-plxup]');
  if (pu && pu.style.opacity !== '0') {
    const r = pu.getBoundingClientRect();
    const vis = 1 - Math.min(1, Math.max(0, r.top / window.innerHeight));
    pu.style.transform = 'translateY(' + ((0.5 - vis) * 26).toFixed(1) + 'px)';
  }
}

/* pause hero ambience when tab is hidden (battery + calm) */
function handleVisibility() {
  const on = document.hidden ? 'paused' : 'running';
  document.querySelectorAll<HTMLElement>('[data-bubble],[data-amb]').forEach((n) => {
    n.style.animationPlayState = on;
  });
}

function boot() {
  initHeroIntro();
  initReveals();
  initBubbles();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
