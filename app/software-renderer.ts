import * as THREE from 'three';
// A small Canvas2D renderer for the same Three.js meshes when WebGL is unavailable.
// It projects real geometry and wraps UV textures; it does not mirror a product image.
export class SoftwareRenderer {
 domElement:HTMLCanvasElement; outputColorSpace='';toneMapping=0;toneMappingExposure=1;isSoftware=true;
 private ctx:CanvasRenderingContext2D;private width=1;private height=1;
 private tintedMaps=new WeakMap<THREE.Material,HTMLCanvasElement>();
 private colourMap(source:CanvasImageSource & {width:number;height:number},mat:THREE.MeshStandardMaterial){
  if(mat.color.r===1&&mat.color.g===1&&mat.color.b===1)return source;
  const cached=this.tintedMaps.get(mat);if(cached)return cached;
  const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
  const ctx=canvas.getContext('2d')!;ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  const linear=(s:number)=>s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);
  const srgb=(v:number)=>v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;
  const channels=[mat.color.r,mat.color.g,mat.color.b];
  const tables=channels.map(f=>Array.from({length:256},(_,v)=>Math.round(Math.min(1,srgb(linear(v/255)*f))*255)));
  for(let i=0;i<pixels.data.length;i+=4){for(let c=0;c<3;c++)pixels.data[i+c]=tables[c][pixels.data[i+c]];}
  ctx.putImageData(pixels,0,0);this.tintedMaps.set(mat,canvas);return canvas;
 }
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d',{alpha:true})!;}
 setPixelRatio(){} setClearColor(){}
 setSize(w:number,h:number){const scale=Math.min(1,850/w,850/h);this.width=w*scale;this.height=h*scale;this.domElement.width=this.width;this.domElement.height=this.height;this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 dispose(){this.domElement.remove()}
 render(scene:THREE.Scene,camera:THREE.Camera){
  const ctx=this.ctx,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();
  const vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const light=new THREE.Vector3(-.4,.7,.9).normalize();const camPos=new THREE.Vector3();camera.getWorldPosition(camPos);
  type Face={p:number[];uv:number[];z:number;image:CanvasImageSource|null;color:string;shade:number;opacity:number};const faces:Face[]=[];
  scene.traverseVisible(obj=>{
   if(!(obj instanceof THREE.Mesh)||obj instanceof THREE.InstancedMesh)return;
   const geom=obj.geometry,positions=geom.attributes.position,uvs=geom.attributes.uv;const index=geom.index;
   const mat=(Array.isArray(obj.material)?obj.material[0]:obj.material) as THREE.MeshStandardMaterial;
   const verts:{screen:THREE.Vector3,world:THREE.Vector3}[]=[];
   for(let i=0;i<positions.count;i++){const world=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(obj.matrixWorld);const screen=world.clone().applyMatrix4(vp);verts.push({screen,world})}
   const n=index?index.count:positions.count;
   for(let i=0;i<n;i+=3){const ai=index?index.getX(i):i,bi=index?index.getX(i+1):i+1,ci=index?index.getX(i+2):i+2;
    const a=verts[ai],b=verts[bi],c=verts[ci];if(!a||!b||!c)continue;
    const normal=b.world.clone().sub(a.world).cross(c.world.clone().sub(a.world)).normalize();const facing=normal.dot(camPos.clone().sub(a.world));
    if(mat.side!==THREE.DoubleSide&&facing<0)continue;if(facing<0)normal.negate();
    const p=[(a.screen.x+1)*w*.5,(1-a.screen.y)*h*.5,(b.screen.x+1)*w*.5,(1-b.screen.y)*h*.5,(c.screen.x+1)*w*.5,(1-c.screen.y)*h*.5];
    if(Math.max(p[0],p[2],p[4])<0||Math.min(p[0],p[2],p[4])>w||Math.max(p[1],p[3],p[5])<0||Math.min(p[1],p[3],p[5])>h)continue;
    const original=mat.map?.image as (CanvasImageSource & {width:number;height:number}) | undefined;const source=original?this.colourMap(original,mat):undefined;let uv:number[]=[];if(uvs&&source){const iw=source.width,ih=source.height;uv=[uvs.getX(ai)*iw,(1-uvs.getY(ai))*ih,uvs.getX(bi)*iw,(1-uvs.getY(bi))*ih,uvs.getX(ci)*iw,(1-uvs.getY(ci))*ih]}
    faces.push({p,uv,z:(a.screen.z+b.screen.z+c.screen.z)/3,image:source||null,color:'#'+mat.color.getHexString(),shade:mat instanceof THREE.MeshBasicMaterial?0:Math.max(0,.38-.36*normal.dot(light)),opacity:mat.opacity});
   }
  });
  faces.sort((a,b)=>b.z-a.z);
  for(const f of faces){let [x0,y0,x1,y1,x2,y2]=f.p;const cx=(x0+x1+x2)/3,cy=(y0+y1+y2)/3;
   // Subpixel overlap closes hairline cracks between neighbouring triangles.
   const expand=(v:number,c:number)=>v+Math.sign(v-c)*.7;x0=expand(x0,cx);x1=expand(x1,cx);x2=expand(x2,cx);y0=expand(y0,cy);y1=expand(y1,cy);y2=expand(y2,cy);
   ctx.save();ctx.globalAlpha=f.opacity;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();
   if(f.image&&f.uv.length){ctx.clip();const [u0,v0,u1,v1,u2,v2]=f.uv;const den=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);
    if(Math.abs(den)>.001){const a=(x0*(v1-v2)+x1*(v2-v0)+x2*(v0-v1))/den;const b=(y0*(v1-v2)+y1*(v2-v0)+y2*(v0-v1))/den;const c=(x0*(u2-u1)+x1*(u0-u2)+x2*(u1-u0))/den;const d=(y0*(u2-u1)+y1*(u0-u2)+y2*(u1-u0))/den;const e=(x0*(u1*v2-u2*v1)+x1*(u2*v0-u0*v2)+x2*(u0*v1-u1*v0))/den;const ff=(y0*(u1*v2-u2*v1)+y1*(u2*v0-u0*v2)+y2*(u0*v1-u1*v0))/den;ctx.setTransform(a,b,c,d,e,ff);ctx.drawImage(f.image,0,0);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(17,31,13,${f.shade})`;ctx.fillRect(0,0,w,h)}
   }else{ctx.fillStyle=f.color;ctx.fill();ctx.fillStyle=`rgba(17,31,13,${f.shade})`;ctx.fill()}
   ctx.restore();
  }
 }
}
