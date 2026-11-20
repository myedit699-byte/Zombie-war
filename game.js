(()=>{'use strict';
/* ===== ZOMBIE APOCALYPSE: LAST SURVIVOR ===== */
const $=i=>document.getElementById(i),R=Math.random,PI=Math.PI,sin=Math.sin,cos=Math.cos,H=Math.hypot,atan2=Math.atan2;
const S={set:'auto',q:'high',sens:1,state:'menu',score:0,kills:0,mi:0,mp:0,time:0,mt:0,best:0};
const KILLS=10,CRATES=3,SURVIVE=60;
try{const s=JSON.parse(localStorage.getItem('zal')||'{}');S.set=s.set||'auto';S.sens=s.sens||1;S.best=s.best||0}catch(e){}
const save=()=>{try{localStorage.setItem('zal',JSON.stringify({set:S.set,sens:S.sens,best:S.best}))}catch(e){}};
const L=c=>new THREE.MeshLambertMaterial({color:c});
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const lerpA=(a,b,k)=>{const d=((b-a+PI)%(2*PI)+2*PI)%(2*PI)-PI;return a+d*Math.min(1,k)};

/* ---------- renderer / scene ---------- */
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:false,powerPreference:'high-performance'});
const SKY=0x2b3340,scene=new THREE.Scene();
scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,18,85);
const cam=new THREE.PerspectiveCamera(60,1,.1,400);
scene.add(new THREE.HemisphereLight(0x9fb0c8,0x2a2418,.95));
const sun=new THREE.DirectionalLight(0xffd7a0,.85);sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:140});sun.shadow.camera.updateProjectionMatrix();
scene.add(sun,sun.target);
const moon=new THREE.Mesh(new THREE.SphereGeometry(9,12,10),new THREE.MeshBasicMaterial({color:0xdfe8ff,fog:false}));scene.add(moon);
function resize(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
function applyQ(q){S.q=q;const hi=q==='high';renderer.setPixelRatio(hi?Math.min(devicePixelRatio||1,1.5):.7);renderer.shadowMap.enabled=hi;sun.castShadow=hi;scene.fog.far=hi?85:60;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});resize()}
addEventListener('resize',resize);

/* ---------- world ---------- */
const cols=[];
const addCol=(x,z,hw,hd,h)=>cols.push({x,z,hw,hd,h});
function inside(x,z,y,m){for(const c of cols)if(c.h>y&&Math.abs(x-c.x)<c.hw+m&&Math.abs(z-c.z)<c.hd+m)return true;return false}
function collide(p,r){for(const c of cols){if(p.y>c.h)continue;
 const nx=Math.max(c.x-c.hw,Math.min(p.x,c.x+c.hw)),nz=Math.max(c.z-c.hd,Math.min(p.z,c.z+c.hd));
 let dx=p.x-nx,dz=p.z-nz,d=dx*dx+dz*dz;
 if(d<r*r){if(d>1e-6){d=Math.sqrt(d);const k=(r-d)/d;p.x+=dx*k;p.z+=dz*k}else if(Math.abs(p.x-c.x)/c.hw>Math.abs(p.z-c.z)/c.hd)p.x=c.x+(p.x>=c.x?1:-1)*(c.hw+r);else p.z=c.z+(p.z>=c.z?1:-1)*(c.hd+r)}}}
function build(){
 const g=new THREE.Mesh(new THREE.PlaneGeometry(500,500),L(0x46463f));g.rotation.x=-PI/2;g.receiveShadow=true;scene.add(g);
 let c=cv(64,64),x=c.getContext('2d');x.fillStyle='#202226';x.fillRect(0,0,64,64);x.fillStyle='#b9a64a';x.fillRect(30,0,4,34);x.fillStyle='#2b2d31';for(let i=0;i<60;i++)x.fillRect(R()*64,R()*64,2,2);
 const rt=new THREE.CanvasTexture(c);rt.wrapS=rt.wrapT=THREE.RepeatWrapping;rt.repeat.set(1,12);
 const rm=new THREE.MeshLambertMaterial({map:rt}),rg=new THREE.PlaneGeometry(10,192);
 for(let k=-3;k<=3;k++){
  const a=new THREE.Mesh(rg,rm);a.rotation.x=-PI/2;a.position.set(k*30,.02,0);a.receiveShadow=true;scene.add(a);
  const b=new THREE.Mesh(rg,rm);b.rotation.set(-PI/2,0,PI/2);b.position.set(0,.025,k*30);b.receiveShadow=true;scene.add(b)}
 c=cv(64,64);x=c.getContext('2d');x.fillStyle='#b4b0a8';x.fillRect(0,0,64,64);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=R()<.14?'#d9b85a':'#1b2230';x.fillRect(i*16+3,j*16+3,10,10)}
 const wt=new THREE.CanvasTexture(c);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;
 const tints=[0xffffff,0xd8c8b0,0xb8c0c8,0xc8a8a0,0xa8b098],ctr=[-75,-45,-15,15,45,75];
 for(const cx of ctr)for(const cz of ctr){
  if(R()<.2){for(let n=0;n<2;n++)barrel(cx+(R()-.5)*14,cz+(R()-.5)*14);continue}
  const w=12+R()*6,d=12+R()*6,h=8+R()*26,t=wt.clone();t.needsUpdate=true;t.repeat.set(Math.round(w/5),Math.round(h/5));
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({map:t,color:tints[R()*5|0]}));
  const bx=cx+(R()-.5)*2,bz=cz+(R()-.5)*2;m.position.set(bx,h/2,bz);m.castShadow=m.receiveShadow=true;scene.add(m);addCol(bx,bz,w/2,d/2,h)}
 const cc=[0x6a2a2a,0x2a3a5a,0x4a4a4a,0x5a5030,0x2a4a3a];
 for(let n=0;n<26;n++){
  const vert=R()<.5,lane=(R()*7|0)*30-90+(R()<.5?-2.5:2.5),along=(R()-.5)*170;
  const px=vert?lane:along,pz=vert?along:lane;if(Math.abs(px)<9&&Math.abs(pz)<9)continue;
  const w=vert?1.9:4.2,d=vert?4.2:1.9,car=new THREE.Group(),col=cc[R()*5|0];
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,.9,d),L(col)),top=new THREE.Mesh(new THREE.BoxGeometry(vert?1.7:2.2,.6,vert?2.2:1.7),L(0x222a30));
  body.position.y=.65;top.position.y=1.4;body.castShadow=top.castShadow=true;car.add(body,top);car.position.set(px,0,pz);car.rotation.y=(R()-.5)*.2;scene.add(car);addCol(px,pz,w/2,d/2,1.3)}
}
function barrel(x,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1,8),L(0x7a3a1a));m.position.set(x,.5,z);m.castShadow=true;scene.add(m);addCol(x,z,.4,.4,1)}

/* ---------- characters ---------- */
const gT=new THREE.BoxGeometry(.5,.7,.28),gH=new THREE.BoxGeometry(.34,.34,.34),gA=new THREE.BoxGeometry(.14,.62,.14).translate(0,-.26,0),gL=new THREE.BoxGeometry(.18,.8,.2).translate(0,-.4,0),gE=new THREE.BoxGeometry(.06,.05,.03);
const eyeM=new THREE.MeshBasicMaterial({color:0xff2200});
function mk(skin,shirt,pants,sc,zom){
 const g=new THREE.Group(),ms=L(skin),mh=L(shirt),mp=L(pants),u=g.userData;
 const add=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;(par||g).add(o);return o};
 add(gT,mh,0,1.15,0);add(gH,ms,0,1.65,0);
 u.aL=add(gA,ms,-.32,1.45,0);u.aR=add(gA,ms,.32,1.45,0);u.lL=add(gL,mp,-.13,.8,0);u.lR=add(gL,mp,.13,.8,0);
 if(zom){add(gE,eyeM,-.08,1.68,.18);add(gE,eyeM,.08,1.68,.18);u.aL.rotation.x=u.aR.rotation.x=-1.4}
 else{const b=add(new THREE.BoxGeometry(.09,.75,.09),L(0x6b4a2a),0,-.6,.04,u.aR);}
 g.scale.setScalar(sc);return g}
const TY={walker:{hp:30,spd:2.1,dmg:8,score:10,sc:1,c:[0x6b8f5a,0x55503f,0x333a40]},
 runner:{hp:18,spd:4.4,dmg:6,score:20,sc:.93,c:[0xa3b06a,0x8a2a2a,0x2d2d3a]},
 brute:{hp:100,spd:1.6,dmg:22,score:50,sc:1.5,c:[0x4f6f6a,0x1e1e22,0x15151a]}};

/* ---------- game state ---------- */
const pl={g:mk(0xd2a679,0x2f4f7a,0x24262b,1,false),vy:0,hp:100,st:100,ex:false,sd:0,rot:0,ph:0,amp:0,cd:0,at:0,hit:false};
let Z=[],P=[],deco=[],yaw=0,pitch=.35,hurtA=0,hudT=0,spT=0,menuT=0,runOn=false,atkHeld=false,jumpQ=false;
const joy={x:0,y:0},K={};
scene.add(pl.g);

function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function clearWorld(){for(const z of Z)scene.remove(z.g);for(const p of P)scene.remove(p.m);for(const d of deco)scene.remove(d);Z=[];P=[];deco=[]}
function reset(){clearWorld();Object.assign(S,{score:0,kills:0,mi:0,mp:0,time:0,mt:0});
 Object.assign(pl,{vy:0,hp:100,st:100,ex:false,sd:0,rot:0,cd:0,at:0});pl.g.position.set(0,0,0);pl.g.rotation.set(0,0,0);
 yaw=0;pitch=.35;spT=0;hurtA=0;runOn=false;$('run').classList.remove('on')}
function start(){reset();S.state='play';show(null);$('hud').classList.remove('hidden');
 try{const d=document.documentElement;d.requestFullscreen&&d.requestFullscreen().catch(()=>{});screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}
 toast('MISSION 1: Kill 10 zombies')}
function menu(){S.state='menu';clearWorld();pl.g.position.set(0,0,0);pl.g.rotation.set(0,0,0);pl.rot=0;pl.at=0;
 for(let i=0;i<5;i++){const a=i/5*PI*2+.4,t=TY[i===2?'brute':i%2?'runner':'walker'],z=mk(...t.c,t.sc,true);z.position.set(sin(a)*6.5,0,cos(a)*6.5);z.rotation.y=a+PI;scene.add(z);deco.push(z)}
 show('sMenu');$('hud').classList.add('hidden');$('best').textContent=S.best?'BEST SCORE: '+S.best:''}
function pause(){if(S.state!=='play')return;S.state='pause';show('sPause')}
function end(win){S.state=win?'win':'over';if(win)S.score+=500;if(S.score>S.best){S.best=S.score;save()}
 const t=`Score: ${S.score}\nZombies killed: ${S.kills}\nTime: ${S.time|0}s`;$(win?'statWin':'statOver').textContent=t;
 $('hud').classList.add('hidden');show(win?'sWin':'sOver')}
function show(id){document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));if(id)$(id).classList.remove('hidden')}

/* ---------- missions / pickups ---------- */
function addPick(kind,x,z){const grp=new THREE.Group(),inner=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshBasicMaterial({color:kind==='crate'?0xffc83d:0xffffff}));
 grp.add(inner);
 if(kind==='crate'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,40,6),new THREE.MeshBasicMaterial({color:0xffc83d,transparent:true,opacity:.3,fog:false}));b.position.y=20;grp.add(b)}
 else{const r=new THREE.MeshBasicMaterial({color:0xdd1111});const a=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,.18),r),b=new THREE.Mesh(new THREE.BoxGeometry(.18,.05,.6),r);a.position.y=b.position.y=.42;grp.add(a,b)}
 grp.position.set(x,0,z);inner.position.y=.8;scene.add(grp);P.push({m:grp,i:inner,kind,t:0})}
function nextM(){S.mi++;S.score+=200;
 if(S.mi===1){S.mp=0;const s=[[-30,-30],[30,30],[60,-30],[-60,30],[30,-60],[-30,60],[60,60],[-60,-60]].sort(()=>R()-.5);for(let i=0;i<CRATES;i++)addPick('crate',s[i][0],s[i][1]);toast('MISSION 2: Find 3 supply crates')}
 else if(S.mi===2){S.mt=0;toast('MISSION 3: Survive until extraction!')}}
function pickups(dt){const p=pl.g.position;
 for(let i=P.length-1;i>=0;i--){const k=P[i];k.t+=dt;k.i.rotation.y+=dt*2;k.i.position.y=.8+sin(k.t*3)*.15;
  if(k.kind==='med'&&k.t>25){scene.remove(k.m);P.splice(i,1);continue}
  if(H(p.x-k.m.position.x,p.z-k.m.position.z)<1.7){
   if(k.kind==='med'){pl.hp=Math.min(100,pl.hp+30);toast('+30 HEALTH')}
   else{S.mp++;S.score+=100;toast(`Supply crate ${S.mp}/${CRATES}`);if(S.mp>=CRATES&&S.mi===1)nextM()}
   scene.remove(k.m);P.splice(i,1)}}}

/* ---------- combat ---------- */
function hurt(d){pl.hp-=d;hurtA=.7;try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}if(pl.hp<=0){pl.hp=0;end(false)}}
function dmgZ(z,d){z.hp-=d;z.kb=9;if(z.hp<=0&&!z.dead){z.dead=true;z.dt=0;S.kills++;S.score+=TY[z.t].score;
 if(R()<.22)addPick('med',z.g.position.x,z.g.position.z);if(S.mi===0&&S.kills>=KILLS)nextM()}}
function attack(){if(pl.cd>0)return;pl.cd=.5;pl.at=.32;pl.hit=false;let best=4,b=null;const p=pl.g.position;
 for(const z of Z){if(z.dead)continue;const d=H(z.g.position.x-p.x,z.g.position.z-p.z);if(d<best){best=d;b=z}}
 if(b)pl.rot=atan2(b.g.position.x-p.x,b.g.position.z-p.z)}
function strike(){const p=pl.g.position,fx=sin(pl.rot),fz=cos(pl.rot);
 for(const z of Z){if(z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z,d=H(dx,dz);
  if(d<2.7*z.sc&&(d<.8||(dx*fx+dz*fz)/d>.3))dmgZ(z,25)}}

/* ---------- updates ---------- */
function player(dt){const p=pl,g=p.g;
 let mx=joy.x+(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),my=joy.y+(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0);
 let len=H(mx,my);const mv=len>.12;if(len>1){mx/=len;my/=len}
 const fx=sin(yaw),fz=cos(yaw),wx=fx*my-fz*mx,wz=fz*my+fx*mx;
 const run=mv&&(runOn||K.ShiftLeft)&&!p.ex;
 if(run){p.st-=22*dt;p.sd=1;if(p.st<=0){p.st=0;p.ex=true}}else{p.sd-=dt;if(p.sd<=0)p.st=Math.min(100,p.st+16*dt);if(p.ex&&p.st>25)p.ex=false}
 const sp=(run?7.5:4.5)*(p.at>0?.5:1);
 if(mv){g.position.x+=wx*sp*dt;g.position.z+=wz*sp*dt;if(p.at<=0)p.rot=lerpA(p.rot,atan2(wx,wz),14*dt)}
 p.cd-=dt;if((atkHeld||K.KeyJ||K.KeyF)&&p.cd<=0)attack();
 if(p.at>0){p.at-=dt;if(!p.hit&&p.at<.32*.65){p.hit=true;strike()}}
 if(jumpQ&&g.position.y<=.001&&p.st>=8){p.vy=8.5;p.st-=8;p.sd=1}jumpQ=false;
 p.vy-=22*dt;g.position.y+=p.vy*dt;if(g.position.y<0){g.position.y=0;p.vy=0}
 g.position.x=Math.max(-88,Math.min(88,g.position.x));g.position.z=Math.max(-88,Math.min(88,g.position.z));
 collide(g.position,.45);g.rotation.y=p.rot;
 const u=g.userData,air=g.position.y>.05;
 p.amp+=((mv&&!air?(run?.95:.6):0)-p.amp)*Math.min(1,10*dt);p.ph+=dt*(run?13:9)*(mv?1:0);
 const s=sin(p.ph)*p.amp;u.lL.rotation.x=s;u.lR.rotation.x=-s;u.aL.rotation.x=-s;
 u.aR.rotation.x=p.at>0?-2.7+(1-p.at/.32)*2.4:s;
 if(air){u.lL.rotation.x=-.5;u.lR.rotation.x=.3;u.aL.rotation.x=-2.2}}
function zUpdate(dt){const pp=pl.g.position;
 for(let i=Z.length-1;i>=0;i--){const z=Z[i],g=z.g,u=g.userData;
  if(z.dead){z.dt+=dt;g.rotation.x=-Math.min(z.dt*4,1)*PI/2;if(z.dt>1.2)g.position.y=-(z.dt-1.2);if(z.dt>2){scene.remove(g);Z.splice(i,1)}continue}
  let dx=pp.x-g.position.x,dz=pp.z-g.position.z;const d=H(dx,dz)||1;dx/=d;dz/=d;z.cd-=dt;
  if(z.kb>.1){g.position.x-=dx*z.kb*dt;g.position.z-=dz*z.kb*dt;z.kb=Math.max(0,z.kb-dt*22)}
  else if(d>1.15*z.sc){g.position.x+=dx*z.spd*dt;g.position.z+=dz*z.spd*dt;z.ph+=dt*z.spd*2.6}
  else if(z.cd<=0&&pp.y<1.2){z.cd=1.1;hurt(z.dmg);if(S.state!=='play')return}
  for(let j=0;j<i;j++){const o=Z[j];if(o.dead)continue;const ax=g.position.x-o.g.position.x,az=g.position.z-o.g.position.z,ad=H(ax,az);
   if(ad<.9&&ad>.001){const k=(.9-ad)/ad*.5;g.position.x+=ax*k;g.position.z+=az*k;o.g.position.x-=ax*k;o.g.position.z-=az*k}}
  collide(g.position,.45*z.sc);g.rotation.y=atan2(dx,dz);
  const s=sin(z.ph)*.6;u.lL.rotation.x=s;u.lR.rotation.x=-s;u.aL.rotation.x=u.aR.rotation.x=-1.4+sin(z.ph*.7)*.15}}
function spawner(dt){spT-=dt;const alive=Z.reduce((n,z)=>n+(z.dead?0:1),0);
 const max=6+Math.min(8,S.time/25|0)+(S.mi===2?3:0);if(spT>0||alive>=max)return;spT=S.mi===2?1.2:2.2;
 const r=R(),t=S.time>35&&r<.14?'brute':S.time>12&&r<.4?'runner':'walker',T=TY[t];
 for(let k=0;k<8;k++){const a=R()*PI*2,d=26+R()*12,x=pl.g.position.x+sin(a)*d,zz=pl.g.position.z+cos(a)*d;
  if(Math.abs(x)>88||Math.abs(zz)>88||inside(x,zz,0,1.5))continue;
  const g=mk(T.c[0],T.c[1],T.c[2],T.sc,true);g.position.set(x,0,zz);scene.add(g);
  Z.push({g,t,hp:T.hp,spd:T.spd*(.9+R()*.2),dmg:T.dmg,sc:T.sc,cd:1,ph:R()*6,kb:0,dead:false,dt:0});return}}
function camUpdate(){const p=pl.g.position,tx=p.x,ty=p.y*.5+1.5,tz=p.z,cp=cos(pitch);let D=6.2;
 for(let k=0;k<6;k++){cam.position.set(tx-sin(yaw)*cp*D,Math.max(.5,ty+sin(pitch)*D),tz-cos(yaw)*cp*D);if(!inside(cam.position.x,cam.position.z,cam.position.y,.6))break;D*=.72}
 cam.lookAt(tx,ty+.2,tz);light()}
function light(){const p=pl.g.position;sun.position.set(p.x+30,50,p.z+20);sun.target.position.set(p.x,0,p.z);moon.position.set(cam.position.x-120,cam.position.y+110,cam.position.z-250)}
function hud(){const p=pl;$('hp').style.width=p.hp+'%';$('sp').style.width=p.st+'%';$('score').textContent='SCORE '+S.score;$('hurt').style.opacity=hurtA;
 let m;if(S.mi===0)m=`1/3 · Kill zombies ${Math.min(S.kills,KILLS)}/${KILLS}`;
 else if(S.mi===1){let n=1e9;for(const k of P)if(k.kind==='crate')n=Math.min(n,H(k.m.position.x-p.g.position.x,k.m.position.z-p.g.position.z));m=`2/3 · Supply crates ${S.mp}/${CRATES}${n<1e9?' · '+(n|0)+'m':''}`}
 else m=`3/3 · Survive until extraction · ${Math.ceil(SURVIVE-S.mt)}s`;$('mission').textContent='MISSION '+m}
function update(dt){S.time+=dt;if(S.mi===2){S.mt+=dt;if(S.mt>=SURVIVE){end(true);return}}
 player(dt);zUpdate(dt);if(S.state!=='play')return;pickups(dt);spawner(dt);camUpdate();hurtA=Math.max(0,hurtA-dt*1.5);
 hudT-=dt;if(hudT<=0){hudT=.1;hud()}}

/* ---------- loop / fps fallback ---------- */
let last=performance.now(),fr=0,ft=0,lowN=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;
 if(S.state==='play'){update(dt);fr++;ft+=dt;
  if(ft>=2){const f=fr/ft;fr=ft=0;if(S.set==='auto'&&S.q==='high'&&f<28){if(++lowN>=2){applyQ('low');toast('Performance mode enabled')}}else lowN=0}}
 else if(S.state==='menu'){menuT+=dt;cam.position.set(sin(menuT*.25)*8,2.6,cos(menuT*.25)*8);cam.lookAt(0,1.3,0);light();
  const u=pl.g.userData;u.aR.rotation.x=sin(menuT*2)*.1;u.aL.rotation.x=-sin(menuT*2)*.1;
  deco.forEach((z,i)=>{const w=sin(menuT*1.5+i)*.12,u=z.userData;u.aL.rotation.x=u.aR.rotation.x=-1.4+w;z.position.y=Math.abs(sin(menuT*3+i))*.04})}
 renderer.render(scene,cam)}

/* ---------- input ---------- */
const A={play:start,settings:()=>show('sSet'),help:()=>show('sHelp'),menu,pause,resume(){S.state='play';show(null)},
 gfx(){const o=['auto','high','low'];S.set=o[(o.indexOf(S.set)+1)%3];applyQ(S.set==='low'?'low':'high');gfxLabel();save()}};
const gfxLabel=()=>$('gfx').textContent='GRAPHICS: '+S.set.toUpperCase();
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a]()});
$('sens').addEventListener('input',e=>{S.sens=+e.target.value;save()});
addEventListener('keydown',e=>{K[e.code]=1;if(e.code==='Space'){jumpQ=true;e.preventDefault()}if(e.code==='Escape'||e.code==='KeyP'){S.state==='play'?pause():S.state==='pause'&&A.resume()}});
addEventListener('keyup',e=>K[e.code]=0);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
document.addEventListener('contextmenu',e=>e.preventDefault());
let camId=null,lx=0,ly=0;const cvs=$('c');
cvs.addEventListener('pointerdown',e=>{if(camId===null){camId=e.pointerId;lx=e.clientX;ly=e.clientY;cvs.setPointerCapture(e.pointerId)}});
cvs.addEventListener('pointermove',e=>{if(e.pointerId!==camId||S.state!=='play')return;
 yaw-=(e.clientX-lx)*.006*S.sens;pitch=Math.max(.05,Math.min(1.1,pitch+(e.clientY-ly)*.004*S.sens));lx=e.clientX;ly=e.clientY});
['pointerup','pointercancel'].forEach(t=>cvs.addEventListener(t,e=>{if(e.pointerId===camId)camId=null}));
const joyEl=$('joy'),knob=$('knob');let joyId=null;
function joyMove(e){const r=joyEl.getBoundingClientRect(),R2=r.width/2,dx=e.clientX-(r.left+R2),dy=e.clientY-(r.top+R2),d=H(dx,dy),k=d>R2?R2/d:1;
 knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;joy.x=dx*k/R2;joy.y=-dy*k/R2}
const joyEnd=e=>{if(e.pointerId!==joyId)return;joyId=null;joy.x=joy.y=0;knob.style.transform=''};
joyEl.addEventListener('pointerdown',e=>{e.preventDefault();joyId=e.pointerId;joyEl.setPointerCapture(e.pointerId);joyMove(e)});
joyEl.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
joyEl.addEventListener('pointerup',joyEnd);joyEl.addEventListener('pointercancel',joyEnd);
const hold=(el,on,off)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();on()});if(off)['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,off))};
hold($('atk'),()=>{atkHeld=true;attack()},()=>atkHeld=false);
hold($('jmp'),()=>jumpQ=true);
hold($('run'),()=>{runOn=!runOn;$('run').classList.toggle('on',runOn)});

/* ---------- init ---------- */
build();$('sens').value=S.sens;gfxLabel();applyQ(S.set==='low'?'low':'high');menu();requestAnimationFrame(loop);
})();
