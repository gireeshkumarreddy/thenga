'use client';
import { useEffect, useId, useRef } from 'react';
import { introState } from './intro-state';

// Vector Kerala foliage: coconut fronds, banana leaves and single leaflets.
// Drawn pointing up with the stem at the bottom centre, so a rotation of
// (angle + 90deg) points a leaf outward from whatever it surrounds.
type Tone = 'deep' | 'mid' | 'bright';
const tones: Record<Tone, [string, string, string]> = {
 deep: ['#0f3a22', '#1d5a32', '#2f7a3f'],
 mid: ['#1c6234', '#3b8f45', '#6fb04c'],
 bright: ['#3a8a3e', '#79b84a', '#b9dc6a'],
};

function frondGeometry(bend: number, count: number) {
 const P0 = [100, 396], P1 = [100 + bend * .15, 200], P2 = [100 + bend, 8];
 const at = (t: number) => [0, 1].map(k => (1 - t) ** 2 * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]);
 const tangent = (t: number) => { const v = [0, 1].map(k => 2 * (1 - t) * (P1[k] - P0[k]) + 2 * t * (P2[k] - P1[k])); const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
 const sides = [-1, 1].map(side => {
  let d = '';
  for (let i = 0; i < count; i++) {
   const t = .08 + .9 * i / (count - 1);
   const [bx, by] = at(t), [tx, ty] = tangent(t);
   const len = (24 + 78 * Math.sin(Math.PI * Math.min(.98, t * .92 + .04)) ** .7) * (1 - t * .35);
   const ang = (62 - 30 * t) * Math.PI / 180 * side;
   const dx = tx * Math.cos(ang) - ty * Math.sin(ang), dy = tx * Math.sin(ang) + ty * Math.cos(ang);
   // Leaflets droop back toward the base and arc slightly.
   const ex = bx + dx * len - tx * len * .22, ey = by + dy * len - ty * len * .22 + len * .12;
   const px = -dy, py = dx, w = len * .1, mx = bx + dx * len * .5, my = by + dy * len * .5;
   d += `M${bx.toFixed(1)},${by.toFixed(1)}Q${(mx + px * w * side).toFixed(1)},${(my + py * w * side).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}Q${(mx - px * w * .3 * side).toFixed(1)},${(my - py * w * .3 * side).toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}Z`;
  }
  return d;
 });
 const rachis = `M${P0[0]},${P0[1]}Q${P1[0]},${P1[1]} ${P2[0]},${P2[1]}`;
 return { rachis, left: sides[0], right: sides[1] };
}
const frondShapes = [frondGeometry(-34, 38), frondGeometry(30, 34)];
const bananaVeins = Array.from({ length: 15 }, (_, k) => { const y = 372 - k * 24; const s = Math.sin(Math.PI * (k + 1) / 16); return `M60,${y}L${(60 - 44 * s).toFixed(1)},${y - 26}M60,${y}L${(60 + 44 * s).toFixed(1)},${y - 26}`; }).join('');

export function Frond({ variant = 0, tone = 'mid', className, style }: { variant?: number; tone?: Tone; className?: string; style?: React.CSSProperties }) {
 const id = useId().replace(/:/g, ''); const f = frondShapes[variant % frondShapes.length]; const [a, b, c] = tones[tone];
 return <svg className={className} style={style} viewBox="0 0 200 400" aria-hidden="true">
  <defs><linearGradient id={`${id}g`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={a} /><stop offset=".55" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient></defs>
  <path d={f.left} fill={`url(#${id}g)`} /><path d={f.right} fill={`url(#${id}g)`} opacity=".86" />
  <path d={f.rachis} fill="none" stroke="#c8b46a" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
 </svg>;
}
export function BananaLeaf({ tone = 'mid', className, style }: { tone?: Tone; className?: string; style?: React.CSSProperties }) {
 const id = useId().replace(/:/g, ''); const [a, b, c] = tones[tone];
 return <svg className={className} style={style} viewBox="0 0 120 400" aria-hidden="true">
  <defs><linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={a} /><stop offset=".5" stopColor={c} /><stop offset="1" stopColor={b} /></linearGradient></defs>
  <path d="M60,400C8,330 2,130 60,6C118,130 112,330 60,400Z" fill={`url(#${id}g)`} />
  <path d={bananaVeins} stroke="#0b2a17" strokeWidth=".9" opacity=".35" fill="none" />
  <path d="M60,400L60,8" stroke="#e3d58c" strokeWidth="2.4" opacity=".75" />
  <path d="M8,250L32,262M112,170L88,186" stroke="#0a1a12" strokeWidth="2.2" />
 </svg>;
}
export function Leaflet({ tone = 'bright', className, style }: { tone?: Tone; className?: string; style?: React.CSSProperties }) {
 const [, b, c] = tones[tone];
 return <svg className={className} style={style} viewBox="0 0 40 200" aria-hidden="true">
  <path d="M20,200Q0,96 20,0Q40,96 20,200Z" fill={c} /><path d="M20,200Q12,96 20,0" fill={b} opacity=".55" /><path d="M20,198L20,4" stroke="#e8dc96" strokeWidth="1" opacity=".7" />
 </svg>;
}

type Item = { kind: 'frond' | 'banana' | 'leaflet' | 'nut' | 'drop'; a: number; r: number; size: number; tilt: number; depth: number; tone?: Tone; variant?: number; dir: number; phase: number; burst: number };
// Angles: 0 = right, 90 = down. The upper-left quadrant stays clear for the headline.
const leaves: Item[] = [
 { kind: 'frond', a: -40, r: .17, size: .7, tilt: 8, depth: -1, tone: 'deep', dir: 1, phase: 0, burst: 1.1 },
 { kind: 'frond', a: 48, r: .18, size: .6, tilt: -10, depth: -1, tone: 'mid', variant: 1, dir: -1, phase: 1.4, burst: 1.3 },
 { kind: 'frond', a: 134, r: .18, size: .58, tilt: 12, depth: -1, tone: 'deep', variant: 1, dir: 1, phase: 2.1, burst: 1.2 },
 { kind: 'banana', a: 96, r: .16, size: .5, tilt: 18, depth: -1, tone: 'mid', dir: -1, phase: .7, burst: 1.4 },
 { kind: 'banana', a: -70, r: .17, size: .46, tilt: -14, depth: -1, tone: 'deep', dir: 1, phase: 2.8, burst: 1.5 },
 { kind: 'frond', a: 122, r: .2, size: .5, tilt: -6, depth: -1, tone: 'mid', dir: 1, phase: 3.3, burst: 1.6 },
 { kind: 'leaflet', a: 80, r: .3, size: .2, tilt: 18, depth: 1, tone: 'bright', dir: -1, phase: 1.1, burst: 1.8 },
 { kind: 'leaflet', a: 62, r: .3, size: .22, tilt: -20, depth: 1, tone: 'bright', dir: 1, phase: 2.4, burst: 2 },
 { kind: 'banana', a: 50, r: .27, size: .28, tilt: 26, depth: 1, tone: 'bright', dir: -1, phase: 4.2, burst: 1.9 },
 { kind: 'leaflet', a: 112, r: .3, size: .18, tilt: 30, depth: 1, tone: 'mid', dir: 1, phase: .3, burst: 2.2 },
 { kind: 'frond', a: -38, r: .3, size: .3, tilt: 22, depth: 1, tone: 'bright', variant: 1, dir: 1, phase: 5.1, burst: 1.7 },
 { kind: 'leaflet', a: -50, r: .32, size: .17, tilt: -26, depth: 1, tone: 'mid', dir: -1, phase: 3.7, burst: 2.1 },
];
const nuts: Item[] = Array.from({ length: 7 }, (_, i) => ({ kind: 'nut', a: i * 360 / 7 + 14, r: .46 + (i % 3) * .08, size: .13 + (i % 3) * .045, tilt: i * 47, depth: i % 2 ? 1 : -1, dir: i % 2 ? 1 : -1, phase: i * 1.7, burst: 1 }));
const drops: Item[] = Array.from({ length: 16 }, (_, i) => ({ kind: 'drop', a: i * 22.5 + (i % 3) * 7, r: .42 + (i % 4) * .09, size: .012 + (i % 3) * .006, tilt: 0, depth: 1, dir: 1, phase: i, burst: 1 }));
const items = [...leaves, ...nuts, ...drops];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (a: number, b: number, n: number) => { const x = clamp((n - a) / (b - a)); return x * x * (3 - 2 * x); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const backOut = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;

function Piece({ item }: { item: Item }) {
 if (item.kind === 'frond') return <Frond variant={item.variant} tone={item.tone} />;
 if (item.kind === 'banana') return <BananaLeaf tone={item.tone} />;
 if (item.kind === 'leaflet') return <Leaflet tone={item.tone} />;
 if (item.kind === 'nut') return <img src="/assets/coconut.png" alt="" draggable={false} />;
 return <i />;
}
const aspect = (item: Item) => item.kind === 'frond' ? .5 : item.kind === 'banana' ? .3 : item.kind === 'leaflet' ? .2 : 1;

// Scroll-driven foliage around the coconut and can. It frames the whole nut,
// bursts outward as the shell cracks open, releases more coconuts, then
// gathers back in a spiral around the can before drifting away.
export default function Flora({ progress }: { progress: React.RefObject<number> }) {
 const back = useRef<HTMLDivElement>(null), front = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const stage = back.current?.parentElement; if (!stage || !back.current || !front.current) return;
  const nodes = items.map((_, i) => (items[i].depth < 0 ? back.current! : front.current!).querySelector<HTMLElement>(`[data-i="${i}"]`)!);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 1, h = 1, B = 1, hero = [0, 0], scene = [0, 0], frame = 0, last = performance.now(), time = 0;
  let tx = 0, ty = 0, mx = 0, my = 0, inView = true, sceneFound = false, ticks = 0;
  const measure = () => {
   w = stage.clientWidth; h = stage.clientHeight; B = Math.min(h, w * 1.45);
   const img = stage.querySelector<HTMLElement>('.hero-coconut'), three = stage.querySelector<HTMLElement>('.three-stage');
   hero = img ? [img.offsetLeft + img.offsetWidth / 2, img.offsetTop + img.offsetHeight / 2] : [w / 2, h / 2];
   scene = three ? [three.offsetLeft + three.offsetWidth / 2, three.offsetTop + three.offsetHeight * .538] : [w / 2, h * .54]; sceneFound = !!three;
  };
  const ro = new ResizeObserver(measure); ro.observe(stage); measure();
  const io = new IntersectionObserver(e => { inView = e[0].isIntersecting; }); io.observe(stage);
  const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; };
  addEventListener('pointermove', onMove, { passive: true });
  // Tap or click the stage to shake loose a handful of leaves and droplets.
  const onDown = (e: PointerEvent) => {
   if (reduced || (e.target as HTMLElement).closest('button,a')) return;
   const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
   for (let k = 0; k < 14; k++) {
    const leaf = k < 9, el = document.createElement('span'); el.className = leaf ? 'flora-spark leaf' : 'flora-spark drop';
    if (leaf) el.style.setProperty('--hue', `${85 + (k * 13) % 40}`);
    front.current!.appendChild(el);
    const ang = (k / 14) * Math.PI * 2 + Math.random() * .5, dist = 70 + Math.random() * 150, spin = (Math.random() - .5) * 720;
    el.animate([
     { transform: `translate(${x}px,${y}px) rotate(0deg) scale(.3)`, opacity: 1 },
     { transform: `translate(${x + Math.cos(ang) * dist}px,${y + Math.sin(ang) * dist * .7}px) rotate(${spin * .6}deg) scale(1)`, opacity: 1, offset: .45 },
     { transform: `translate(${x + Math.cos(ang) * dist * 1.25}px,${y + Math.sin(ang) * dist + 160}px) rotate(${spin}deg) scale(.8)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => el.remove();
   }
  };
  stage.addEventListener('pointerdown', onDown);
  const render = () => {
   frame = requestAnimationFrame(render); const now = performance.now(), dt = Math.min(60, now - last); last = now;
   if (document.hidden || !inView) return;
   if (!sceneFound && ++ticks % 30 === 0) measure();
   if (!reduced && !document.documentElement.classList.contains('motion-paused')) time += dt * .001;
   mx += (tx - mx) * .06; my += (ty - my) * .06;
   const p = progress.current ?? 0;
   const toScene = smooth(.05, .12, p), cx = mix(hero[0], scene[0], toScene), cy = mix(hero[1], scene[1], toScene);
   const crack = smooth(.15, .27, p), closeUp = smooth(.45, .56, p), burst = crack * (1 - closeUp);
   const can = smooth(.55, .69, p) * (1 - smooth(.8, .9, p)), exit = smooth(.82, .93, p);
   const pop = smooth(.18, .3, p) * (1 - smooth(.47, .55, p)) + can, splash = smooth(.16, .23, p) * (1 - smooth(.25, .34, p));
   items.forEach((it, i) => {
    const el = nodes[i]; const s = it.size * B, ww = s * aspect(it);
    let ang = it.a + p * 140 * it.dir + Math.sin(time * .4 + it.phase) * 4, rx = it.r, ry = it.r, op = 1, scale = 1, rot = 0;
    if (it.kind === 'nut') {
     ang += time * 6 * it.dir; const rr = mix(it.r, it.r * .85, can); rx = rr * pop * mix(1, .9, can); ry = rr * pop * mix(1, 1.15, can);
     op = clamp(pop * 1.4) * (1 - exit); scale = .4 + .6 * clamp(pop); rot = it.tilt + time * 18 * it.dir + p * 360 * it.dir;
    } else if (it.kind === 'drop') {
     rx = ry = it.r * splash * 1.3; op = splash * 1.6; scale = .5 + splash;
    } else {
     // Leaves: hug the nut, fly out on the crack, then spiral back to frame the can.
     const out = 1 + burst * it.burst * (1 - can), drift = 1 + exit * 1.4;
     rx = it.r * out * mix(1, .78, can) * drift; ry = it.r * out * mix(1, 1.3, can) * drift;
     ang += burst * 50 * it.dir + can * 180 * it.dir;
     op = (it.depth > 0 ? mix(1, .5, burst) : 1) * (1 - exit);
     rot = ang + 90 + it.tilt + Math.sin(time * 1.1 + it.phase) * 5 + burst * 25 * it.dir;
     // After the logo intro, each leaf unfurls outward from behind the coconut in turn.
     const b = clamp(introState.bloom * 1.7 - i * .06);
     rx *= mix(.35, 1, b); ry *= mix(.35, 1, b); rot -= (1 - b) * 55 * it.dir; scale = backOut(b); op *= clamp(b * 3);
    }
    const par = it.depth * (it.kind === 'nut' ? 26 : 38), rad = ang * Math.PI / 180;
    const x = cx + Math.cos(rad) * rx * B + mx * par, y = cy + Math.sin(rad) * ry * B + my * par + (exit * -.25 * h * (it.depth > 0 ? 1.3 : 1));
    const bob = it.kind === 'nut' ? Math.sin(time * 1.3 + it.phase) * 6 : 0;
    el.style.width = `${ww}px`; el.style.height = `${s}px`;
    el.style.opacity = op.toFixed(3);
    el.style.transform = it.kind === 'nut' || it.kind === 'drop'
     ? `translate3d(${x - ww / 2}px,${y - s / 2 + bob}px,0) rotate(${rot}deg) scale(${scale})`
     : `translate3d(${x - ww / 2}px,${y - s}px,0) rotate(${rot}deg) scale(${scale})`;
   });
  };
  render();
  return () => { cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove); stage.removeEventListener('pointerdown', onDown); };
 }, [progress]);
 const layer = (depth: number) => items.map((it, i) => (it.depth < 0) === (depth < 0) ? <span key={i} data-i={i} className={`flora-item ${it.kind}`}><Piece item={it} /></span> : null);
 return <>
  <div className="flora flora-back" ref={back} aria-hidden="true">{layer(-1)}</div>
  <div className="flora flora-front" ref={front} aria-hidden="true">{layer(1)}</div>
 </>;
}
