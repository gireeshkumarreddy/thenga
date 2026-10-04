'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, Globe2, Leaf, Plus, X, ChevronLeft, ChevronRight, Check, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { products } from './products';
const ProductScene=dynamic(()=>import('./product-scene'),{ssr:false});
const ProductGalleryImages=dynamic(()=>import('./product-scene').then(m=>m.ProductGalleryImages),{ssr:false});
const chapters=['The coconut','Pure by nature','Our roots','Your daily sip'];

export default function Home(){
 const root=useRef<HTMLElement>(null),journey=useRef<HTMLElement>(null),progress=useRef(0),track=useRef<HTMLDivElement>(null);
 const drag=useRef({active:false,moved:false,x:0,scroll:0});
 const [menu,setMenu]=useState(false),[selected,setSelected]=useState<number|null>(null),[images,setImages]=useState<string[]>([]),[chapter,setChapter]=useState(0),[loaded,setLoaded]=useState(false),[paused,setPaused]=useState(false),[credits,setCredits]=useState(false),[shared,setShared]=useState(false);
 const updateImages=useCallback((i:string[])=>setImages(i),[]);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx=gsap.context(()=>{
   const state={p:0};
   gsap.to(state,{p:1,ease:'none',scrollTrigger:{trigger:journey.current,start:'top top',end:'bottom bottom',scrub:reduce?true:.85},onUpdate:()=>{
    progress.current=state.p;const p=state.p;
    root.current?.style.setProperty('--journey',`${p}`);
    const fade=(a:number,b:number,c:number,d:number)=>Math.min(1,Math.max(0,(p-a)/(b-a)))*Math.min(1,Math.max(0,(d-p)/(d-c)));
    const hero=1-Math.min(1,p/.115);gsap.set('.hero-copy',{autoAlpha:hero,y:-p*window.innerHeight*.8});
    gsap.set('.hero-coconut',{autoAlpha:1-Math.min(1,Math.max(0,(p-.065)/.05)),rotation:-p*210,scale:1-p*.7,y:p*120});
    gsap.set('.hero-frond',{y:-p*140,rotation:p*30,opacity:.63*(1-Math.min(1,p/.22))});
    gsap.set('.source-copy',{autoAlpha:fade(.105,.16,.285,.34),y:(.2-p)*110});
    gsap.set('.ingredient-copy',{autoAlpha:fade(.28,.335,.425,.48)});
    gsap.set('.origin-copy',{autoAlpha:fade(.455,.505,.55,.6)});
    gsap.set('.pack-copy',{autoAlpha:fade(.59,.665,.83,.90)});
    gsap.set('.keep-copy',{autoAlpha:fade(.865,.915,1,1.1),scale:.85+p*.15});
    gsap.set('.stage-shadow',{scaleX:1+p*.15,opacity: .13*(1-Math.min(1,p/.08))});
    setChapter(p<.15?0:p<.45?1:p<.6?2:3);
   }});
   gsap.utils.toArray<HTMLElement>('.green-world,.full-landscape,.footer').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 70px',end:'bottom 70px',onEnter:()=>root.current?.classList.add('light-header'),onEnterBack:()=>root.current?.classList.add('light-header'),onLeave:()=>root.current?.classList.remove('light-header'),onLeaveBack:()=>root.current?.classList.remove('light-header')}));
   gsap.utils.toArray<HTMLElement>('.reveal').forEach(el=>gsap.from(el,{y:reduce?0:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 91%',once:true}}));
   if(!reduce){gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el=>gsap.fromTo(el,{yPercent:-7},{yPercent:7,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));
   gsap.fromTo('.story-photo.one',{rotation:-8,y:75},{rotation:-4,y:-45,scrollTrigger:{trigger:'.heritage',start:'top bottom',end:'bottom top',scrub:1}});
   gsap.fromTo('.story-photo.two',{rotation:9,y:120},{rotation:5,y:-35,scrollTrigger:{trigger:'.heritage',start:'top bottom',end:'bottom top',scrub:1}});}
  },root);
  const timer=setTimeout(()=>setLoaded(true),800);return()=>{ctx.revert();clearTimeout(timer)};
 },[]);
 useEffect(()=>{document.documentElement.classList.toggle('motion-paused',paused);return()=>document.documentElement.classList.remove('motion-paused')},[paused]);
 const goto=(id:string)=>{setMenu(false);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}))};
 const jumpChapter=(i:number)=>{const positions=[0,.32,.515,.73];if(journey.current)window.scrollTo({top:journey.current.offsetTop+(journey.current.offsetHeight-window.innerHeight)*positions[i],behavior:'smooth'});};
 const share=async()=>{try{await navigator.clipboard.writeText(location.href);setShared(true);setTimeout(()=>setShared(false),2500)}catch{setShared(false)}};
 return <main ref={root} className={paused?'paused':''}>
  <a className="skip-link" href="#collection">Skip to the collection</a>
  <div className={`intro ${loaded?'finished':''}`} aria-hidden="true"><span>THENGA<span className="intro-period">.</span></span><p>A TASTE OF KERALA</p><i/></div>
  <header className="site-header">
   <a className="brand" href="#home" aria-label="THENGA home">THENGA<span>®</span></a>
   <div className="header-actions"><button className="motion-toggle" onClick={()=>setPaused(!paused)} aria-label={paused?'Resume ambient motion':'Pause ambient motion'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button><button className="menu-button" onClick={()=>setMenu(true)} aria-label="Open navigation menu"><Globe2 size={20}/><span className="nav-divider"/><span>MENU</span><Menu size={23}/></button></div>
  </header>
  <section id="home" className="journey" ref={journey} aria-label="From coconut to can">
   <div className="journey-stage">
    <img className="hero-frond" src="/assets/palm.png" alt="" aria-hidden="true" fetchPriority="high"/>
    <div className="hero-copy">
     <div className="hero-title"><p className="eyebrow">NATURALLY KERALA. BEAUTIFULLY REFRESHING.</p><h1>PARADISE IN<br/>EVERY SIP<span className="period">.</span></h1></div>
     <div className="hero-benefits"><span className="benefit-line"/><p>+ &nbsp; Naturally hydrating</p><p>+ &nbsp; Pure coconut goodness</p></div>
     <div className="hero-description"><p>Refresh your world with pure coconut goodness. Rooted in the tropical beauty of Kerala, made for your everyday.</p><div className="natural-seal"><Leaf size={25}/><span>GOOD BY NATURE</span></div></div>
     <div className="hero-bottom"><span>9.9312° N &nbsp; 76.2673° E</span><span className="scroll-cue">SCROLL TO CRACK IT OPEN <span>↓</span></span></div>
    </div>
    <img className="hero-coconut" src="/assets/coconut.png" alt="Fresh green Kerala coconut with natural husk and droplets of water" fetchPriority="high"/>
    <div className="stage-shadow"/>
    <ProductScene progress={progress}/>
    <div className="source-copy scene-copy"><div><p className="eyebrow">01 / STRAIGHT FROM NATURE</p><h2>THE REAL</h2></div><div className="source-right"><h2>SOURCE OF<br/>EVERY SIP.</h2><p>One extraordinary fruit.<br/>A whole world of refreshment.</p></div></div>
    <div className="ingredient-copy scene-copy"><div className="ingredient-circle badge-one">NATURAL<br/><strong>GOODNESS</strong></div><div className="ingredient-circle badge-two">REFRESHING<br/><strong>BY NATURE</strong></div><div className="ingredient-caption"><p className="eyebrow">02 / NOTHING COMPLICATED</p><h2>JUST COCONUT.<br/>JUST BEAUTIFUL.</h2><p>Naturally refreshing. Pure coconut goodness.<br/>A light, lovely way to hydrate.</p></div></div>
    <div className="origin-copy scene-copy"><p className="eyebrow">03 / WHERE IT ALL BEGINS</p><h2>ROOTED<br/>IN KERALA.</h2><p>From sunlit palms and slow backwaters.<br/>A taste of the place we call home.</p><img className="origin-kathakali" src="/assets/kathakali-palms.png" alt="Kathakali-inspired artwork framed by coconut palms"/></div>
    <div className="pack-copy scene-copy"><div><p className="eyebrow">04 / A LITTLE PARADISE, TO GO</p><h2>COCONUT.<br/>REIMAGINED.</h2><p>The colours of Kathakali. The calm of coconut palms.<br/>A little Kerala, wherever you go.</p></div><div className="pack-detail"><span className="fine-rule"/><p>Original Kerala Coconut Water</p><p className="small-label">330 ML &nbsp; / &nbsp; BEST SERVED CHILLED</p><button className="text-link" onClick={()=>goto('collection')}>Meet your daily sip <Plus size={17}/></button></div></div>
    <div className="keep-copy scene-copy"><h2>KEEP<br/>SIPPING.</h2><p>A TASTE OF KERALA IN EVERY SIP.</p></div>
    <nav className="chapter-nav" aria-label="Product story chapters">{chapters.map((c,i)=><button key={c} aria-label={c} aria-current={chapter===i?'step':undefined} className={chapter===i?'current':''} onClick={()=>jumpChapter(i)}><span>0{i+1}</span><i/></button>)}</nav>
   </div>
  </section>
  <section className="green-world scalloped" id="nature">
   <div className="nature-statement reveal"><span className="eyebrow light">SUNSHINE. PALMS. PURE REFRESHMENT.</span><h2>PURE COCONUT WATER.<br/>NATURALLY REFRESHING.<br/><span>STRAIGHT FROM<br/>NATURE’S SOURCE.</span></h2><span className="round-note">A little<br/><em>paradise</em><br/>every day.</span><img className="nature-kathakali" src="/assets/kathakali-palms.png" alt="" aria-hidden="true" loading="lazy"/></div>
   <div id="collection" className="collection">
    <div className="section-heading reveal"><div><p className="eyebrow light">THE THENGA COLLECTION</p><h2>FIND YOUR<br/><span>KIND OF TROPICAL.</span></h2></div><div className="collection-intro"><p>Five ways to take a little Kerala with you.<br/>Which one feels like your kind of day?</p><div className="carousel-controls"><button aria-label="Previous flavours" onClick={()=>track.current?.scrollBy({left:-400,behavior:'smooth'})}><ChevronLeft size={23}/></button><button aria-label="Next flavours" onClick={()=>track.current?.scrollBy({left:400,behavior:'smooth'})}><ChevronRight size={23}/></button></div></div></div>
    <div className="product-track" ref={track} aria-label="Coconut flavour collection" onPointerDown={e=>{if(e.pointerType==='mouse'){drag.current={active:true,moved:false,x:e.clientX,scroll:track.current?.scrollLeft??0};}}} onPointerMove={e=>{const d=drag.current;if(d.active&&track.current){const dx=e.clientX-d.x;if(Math.abs(dx)>5)d.moved=true;if(d.moved){e.preventDefault();track.current.scrollLeft=d.scroll-dx;}}}} onPointerUp={()=>{drag.current.active=false;}} onPointerLeave={()=>{drag.current.active=false;}} onDragStart={e=>e.preventDefault()}>
     {products.map((p,i)=><button key={p.name} className="product-card" style={{'--flavour':p.color,'--ink':p.ink} as React.CSSProperties} onClick={()=>{if(!drag.current.moved)setSelected(i);drag.current.moved=false;}} aria-label={`Explore ${p.name}`}><div className="card-top"><span>COCONUT WATER</span><span>0{i+1} / 05</span></div><div className="product-art"><span className="flavour-disc"/><span className="product-big-word">{p.short}</span>{images[i]?<img src={images[i]} alt={`${p.name} coconut water can with Kathakali and coconut palm artwork`} loading="lazy"/>:<span className="product-loading">THENGA</span>}</div><div className="card-bottom"><div><h3>{p.name}</h3><p>{p.note}</p></div><span className="circle-plus"><Plus size={20}/></span></div></button>)}
    </div>
    <p className="collection-caption">GOOD THINGS COME IN COCONUTS. <span>DRAG OR EXPLORE THE COLLECTION</span></p>
   </div>
  </section>
  <section className="heritage" id="kerala">
   <div className="heritage-copy reveal"><p className="eyebrow">GOD’S OWN COUNTRY. OUR ONLY INSPIRATION.</p><h2>ROOTED IN KERALA.<br/>MADE FOR<br/><em>THE WORLD.</em></h2><p>Born in the tropical landscapes of Kerala, THENGA celebrates the purity of nature, the richness of tradition, and the simplicity of real refreshment.</p><p>Where coconut palms lean over quiet backwaters, and Kathakali brings colour, expression and storytelling to life. That spirit finds its way onto every THENGA can.</p><button className="pill-button" onClick={()=>goto('from-the-palms')}>A little closer to our roots <Plus size={17}/></button></div>
   <div className="heritage-photos"><figure className="story-photo one kathakali-photo"><img src="/assets/kerala-kathakali.jpg" alt="Kathakali performer in Kochi wearing green pacha makeup, a gold headdress and traditional costume" loading="lazy"/><figcaption>01 — THE COLOURS OF KATHAKALI</figcaption></figure><figure className="story-photo two"><img src="/assets/kerala-paddy.jpg" alt="Vibrant green paddy fields and coconut palms in Palakkad, Kerala" loading="lazy"/><figcaption>02 — GREEN, AS FAR AS THE EYE CAN SEE</figcaption></figure><figure className="story-photo three"><img src="/assets/kerala-house.jpg" alt="Traditional tiled-roof Kerala home among coconut palms in Kannur" loading="lazy"/><figcaption>03 — A PLACE TO CALL HOME</figcaption></figure><figure className="story-photo four"><img src="/assets/kerala-coconuts.jpg" alt="Green coconuts growing on a Kerala palm" loading="lazy"/><figcaption>04 — THE PALMS OF HOME</figcaption></figure><span className="photo-seal">KERALA<br/><strong>9° N 76° E</strong><br/>INDIA</span></div>
  </section>
  <section className="full-landscape" id="from-the-palms"><img data-parallax src="/assets/kerala-backwaters.jpg" alt="Coconut palms beside the Kerala backwaters" loading="lazy"/><div className="landscape-overlay"/><div className="landscape-copy reveal"><p className="eyebrow light">A PLACE. A FEELING. A WAY OF LIFE.</p><h2>FROM THE PALMS<br/>OF KERALA<br/><em>TO YOUR EVERYDAY.</em></h2><p>Carry the calm. Taste the sunshine.<br/>Make a little space for nature.</p></div><span className="landscape-caption">THE BACKWATERS OF KERALA, INDIA</span></section>
  <section className="rituals" id="everyday"><div className="section-heading reveal"><div><p className="eyebrow">FIND YOUR MOMENT</p><h2>A FRESHER<br/>EVERYDAY.</h2></div><p>Big adventures. Small pauses.<br/>There’s a little paradise in both.</p></div><div className="ritual-grid">{[{n:'01',title:'THE SLOW START',text:'A chilled sip, a sunlit window, and a moment that belongs to you.'},{n:'02',title:'THE FRESH RESET',text:'Between the busy bits. Take a breath and find your tropical pause.'},{n:'03',title:'THE GOLDEN HOUR',text:'Good company, warm light, and your favourite flavour on ice.'}].map(r=><article className="ritual reveal" key={r.n}><span className="ritual-num">{r.n}</span><h3>{r.title}</h3><p>{r.text}</p><span className="ritual-mark">✳</span></article>)}</div></section>
  <section className="final-pair"><div className="final-copy reveal"><p className="eyebrow">YOUR NEXT LITTLE OBSESSION</p><h2>YOUR DAILY<br/>DOSE OF<br/><em>PARADISE.</em></h2><button className="pill-button dark" onClick={()=>goto('collection')}>Explore the coconut collection <Plus size={17}/></button></div><div className="final-product"><span className="final-word">GOOD<br/>BY NATURE.</span>{images[0]&&<img src={images[0]} alt="THENGA Original Kerala can with gold-and-green Kathakali artwork" loading="lazy"/>}<span className="final-stamp">THE SPIRIT OF KERALA<br/>ON EVERY CAN</span></div></section>
  <footer className="footer scalloped"><img className="footer-kathakali" src="/assets/kathakali-palms.png" alt="" aria-hidden="true" loading="lazy"/><div className="footer-top"><p>A taste of Kerala in every sip.<br/>A little closer to nature, every day.</p><nav aria-label="Footer navigation"><button onClick={()=>goto('home')}>The coconut</button><button onClick={()=>goto('collection')}>The collection</button><button onClick={()=>goto('kerala')}>Our roots</button><button onClick={share}>{shared?'Link copied':'Share THENGA'}</button></nav></div><a href="#home" className="footer-wordmark" aria-label="THENGA back to top">THENGA<span>®</span></a><div className="footer-bottom"><span>© {new Date().getFullYear()} THENGA</span><span>FRESH THINKING. TROPICAL FEELING.</span><button onClick={()=>setCredits(true)}>Photography credits</button></div></footer>
  <a className="floating-cta" href="#collection"><span className="cta-dot"/><span>DISCOVER YOUR DAILY SIP</span><Plus size={15}/></a>
  <Dialog open={menu} onOpenChange={setMenu}><DialogContent className="navigation-dialog" showCloseButton={false}><div className="dialog-top"><span className="brand">THENGA®</span><button aria-label="Close menu" onClick={()=>setMenu(false)}><X size={28}/></button></div><DialogTitle className="sr-only">Explore THENGA</DialogTitle><DialogDescription className="sr-only">Discover our coconut water, flavours and Kerala heritage.</DialogDescription><nav>{[['01','The coconut','home'],['02','The collection','collection'],['03','Our roots','kerala'],['04','Your everyday','everyday']].map(([n,t,id])=><button key={id} onClick={()=>goto(id)}><span>{n}</span>{t}<Plus/></button>)}</nav><p>A TASTE OF KERALA IN EVERY SIP.</p></DialogContent></Dialog>
  <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null)}}><DialogContent className="product-dialog" showCloseButton={false}>{selected!==null&&<><button className="dialog-close" onClick={()=>setSelected(null)} aria-label="Close product details"><X size={23}/></button><div className="detail-image" style={{background:products[selected].color}}>{images[selected]&&<img src={images[selected]} alt={`${products[selected].name} can with Kathakali and coconut palms`}/>}<span>330 ML OF TROPICAL POSSIBILITY</span></div><div className="detail-copy"><p className="eyebrow">THE THENGA COLLECTION / {products[selected].number}</p><DialogTitle>{products[selected].name}</DialogTitle><DialogDescription>{products[selected].description}</DialogDescription><div className="detail-facts"><div><span>THE TASTE</span><p>{products[selected].ingredients}</p></div><div><span>THE MOMENT</span><p>{products[selected].pair}</p></div><div><span>THE RITUAL</span><p>Chill well. Shake gently. Sip slowly.</p></div></div><div className="flavour-picker" aria-label="Select a flavour">{products.map((p,i)=><button key={p.name} style={{background:p.color}} aria-label={p.name} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{selected===i?<Check size={18}/>:null}</button>)}</div><button className="pill-button dark" onClick={()=>setSelected((selected+1)%products.length)}>Discover the next flavour <Plus size={17}/></button></div></>}</DialogContent></Dialog>
  <Dialog open={credits} onOpenChange={setCredits}><DialogContent className="credits-dialog"><DialogTitle>Through a Kerala lens</DialogTitle><DialogDescription>Real places. Photographed by people who were there.</DialogDescription><p>Kathakali performer, Kochi — Qnonsense, <a href="https://commons.wikimedia.org/wiki/File:Kathakalidancer.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>. <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>. Cropped for display.</p><p>Kumarakom houseboat — Purushothama Reddy M, <a href="https://unsplash.com/photos/a-house-boat-on-a-river-surrounded-by-palm-trees-PtYLnVWtPz4" target="_blank" rel="noreferrer">Unsplash</a>.</p><p>Palakkad paddy fields — Nikhil B, <a href="https://commons.wikimedia.org/wiki/File:Paddy_fields_in_Kerala,_India.JPG" target="_blank" rel="noreferrer">Wikimedia Commons</a>. <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>. Cropped for display.</p><p>Coconuts on a Kerala palm — Dileesh Kumar, <a href="https://unsplash.com/photos/a-bunch-of-coconuts-hanging-from-a-tree-dTKNM67ZtRE" target="_blank" rel="noreferrer">Unsplash</a>.</p><p>Traditional Kerala house — Shagil Kannur, <a href="https://commons.wikimedia.org/wiki/File:Traditional_kerala_house.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>. <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Cropped for display.</p></DialogContent></Dialog>
  <ProductGalleryImages onReady={updateImages}/>
 </main>
}
