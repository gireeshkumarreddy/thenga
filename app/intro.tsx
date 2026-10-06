'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Frond } from './flora';
import { introState } from './intro-state';

// Opaque bounds of /assets/coconut.png as fractions of the square image.
const NUT = { width: .801, centerX: .5125, bottom: .951 };
type Tone = 'deep' | 'mid' | 'bright';
// A palm crown seen from below: fronds radiating behind the wordmark.
const crown = [1, .78, .92, .7, .96, .8, 1, .74, .9, .84].map((length, i) => ({
 length, angle: i * 36 + (i % 2 ? 9 : -5), tone: (['mid', 'deep', 'bright'] as Tone[])[i % 3], variant: i % 2, opacity: [.6, .45, .32][i % 3],
}));
// Water thrown up when the coconut lands.
const splash = Array.from({ length: 9 }, (_, i) => {
 const a = Math.PI * (1.12 + .76 * i / 8), dist = 70 + (i % 3) * 38;
 return { dx: Math.cos(a) * dist, up: -Math.sin(a) * dist * .9, fall: 70 + (i % 2) * 45 };
});
const IMPACT = .7 + 1.25 * .3636; // first contact of bounce.out
// The finished lockup holds from ~2.9s to EXIT: the frame people pause on.
const EXIT = 3.65, MOVE = EXIT + .12, FLIGHT = 1.45, ENTER = MOVE + FLIGHT * .6;

// Logo intro: the letters rise, a coconut drops in as the full stop, a palm
// crown fans open behind the lockup, then the wordmark shrinks into the header
// logo while the coconut flies to its place in the hero and the green drains
// into it. Any click, scroll or key fast-forwards it.
export default function Intro({ onDone, prepare }: { onDone: (instant: boolean) => void; prepare?: () => Promise<unknown> }) {
 const root = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const el = root.current; if (!el) return;
  const html = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.display = 'none'; onDone(true); return; }
  introState.bloom = 0;
  html.classList.add('intro-running');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, behavior: 'instant' });
  let cancelled = false, fast = false, handed = false;
  let tl: gsap.core.Timeline | undefined, ctx: gsap.Context | undefined;
  const skip = () => { fast = true; tl?.timeScale(4); };
  const block = (e: Event) => { e.preventDefault(); skip(); };
  const keys = [' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Enter', 'Escape'];
  const onKey = (e: KeyboardEvent) => { if (keys.includes(e.key)) { e.preventDefault(); skip(); } };
  const onResize = () => tl?.progress(1);
  addEventListener('wheel', block, { passive: false });
  addEventListener('touchmove', block, { passive: false });
  addEventListener('keydown', onKey);
  addEventListener('resize', onResize);
  el.addEventListener('pointerdown', skip);
  const release = () => {
   removeEventListener('wheel', block); removeEventListener('touchmove', block); removeEventListener('keydown', onKey);
   removeEventListener('resize', onResize); el.removeEventListener('pointerdown', skip);
  };
  const handoff = () => {
   if (handed) return; handed = true;
   // Same frame: the real logo and hero coconut appear exactly where the intro's copies landed.
   html.classList.remove('intro-running'); el.style.display = 'none'; release(); onDone(fast);
   const mark = document.querySelector('.site-header .brand > span');
   if (mark) gsap.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: .6, clearProps: 'opacity' });
  };
  const coconut = el.querySelector<HTMLImageElement>('.intro-coconut')!;

  const build = () => {
   const q = gsap.utils.selector(el), W = innerWidth, H = innerHeight;
   // Where the hero coconut rests, ignoring transforms (its stage is pinned at the top).
   const hero = document.querySelector<HTMLImageElement>('.hero-coconut');
   let S = Math.min(W, H) * .6, hx = W / 2, hy = H * .55;
   if (hero) {
    const stage = (hero.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    S = Math.min(hero.offsetWidth, hero.offsetHeight);
    hx = (stage?.left ?? 0) + hero.offsetLeft + hero.offsetWidth / 2; hy = (stage?.top ?? 0) + hero.offsetTop + hero.offsetHeight / 2;
   }
   // The coconut's body sits on the baseline as the wordmark's full stop.
   const slot = q('.intro-slot')[0].getBoundingClientRect();
   const k = slot.width / (S * NUT.width), sx = slot.left + slot.width / 2, sy = slot.bottom;
   const tx = sx - hx - k * S * (NUT.centerX - .5), ty = sy - hy - k * S * (NUT.bottom - .5);
   // Map the intro wordmark's glyphs onto the header logo's glyphs.
   const word = q('.intro-word')[0] as HTMLElement, letters = q('.ic > span') as HTMLElement[];
   const textRect = (n: Node) => { const r = document.createRange(); r.selectNodeContents(n); return r.getBoundingClientRect(); };
   const first = textRect(letters[0].firstChild!), last = textRect(letters[letters.length - 1].firstChild!), box = word.getBoundingClientRect();
   const brand = document.querySelector('.site-header .brand')?.firstChild;
   let wk = .14, wx = 24 - box.left, wy = 24 - box.top;
   if (brand) {
    const b = textRect(brand); wk = b.width / (last.right - first.left);
    wx = b.left - box.left - wk * (first.left - box.left); wy = b.top - box.top - wk * (first.top - box.top);
   }
   const fs = parseFloat(getComputedStyle(q('.intro-mark')[0] as HTMLElement).fontSize);
   const panel = q('.intro-panel')[0], fronds = q('.intro-frond'), ml = q('.intro-ml'), tag = q('.intro-tag span'), line = q('.intro-line');
   const ripple = q('.intro-ripple'), shadow = q('.intro-shadow'), drops = q('.intro-drop');

   gsap.set(q('.intro-wait'), { animation: 'none' });
   gsap.set(q('.intro-mark, .intro-ml, .intro-tag'), { visibility: 'visible' });
   gsap.set(letters, { yPercent: 120, rotation: 8 });
   gsap.set(word, { transformOrigin: '0 0' });
   gsap.set(ml, { opacity: 0, y: 14 });
   gsap.set(tag, { opacity: 0, y: 10 });
   gsap.set(line, { scaleX: 0 });
   gsap.set(fronds, { rotation: 0, scale: 0, opacity: 0, transformOrigin: '50% 100%' });
   gsap.set(coconut, { left: hx - S / 2, top: hy - S / 2, width: S, height: S, x: tx, y: -hy - k * S - 40, scale: k, rotation: -230, opacity: 1 });
   gsap.set(shadow, { x: sx, y: sy, width: slot.width * 1.15, height: slot.width * .2, xPercent: -50, yPercent: -50, scale: .2, opacity: 0 });
   gsap.set(ripple, { x: sx, y: sy, scale: .05, opacity: 0 });
   gsap.set(drops, { x: sx, y: sy, opacity: 0 });

   tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
   if (fast) tl.timeScale(4);
   tl.to(q('.intro-wait'), { opacity: 0, scale: .2, duration: .3, ease: 'power2.in' }, 0)
    // 1. The letters rise out of their masks.
    .to(letters, { yPercent: 0, rotation: 0, duration: 1.05, stagger: .075 }, .12)
    // 2. The coconut drops in, spinning, and bounces into place.
    .to(coconut, { y: ty, duration: 1.25, ease: 'bounce.out' }, .7)
    .to(coconut, { rotation: 0, duration: 1.25, ease: 'power3.out' }, .7)
    .to(shadow, { scale: 1, opacity: .5, duration: 1.25, ease: 'bounce.out' }, .7)
    .to(coconut, { scaleX: k * 1.14, scaleY: k * .86, duration: .07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, IMPACT - .03)
    // The impact ripples back through the letters and throws up water.
    .to(q('.ic'), { y: -fs * .06, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1, stagger: { each: .045, from: 'end' } }, IMPACT)
    .set(ripple, { opacity: .9 }, IMPACT)
    .to(ripple, { scale: 1, duration: 1.1, ease: 'power2.out' }, IMPACT)
    .to(ripple, { opacity: 0, duration: 1.1, ease: 'power1.in' }, IMPACT);
   splash.forEach((d, i) => {
    tl!.set(drops[i], { opacity: 1, scale: 1 }, IMPACT)
     .to(drops[i], { x: sx + d.dx, duration: .8, ease: 'power1.out' }, IMPACT)
     .to(drops[i], { y: sy - d.up, duration: .34, ease: 'power2.out' }, IMPACT)
     .to(drops[i], { y: sy - d.up + d.fall, duration: .5, ease: 'power2.in' }, IMPACT + .34)
     .to(drops[i], { opacity: 0, scale: .4, duration: .25, ease: 'power1.in' }, IMPACT + .58);
   });
   // 3. A palm crown fans open behind the lockup, and the tagline settles in.
   tl.to(fronds, { rotation: i => crown[i].angle, scale: 1, opacity: i => crown[i].opacity, duration: 1.4, ease: 'back.out(1.2)', stagger: { each: .05, from: 'center' } }, IMPACT + .05)
    .to(q('.intro-crown'), { rotation: 7, duration: EXIT - IMPACT, ease: 'none' }, IMPACT)
    .to(ml, { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, 1.6)
    .to(tag, { opacity: 1, y: 0, duration: .6, stagger: .028, ease: 'power2.out' }, 1.75)
    .to(line, { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 1.95)
    // 4. The lockup resolves into the page.
    .to([...ml, ...tag, ...line, ...shadow], { opacity: 0, y: '-=12', duration: .45, ease: 'power2.in' }, EXIT)
    .to(q('.intro-crown'), { rotation: '+=40', scale: 1.5, opacity: 0, duration: 1.25, ease: 'power2.in' }, EXIT)
    .to(word, { x: wx, y: wy, scale: wk, duration: FLIGHT, ease: 'power3.inOut' }, MOVE)
    .to(word, { color: '#174b32', duration: FLIGHT * .7, ease: 'power1.inOut' }, MOVE + FLIGHT * .2)
    .to(coconut, { x: 0, y: 0, scale: 1, rotation: 360, duration: FLIGHT, ease: 'power3.inOut' }, MOVE)
    .fromTo(panel, { clipPath: `circle(${Math.hypot(W, H)}px at ${hx + tx}px ${hy + ty}px)` }, { clipPath: `circle(0px at ${hx}px ${hy}px)`, duration: FLIGHT, ease: 'power3.inOut' }, MOVE)
    // 5. The hero builds itself around the landed coconut.
    .from('.header-actions', { y: -26, opacity: 0, duration: .9, ease: 'power3.out', clearProps: 'transform,opacity' }, ENTER)
    .from('.hero-title .eyebrow', { y: 14, opacity: 0, duration: .9, ease: 'power3.out', clearProps: 'transform,opacity' }, ENTER)
    .from('.hero-title .line > span', { yPercent: 110, duration: 1.15, stagger: .12, clearProps: 'transform' }, ENTER + .08)
    .from('.hero-benefits, .hero-description, .hero-bottom', { y: 28, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity' }, ENTER + .3)
    .from('.chapter-nav, .floating-cta', { opacity: 0, duration: .8, ease: 'power2.out', clearProps: 'opacity' }, ENTER + .5)
    .from('.hero-frond svg', { opacity: 0, scale: .6, rotation: '-=35', duration: 1.7, stagger: .15, ease: 'power3.out' }, ENTER - .3)
    .to(introState, { bloom: 1, duration: 1.9, ease: 'power2.out' }, MOVE + FLIGHT - .45)
    .call(handoff, undefined, MOVE + FLIGHT);
  };

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  Promise.race([Promise.all([document.fonts.ready, coconut.decode().catch(() => {}), prepare?.().catch(() => {})]), wait(2600)])
   .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
   .then(() => { if (!cancelled) ctx = gsap.context(build); });
  return () => {
   cancelled = true; release(); ctx?.revert(); tl = undefined;
   html.classList.remove('intro-running'); introState.bloom = 1; el.style.display = '';
  };
 }, [onDone, prepare]);

 return <div className="intro" ref={root} aria-hidden="true">
  <div className="intro-panel">
   <div className="intro-crown">{crown.map((f, i) => <Frond key={i} className="intro-frond" variant={f.variant} tone={f.tone} style={{ '--l': f.length } as React.CSSProperties} />)}</div>
   <span className="intro-wait" />
   <p className="intro-ml" lang="ml">തേങ്ങ</p>
   <p className="intro-tag">{'A TASTE OF KERALA'.split('').map((c, i) => <span key={i}>{c === ' ' ? ' ' : c}</span>)}</p>
   <i className="intro-line" />
   <span className="intro-shadow" />
   <span className="intro-ripple" />
   {splash.map((_, i) => <span key={i} className="intro-drop" />)}
  </div>
  <div className="intro-mark"><span className="intro-word">{'THENGA'.split('').map((c, i) => <span className="ic" key={i}><span>{c}</span></span>)}</span><span className="intro-slot" /></div>
  <img className="intro-coconut" src="/assets/coconut.png" alt="" draggable={false} />
 </div>;
}
