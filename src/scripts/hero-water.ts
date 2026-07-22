/* Neptor Systems — hero underwater shader (WebGL 1, no libraries).
   Replaces the two CSS light blobs with real water: caustics + volumetric sun rays.
   Falls back to the existing CSS ambience ([data-amb] + neptorGlowDrift) when
   WebGL is unavailable, and renders nothing at all under prefers-reduced-motion.
   Budgets: 30 FPS cap, DPR<=1.5, internal scale 0.70, paused when hidden/offscreen. */

type Preset = 'off' | 'suave' | 'alto';

const FPS = 30;
const FRAME_MS = 1000 / FPS;
const DPR_CAP = 1.5;
const RENDER_SCALE = 0.7;

let gl: WebGLRenderingContext | null = null;
let canvas: HTMLCanvasElement | null = null;
let prog: WebGLProgram | null = null;
let uTime: WebGLUniformLocation | null = null;
let uRes: WebGLUniformLocation | null = null;
let uScrollL: WebGLUniformLocation | null = null;
let uIntensityL: WebGLUniformLocation | null = null;

let rafId = 0;
let visible = true;
let onScreen = true;
let started = 0;
let acc = 0;
let last = 0;
let scrollP = 0;
let intensity = 1;

/** Fed by motion.ts's existing rAF-throttled scroll handler (no new listeners). */
export function setHeroScroll(p: number) {
  scrollP = p;
}

const VERT = `attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}`;

const FRAG = `precision mediump float;
uniform float uTime;uniform vec2 uRes;uniform float uScroll;uniform float uIntensity;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){return vnoise(p)*0.65+vnoise(p*2.03+17.3)*0.35;}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;          // y=0 bottom
  vec2 p=vec2(uv.x,1.0-uv.y);            // p.y: 0 top, 1 bottom
  float aspect=uRes.x/max(uRes.y,1.0);
  vec2 auv=vec2(uv.x*aspect,uv.y);

  // (a) depth gradient: lighter near the surface, darker in the deep
  vec3 top=vec3(0.039,0.122,0.267);      // #0A1F44
  vec3 deep=vec3(0.024,0.082,0.184);     // #06152F
  vec3 col=mix(top,deep,smoothstep(0.0,1.0,p.y));

  // (b) caustics: warped value-noise ridges sharpened into thin filaments
  vec2 q=auv*2.1;
  q.y+=uTime*0.010;                      // slow upward drift
  q.y+=uScroll*0.04;                     // 4% parallax with hero scroll
  vec2 w=vec2(fbm(q+uTime*0.020),fbm(q.yx-uTime*0.017));
  float n=fbm(q+w*1.35);
  float ridge=1.0-abs(n*2.0-1.0);
  float caus=smoothstep(0.70,0.97,ridge);
  caus*=smoothstep(1.10,0.20,p.y);       // dimmer with depth
  col+=vec3(0.0,0.761,0.819)*caus*0.17*uIntensity;   // #00C2D1

  // (c) sunlight piercing the water from the UPPER RIGHT: radial god-rays
  //     fanning out from a source just outside the top-right corner.
  vec2 src=vec2(1.06,-0.12);          // the sun, off-canvas upper right
  vec2 d=p-src;
  float r=length(d);                  // distance travelled through the water
  float a=atan(d.y,d.x);              // angle around the source -> the fan
  float sway=sin(uTime*0.16)*0.020;   // the whole shaft bundle drifts slowly
  float s1=vnoise(vec2((a+sway)*9.0,uTime*0.050));
  float s2=vnoise(vec2((a+sway)*19.0+4.0,uTime*0.033));
  float shaft=smoothstep(0.50,0.92,s1*0.65+s2*0.35);   // thin angular shafts
  float atten=exp(-r*1.9);                              // light dies as it sinks
  float depth=smoothstep(0.74,0.04,p.y);                // never reaches the bottom
  vec3 sunCol=mix(vec3(1.0,0.965,0.847),vec3(1.0,0.843,0.0),0.35); // #FFF6D8 / #FFD700
  vec3 rayCol=mix(sunCol,vec3(0.45,0.92,0.95),smoothstep(0.15,0.95,r)); // warm -> aqua with depth
  col+=rayCol*(shaft*atten*depth)*0.22*uIntensity;
  // the glare of the sun itself hitting the surface at that corner
  float glare=exp(-r*r*7.0)*smoothstep(0.95,0.0,p.y);
  col+=sunCol*glare*0.18*uIntensity;

  // (d) left vignette guarantees H1/subtitle contrast, then fine dithering
  float vig=smoothstep(0.62,0.0,uv.x)*0.35;
  col=mix(col,deep,vig);
  col+=(hash(gl_FragCoord.xy)-0.5)*0.0045;

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
    gl.uniform1f(uTime, (now - started) / 1000);
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
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
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

  uTime = gl.getUniformLocation(prog, 'uTime');
  uRes = gl.getUniformLocation(prog, 'uRes');
  uScrollL = gl.getUniformLocation(prog, 'uScroll');
  uIntensityL = gl.getUniformLocation(prog, 'uIntensity');

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
  if (preset === 'off') return;                                               // fallback 3 (forced)
  intensity = preset === 'alto' ? 1.4 : 1.0;
  const go = () => { try { build(); } catch { /* keep CSS fallback */ } };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(go, { timeout: 2000 });
  else setTimeout(go, 300);
}
