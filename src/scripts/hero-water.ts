/* Neptor Systems — hero underwater ambience (WebGL 1, no libraries).
   ─────────────────────────────────────────────────────────────────────────────
   TECHNIQUE (FASE 1 decision):
   (a) Tileable Voronoi caustic texture + dual min() sampling — the standard
   game-graphics approach. A seamless caustic tile is generated ONCE on the CPU
   (toroidal Voronoi: F2−F1 edge distance, inverted and sharpened into thin
   bright filaments forming organic cells). At runtime the fragment shader
   samples that tile twice at non-multiple scales / different drift velocities
   and combines with min(s1, s2): two moving nets intersecting produce the
   characteristic slow caustic dance. Robust by construction (stable pattern,
   2 texture reads), hard to "go weird".
   Studied reference for the quality bar: Evan Wallace, "Rendering Realtime
   Caustics in WebGL" + github.com/evanw/webgl-water (MIT). His full
   heightfield + mesh-refraction pipeline is more than a hero background needs;
   NO third-party code is copied here — everything below is written from
   scratch for this site. (Shadertoy code is CC BY-NC-SA and was NOT used.)
   ─────────────────────────────────────────────────────────────────────────────
   Budgets kept from the previous version: init after first paint
   (requestIdleCallback), 30 FPS cap, DPR ≤ 1.5, internal scale 0.70, full
   pause when document.hidden or hero offscreen, ≤ 12 KB gzip, no libraries.
   Fallbacks: prefers-reduced-motion → no canvas; no WebGL → existing CSS
   ambience ([data-amb] + neptorGlowDrift, kept in CSS on purpose); shader
   active → [data-amb] to opacity 0. DOM bubbles float above the canvas. */

type Preset = 'off' | 'suave' | 'alto';

const FPS = 30;
const FRAME_MS = 1000 / FPS;
const DPR_CAP = 1.5;
const RENDER_SCALE = 0.7;
const TEX = 256;            // caustic tile size (POT → mipmaps)
const CELLS = 18;           // Voronoi feature points in the tile

let gl: WebGLRenderingContext | null = null;
let canvas: HTMLCanvasElement | null = null;
let prog: WebGLProgram | null = null;
let uTime: WebGLUniformLocation | null = null;
let uRes: WebGLUniformLocation | null = null;
let uScrollL: WebGLUniformLocation | null = null;
let uIntensityL: WebGLUniformLocation | null = null;
let uSeedL: WebGLUniformLocation | null = null;

let rafId = 0;
let visible = true;
let onScreen = true;
let started = 0;
let acc = 0;
let last = 0;
let scrollP = 0;
let intensity = 1;
const seed: [number, number] = [Math.random(), Math.random()]; // random initial offsets

/** Fed by motion.ts's existing rAF-throttled scroll handler (no new listeners). */
export function setHeroScroll(p: number) {
  scrollP = p;
}

/* ---- seamless Voronoi caustic tile, generated once on the CPU ----
   Bright thin filaments where F2−F1 ≈ 0 (cell boundaries), toroidal metric so
   the texture tiles with no seams. */
function makeCausticTile(): Uint8Array {
  const pts: number[][] = [];
  for (let i = 0; i < CELLS; i++) pts.push([Math.random(), Math.random()]);
  const data = new Uint8Array(TEX * TEX);
  for (let j = 0; j < TEX; j++) {
    const v = j / TEX;
    for (let i = 0; i < TEX; i++) {
      const u = i / TEX;
      let f1 = 9, f2 = 9;
      for (let k = 0; k < CELLS; k++) {
        let dx = Math.abs(u - pts[k][0]); if (dx > 0.5) dx = 1 - dx; // wrap
        let dy = Math.abs(v - pts[k][1]); if (dy > 0.5) dy = 1 - dy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
      }
      // edge distance → bright filament, sharpened; faint glow inside cells
      const e = Math.max(0, 1 - (f2 - f1) / 0.14);
      let c = Math.pow(e, 3.2) * 0.92 + Math.max(0, 1 - f1 / 0.34) * 0.08;
      data[j * TEX + i] = Math.max(0, Math.min(255, Math.round(c * 255)));
    }
  }
  return data;
}

const VERT = `attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}`;

/* Runtime shader: depth gradient + dual-sampled caustics + 4 gaussian sun
   beams (upper right, 8–18°, sway ±2°, breathing ±20%) + left contrast
   vignette + fine dithering. */
const FRAG = `precision mediump float;
uniform float uTime;uniform vec2 uRes;uniform float uScroll;uniform float uIntensity;
uniform vec2 uSeed;uniform sampler2D uCaustic;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;          // y=0 bottom
  vec2 p=vec2(uv.x,1.0-uv.y);            // p.y: 0 top, 1 bottom
  float aspect=uRes.x/max(uRes.y,1.0);
  vec2 q=vec2(uv.x*aspect,uv.y);         // aspect-corrected (no stretching)
  float t=uTime;

  // depth gradient: #0A1F44 near the surface -> #06152F in the deep
  vec3 top=vec3(0.039,0.122,0.267);
  vec3 deep=vec3(0.024,0.082,0.184);
  vec3 col=mix(top,deep,smoothstep(0.0,1.0,p.y));

  // caustics: two drifting samples of the seamless tile, min() combine.
  // scales 0.62 / 1.07 are non-multiples; velocities differ; slight upward
  // drift (sample-space +y = pattern rises); 4% parallax from uScroll.
  float par=uScroll*0.04;
  vec2 uv1=q*0.62+uSeed        +vec2( t*0.0052, t*0.0090+par);
  vec2 uv2=q*1.07+uSeed.yx*7.3 +vec2(-t*0.0071, t*0.0060+par);
  float caus=min(texture2D(uCaustic,uv1).r,texture2D(uCaustic,uv2).r);
  caus=smoothstep(0.16,0.86,caus);                 // keep filaments crisp after min
  caus*=smoothstep(1.05,0.10,p.y);                 // fade with depth
  col+=vec3(0.0,0.761,0.819)*caus*0.18*uIntensity; // #00C2D1, alpha peak ~0.18

  // volumetric sun beams: 4 gaussians from the top edge, right half,
  // tilted 8-18 deg, sway ±2 deg (14-20 s), breathing ±20% via low-freq noise,
  // extinguished by ~60% of the hero height. Pure gaussians: no hard edges.
  vec3 sunCol=mix(vec3(1.0,0.965,0.847),vec3(1.0,0.843,0.0),0.35); // #FFF6D8/#FFD700
  float beams=0.0;
  for(int i=0;i<4;i++){
    float fi=float(i);
    float cx=0.57+fi*0.115;                                  // top intercepts, right half
    float ang=radians(8.0+fi*3.3)                            // 8..18 deg
             +radians(2.0)*sin(t*6.2832/(14.0+fi*2.0)+fi*2.7); // sway ±2 deg
    float x=p.x-cx+p.y*tan(ang);                             // lean left going down
    float sig=0.030+fi*0.012;                                // widths ~6-14%
    float g=exp(-(x*x)/(2.0*sig*sig));
    float fade=smoothstep(0.60,0.02,p.y);                    // gone by 60% height
    float breathe=1.0+0.2*(vnoise(vec2(t*0.055+fi*7.0,fi*3.1))*2.0-1.0); // ±20%
    beams+=g*fade*breathe;
  }
  col+=sunCol*beams*0.075*uIntensity;                        // alpha 0.05-0.10

  // left vignette keeps H1/subtitle at AA even on the brightest frame
  float vig=smoothstep(0.62,0.0,uv.x)*0.35;
  col=mix(col,deep,vig);
  // fine dithering against banding
  col+=(hash(gl_FragCoord.xy+fract(t))-0.5)*0.0045;

  gl_FragColor=vec4(col,1.0);
}`;

function compile(g: WebGLRenderingContext, type: number, src: string) {
  const s = g.createShader(type);
  if (!s) return null;
  g.shaderSource(s, src);
  g.compileShader(s);
  if (!g.getShaderParameter(s, g.COMPILE_STATUS)) { g.deleteShader(s); return null; }
  return s;
}

function readPreset(): Preset {
  try {
    const v = new URLSearchParams(location.search).get('agua');
    if (v === 'off' || v === 'alto' || v === 'suave') return v;
  } catch { /* ignore */ }
  return 'suave';
}

function resize() {
  if (!canvas || !gl) return;
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  const w = Math.max(1, Math.round(r.width * dpr * RENDER_SCALE));
  const h = Math.max(1, Math.round(r.height * dpr * RENDER_SCALE));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}

function loop(now: number) {
  rafId = 0;
  if (!gl || !prog || !visible || !onScreen) return;   // fully idle when hidden/offscreen
  if (!last) last = now;
  acc += now - last;
  last = now;
  if (acc >= FRAME_MS) {
    acc = Math.min(acc % FRAME_MS, FRAME_MS);
    resize();
    // continuous time, wrapped on a long period (never restarted, no jumps)
    gl.uniform1f(uTime, ((now - started) / 1000) % 3600);
    gl.uniform2f(uRes, canvas!.width, canvas!.height);
    gl.uniform1f(uScrollL, scrollP);
    gl.uniform1f(uIntensityL, intensity);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  rafId = requestAnimationFrame(loop);
}

function kick() {
  if (!rafId && visible && onScreen && gl) { last = 0; rafId = requestAnimationFrame(loop); }
}
function stop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
}

function build() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const host = document.querySelector<HTMLElement>('[data-ambient]');
  const bubbles = document.querySelector<HTMLElement>('[data-bubblefield]');
  if (!hero || !host) return false;

  canvas = document.createElement('canvas');
  canvas.setAttribute('data-water', '');
  canvas.setAttribute('aria-hidden', 'true');
  // bleed 2% past every edge: no visible canvas borders, ever
  canvas.style.cssText = 'position:absolute;inset:-2%;width:104%;height:104%;display:block;';
  // below the bubble field so DOM bubbles keep floating on top
  if (bubbles) host.insertBefore(canvas, bubbles); else host.appendChild(canvas);

  const opts: WebGLContextAttributes = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' };
  gl = (canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts)) as WebGLRenderingContext | null;
  if (!gl) { canvas.remove(); canvas = null; return false; }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); canvas = null; gl = null; return false; }
  prog = gl.createProgram();
  if (!prog) { canvas.remove(); canvas = null; gl = null; return false; }
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); canvas = null; gl = null; prog = null; return false; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // caustic tile: LUMINANCE, REPEAT, trilinear (mipmaps kill mobile moiré)
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, TEX, TEX, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, makeCausticTile());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);

  uTime = gl.getUniformLocation(prog, 'uTime');
  uRes = gl.getUniformLocation(prog, 'uRes');
  uScrollL = gl.getUniformLocation(prog, 'uScroll');
  uIntensityL = gl.getUniformLocation(prog, 'uIntensity');
  uSeedL = gl.getUniformLocation(prog, 'uSeed');
  gl.uniform1i(gl.getUniformLocation(prog, 'uCaustic'), 0);
  gl.uniform2f(uSeedL, seed[0], seed[1]);

  resize();
  started = performance.now();

  // shader is live -> retire the CSS light blobs (kept in CSS as the fallback)
  document.querySelectorAll<HTMLElement>('[data-amb]').forEach((el) => { el.style.opacity = '0'; });

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) kick(); else stop();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      onScreen = es.some((e) => e.isIntersecting);
      if (onScreen) kick(); else stop();
    }, { threshold: 0 }).observe(hero);
  }
  window.addEventListener('resize', resize, { passive: true });

  kick();
  return true;
}

/** Init after first paint; never blocks LCP. */
export function initHeroWater() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;  // fallback 1
  const preset = readPreset();
  if (preset === 'off') return;                                               // forced CSS fallback
  intensity = preset === 'alto' ? 1.4 : 1.0;
  const go = () => { try { build(); } catch { /* keep CSS fallback */ } };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(go, { timeout: 2000 });
  else setTimeout(go, 300);
}
