'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { products, type Product } from './products';
import { SoftwareRenderer } from './software-renderer';

function labelTexture(product: Product, coconut?: HTMLImageElement, palm?: HTMLImageElement, kathakali?: HTMLImageElement) {
 const canvas=document.createElement('canvas'); canvas.width=2048; canvas.height=2048;
 const c=canvas.getContext('2d')!;
 c.fillStyle='#f6f3e8';c.fillRect(0,0,2048,2048);
 c.fillStyle=product.ink;c.fillRect(0,0,2048,130);c.fillRect(0,1940,2048,108);
 c.fillStyle=product.color;c.fillRect(0,1640,2048,300);
 c.fillStyle='#c7a45a';c.fillRect(0,135,2048,7);c.fillRect(0,1625,2048,7);c.fillRect(0,1919,2048,7);
 c.textAlign='center';c.fillStyle='#f6f3e8';c.font='500 25px "DM Sans", sans-serif';c.fillText('THE SPIRIT OF KERALA',1024,84);
 c.fillStyle=product.ink;c.font='800 177px "Barlow Condensed", sans-serif';c.fillText('THENGA',1024,357);
 c.font='500 42px "DM Sans", sans-serif';c.fillText('COCONUT WATER',1024,447);
 // The original Kathakali and coconut-palms illustration forms the front label.
 if(kathakali)c.drawImage(kathakali,664,490,720,1080);
 c.fillStyle=product.ink;c.font='600 74px "Barlow Condensed", sans-serif';c.fillText(product.short,1024,1775);
 c.font='400 26px "DM Sans", sans-serif';c.fillText('330 ml  ·  SERVE CHILLED',1024,1855);
 // Genuine wrapped side and rear panels remain readable through the full rotation.
 if(palm){c.globalAlpha=.25;c.drawImage(palm,1430,560,590,880);c.globalAlpha=1;}
 c.textAlign='left';c.fillStyle=product.ink;c.font='600 45px "Barlow Condensed", sans-serif';c.fillText('ROOTED IN KERALA.',60,380);
 c.font='400 24px "DM Sans", sans-serif';['From coconut palms','to the colours of Kathakali.','A celebration of Kerala.','','A taste of home.','Enjoy cold. Recycle your can.'].forEach((t,i)=>c.fillText(t,60,465+i*46));
 if(coconut)c.drawImage(coconut,75,930,300,320);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;return map;
}
export function createCan(product:Product,coconut?:HTMLImageElement,palm?:HTMLImageElement,kathakali?:HTMLImageElement){
 const group=new THREE.Group();
 const map=labelTexture(product,coconut,palm,kathakali);
 const mat=new THREE.MeshStandardMaterial({map,roughness:.32,metalness:.18});
 const points=[new THREE.Vector2(0,-1.38),new THREE.Vector2(.41,-1.38),new THREE.Vector2(.46,-1.33),new THREE.Vector2(.47,-1.26),new THREE.Vector2(.49,-1.15),new THREE.Vector2(.49,1.15),new THREE.Vector2(.455,1.26),new THREE.Vector2(.44,1.31),new THREE.Vector2(.44,1.36),new THREE.Vector2(0,1.36)];
 const geometry=new THREE.LatheGeometry(points,48);const uv=geometry.attributes.uv;const position=geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,(position.getY(i)+1.38)/2.76);const body=new THREE.Mesh(geometry,mat);body.rotation.y=Math.PI;group.add(body);
 const metal=new THREE.MeshStandardMaterial({color:'#cbd0c2',metalness:1,roughness:.22});
 [-1.33,1.34].forEach(y=>{const rim=new THREE.Mesh(new THREE.TorusGeometry(.435,.025,6,48),metal);rim.rotation.x=Math.PI/2;rim.position.y=y;group.add(rim)});
 const lid=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.022,40),metal);lid.position.y=1.335;group.add(lid);
 const tab=new THREE.Mesh(new THREE.TorusGeometry(.105,.027,6,20),metal);tab.scale.y=1.6;tab.rotation.x=Math.PI/2;tab.position.set(0,1.36,.04);group.add(tab);
 return group;
}
function loadImage(path:string){return new Promise<HTMLImageElement|undefined>(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(undefined);img.src=path;});}
function disposeScene(scene:THREE.Scene){scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})}
const clamp=(n:number)=>Math.min(1,Math.max(0,n));
const smooth=(a:number,b:number,n:number)=>{let x=clamp((n-a)/(b-a));return x*x*(3-2*x)};

export default function ProductScene({progress}:{progress:React.RefObject<number>}){
 const mount=useRef<HTMLDivElement>(null);const [ready,setReady]=useState(false);
 useEffect(()=>{
  let cancelled=false,frame=0;let renderer:THREE.WebGLRenderer|SoftwareRenderer|undefined;let cleanup=()=>{};
  (async()=>{
   const el=mount.current;if(!el)return;
   try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{renderer=new SoftwareRenderer();}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0xffffff,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
   el.appendChild(renderer.domElement);
   const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(33,1,.1,100);camera.position.set(0,.1,8);
   const software=renderer instanceof SoftwareRenderer;const pmrem=software?null:new THREE.PMREMGenerator(renderer as THREE.WebGLRenderer);const env=pmrem?.fromScene(new RoomEnvironment(),.04);if(env)scene.environment=env.texture;
   scene.add(new THREE.HemisphereLight(0xfffcf0,0x6d793c,2.1));const sun=new THREE.DirectionalLight(0xfff8e4,4);sun.position.set(-4,6,5);scene.add(sun);
   const fill=new THREE.DirectionalLight(0xffffff,1.3);fill.position.set(4,0,2);scene.add(fill);
   const [coconut,palm,kathakali]=await Promise.all([loadImage('/assets/coconut.png'),loadImage('/assets/palm.png'),loadImage('/assets/kathakali-palms.png'),document.fonts.ready]);
   if(cancelled){renderer.dispose();env?.dispose();pmrem?.dispose();return;}
   const texture=await new THREE.TextureLoader().loadAsync('/assets/coconut-texture.jpg').catch(()=>null);
   if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;}
   // Match the photographic husk's measured green. Unlit, untone-mapped material
   // preserves its colour under the bright can lighting and as the model rotates.
   const outer=new THREE.MeshBasicMaterial({map:texture,color:texture?'#c7c148':'#767d04',toneMapped:false});
   const flesh=new THREE.MeshStandardMaterial({color:'#fcf9ed',roughness:.4,side:THREE.DoubleSide});
   const ringmat=new THREE.MeshStandardMaterial({color:'#d1b98c',roughness:.9,side:THREE.DoubleSide});
   const nut=new THREE.Group();scene.add(nut);const upper=new THREE.Group(),lower=new THREE.Group();nut.add(upper,lower);
   const shape=(geo:THREE.SphereGeometry)=>{const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const theta=Math.atan2(z,x);const f=1+.027*Math.sin(theta*5)+.012*Math.cos(theta*9+y*4);pos.setXYZ(i,x*f,y*1.13,z*f*.94)}geo.computeVertexNormals();return geo;};
   const top=new THREE.Mesh(shape(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2)),outer);upper.add(top);
   const bottom=new THREE.Mesh(shape(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,Math.PI/2,Math.PI/2)),outer);lower.add(bottom);
   for(const [g,sign] of [[upper,-1],[lower,1]] as [THREE.Group,number][]){
    const rim=new THREE.Mesh(new THREE.RingGeometry(.78,1,48),flesh);rim.rotation.x=-Math.PI/2*sign;rim.scale.y=.94;g.add(rim);
    const husk=new THREE.Mesh(new THREE.RingGeometry(.95,1.01,48),ringmat);husk.rotation.x=-Math.PI/2*sign;husk.position.y=.001*sign;husk.scale.y=.94;g.add(husk);
    const inside=new THREE.Mesh(new THREE.SphereGeometry(.79,32,16,0,Math.PI*2,sign>0?Math.PI/2:0,Math.PI/2),flesh);inside.scale.set(1,1.18,.94);g.add(inside);
   }
   const water=new THREE.Mesh(new THREE.CircleGeometry(.68,64),new THREE.MeshPhysicalMaterial({color:'#dfede6',metalness:.15,roughness:.1,transparent:true,opacity:.72,clearcoat:1}));water.rotation.x=-Math.PI/2;water.position.y=-.27;lower.add(water);
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.15,.17,12),ringmat);stem.position.y=1.15;stem.rotation.z=-.25;upper.add(stem);
   const dropletGeo=new THREE.SphereGeometry(1,6,4),dropMat=new THREE.MeshPhysicalMaterial({color:'#f9ffe6',metalness:.2,roughness:.04,transparent:true,opacity:.52,clearcoat:1});
   const drops=new THREE.InstancedMesh(dropletGeo,dropMat,120);const matrix=new THREE.Matrix4();for(let i=0;i<120;i++){const a=i*2.39996,b=Math.acos(1-2*(i+.5)/120),s=.007+(i%7)*.002;matrix.compose(new THREE.Vector3(Math.sin(b)*Math.cos(a)*1.012,Math.cos(b)*1.135,Math.sin(b)*Math.sin(a)*.95),new THREE.Quaternion(),new THREE.Vector3(s,s*1.5,s));drops.setMatrixAt(i,matrix)}nut.add(drops);
   const can=createCan(products[0],coconut,palm,kathakali);scene.add(can);can.visible=false;
   let targetX=0,targetY=0,mouseX=0,mouseY=0;
   const onMove=(e:PointerEvent)=>{const r=el.getBoundingClientRect();targetX=(e.clientX-r.left-r.width/2)/r.width;targetY=(e.clientY-r.top-r.height/2)/r.height;};
   const onLeave=()=>{targetX=targetY=0};el.addEventListener('pointermove',onMove);el.addEventListener('pointerleave',onLeave);
   const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer!.setSize(w,h);camera.aspect=w/h;camera.position.z=w<700?9.3:8;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(el);resize();
   let inView=true;const visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;});visibility.observe(el);
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   let lastRender=0,ambientTime=0;
   const render=()=>{
    if(cancelled)return;frame=requestAnimationFrame(render);if(document.hidden||!inView)return;const now=performance.now();if(software&&now-lastRender<42)return;const dt=Math.min(60,now-lastRender);lastRender=now;if(!document.documentElement.classList.contains('motion-paused')&&!reduced)ambientTime+=dt*.001;
    const p=progress.current??0;const time=ambientTime;mouseX+=(targetX-mouseX)*.055;mouseY+=(targetY-mouseY)*.055;
    const opening=smooth(.17,.27,p)*(1-smooth(.45,.53,p));const reveal=smooth(.56,.69,p);const leave=smooth(.66,.77,p);
    nut.visible=p>.07&&p<.79;
    nut.position.set(0,-.18+Math.sin(time*.9)*.027,0);nut.scale.setScalar(1.08*(1-.13*smooth(.15,.3,p)));
    nut.rotation.set(.18-opening*.42+mouseY*.07, p*4.4+mouseX*.12,-.2+opening*.12);
    upper.position.y=opening*1.3+reveal*2.7;lower.position.y=-opening*.12-reveal*2.7;
    upper.rotation.z=-opening*.2-reveal*.55;upper.rotation.x=-opening*.2;
    lower.rotation.x=opening*.55;drops.visible=opening<.07&&reveal<.07;
    nut.position.x=leave*-.15;
    can.visible=p>.575;const canIn=smooth(.575,.69,p);can.scale.setScalar(.15+.85*canIn);
    can.position.y=-.1+(reduced?0:Math.sin(time)*.035);can.rotation.set(.08+mouseY*.1,(p-.7)*Math.PI*7+mouseX*.2,.13*(1-smooth(.76,.99,p)));
    if(p<.7)can.rotation.y=.3;
    renderer!.render(scene,camera);
   };render();setReady(true);
   cleanup=()=>{visibility.disconnect();ro.disconnect();el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerleave',onLeave);disposeScene(scene);env?.dispose();pmrem?.dispose();renderer!.dispose();renderer!.domElement.remove()};
  })();
  return()=>{cancelled=true;cancelAnimationFrame(frame);cleanup()};
 },[progress]);
 return <div className={`three-stage ${ready?'ready':''}`} ref={mount} aria-label="Scroll-controlled 3D coconut opening and rotating drink can" role="img"/>;
}

export function ProductGalleryImages({onReady}:{onReady:(images:string[])=>void}){
 useEffect(()=>{let cancelled=false;(async()=>{
  await document.fonts.ready;const [nut,palm,kathakali]=await Promise.all([loadImage('/assets/coconut.png'),loadImage('/assets/palm.png'),loadImage('/assets/kathakali-palms.png')]);if(cancelled)return;
  let r:THREE.WebGLRenderer|SoftwareRenderer;try{r=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});}catch{r=new SoftwareRenderer();}
  r.setSize(650,850);r.setPixelRatio(1);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.35;
  const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(30,650/850,.1,100);cam.position.set(0,.15,6.7);
  const pm=r instanceof SoftwareRenderer?null:new THREE.PMREMGenerator(r);const env=pm?.fromScene(new RoomEnvironment(),.04);if(env)scene.environment=env.texture;scene.add(new THREE.HemisphereLight(0xffffff,0xb8bd8f,2.2));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-4,6,6);scene.add(light);
  const images=products.map(p=>{const can=createCan(p,nut,palm,kathakali);can.rotation.set(.12,.0,-.12);scene.add(can);r.render(scene,cam);const image=r.domElement.toDataURL('image/png');scene.remove(can);can.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.MeshStandardMaterial).map?.dispose();(o.material as THREE.Material).dispose()}});return image;});
  if(!cancelled)onReady(images);r.dispose();env?.dispose();pm?.dispose();
 })();return()=>{cancelled=true}},[onReady]);return null;
}
