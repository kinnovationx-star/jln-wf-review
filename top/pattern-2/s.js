(function(){
var h=document.documentElement;if(!h.classList.contains('anim'))return;
function cl(v,a,b){return Math.max(a,Math.min(b,v))}function eo(t){return 1-Math.pow(1-t,3)}function eio(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
var fr=document.querySelector('.s-frame'),cv=document.querySelector('.s-inkc'),blk=document.querySelector('.s-blk'),sl=[].slice.call(document.querySelectorAll('.s-sl img')),wph=document.querySelector('.s-wph'),mq=[].slice.call(document.querySelectorAll('[data-mq]')),keys=document.querySelector('.s-keys');
/* インクの広がり：画面の各点に「いつ染まるか」の値を作り、値を超えた点だけ塗る */
var ctx=cv.getContext('2d'),W,H,img,maps=[],lut=new Uint8ClampedArray(256);
function mk(seed,sx,sy){var R=(function(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}})(seed),G=64,g=new Float32Array(G*G),i,x,y;for(i=0;i<G*G;i++)g[i]=R();
 function vn(a,b){var x0=Math.floor(a),y0=Math.floor(b),fx=a-x0,fy=b-y0;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);var q=function(u,v){return g[((v&63)<<6)|(u&63)]};return (q(x0,y0)*(1-fx)+q(x0+1,y0)*fx)*(1-fy)+(q(x0,y0+1)*(1-fx)+q(x0+1,y0+1)*fx)*fy}
 var m=new Uint8Array(W*H),asp=W/H,k=0;
 for(y=0;y<H;y++)for(x=0;x<W;x++){var u=x/H,v=y/H,dx=(x/W-sx)*asp,dy=y/H-sy,d=Math.sqrt(dx*dx+dy*dy)/(asp*1.02);
  var n=vn(u*3.2+dx*2,v*3.2)*.55+vn(u*9,v*9)*.27+vn(u*26,v*26)*.12+vn(u*70,v*70)*.06;
  m[k++]=cl((d*.92+(n-.5)*.6+.08)*255,0,255)}
 /* 飛び散る粒 */
 var cnt=170,c,r,cx,cy,a,b;for(c=0;c<cnt;c++){a=R()*6.283;b=.18+Math.pow(R(),.7)*.62;cx=sx+Math.cos(a)*b;cy=sy+Math.sin(a)*b*asp;r=(R()<.08?7:1+R()*3.2)*W/960;var X=Math.round(cx*W),Y=Math.round(cy*H),tv=cl((b*.8-.03)*255,6,250);
  for(y=Math.max(0,Y-r|0);y<=Math.min(H-1,Y+r);y++)for(x=Math.max(0,X-r|0);x<=Math.min(W-1,X+r);x++){if((x-X)*(x-X)+(y-Y)*(y-Y)<=r*r){var id=(y|0)*W+(x|0);if(m[id]>tv)m[id]=tv}}}
 return m}
var seeds=[[11,.1,.86],[29,.9,.14],[47,.16,.12]],t=0,last=0,idx=0,period=8200,drawn=-1,gen=0;
function setup(){W=innerWidth<768?400:800;H=Math.round(W*fr.clientHeight/fr.clientWidth);cv.width=W;cv.height=H;img=ctx.createImageData(W,H);for(var i=0;i<W*H;i++){var p=i*4;img.data[p]=0;img.data[p+1]=64;img.data[p+2]=205}maps=[];var g=++gen;seeds.forEach(function(s,i){setTimeout(function(){if(g===gen)maps[i]=mk(s[0],s[1],s[2])},i*700)})}
function ink(tv){var m=maps[idx%3]||maps[0],d=img.data,i,k=tv*255;for(i=0;i<256;i++)lut[i]=cl((k-i)*70,0,255);for(i=0;i<m.length;i++)d[i*4+3]=lut[m[i]];ctx.putImageData(img,0,0)}
function poly(a,b,c,e){blk.style.clipPath='polygon('+a.toFixed(2)+'% 0,'+b.toFixed(2)+'% 0,'+c.toFixed(2)+'% 100%,'+e.toFixed(2)+'% 100%)'}
function L(a,b,p){return a+(b-a)*p}
function fv(dt,vis){t+=dt;if(t>=period){t-=period;idx++}
 if(!vis||!maps.length)return;
 var q=t;
 /* 1. インクが広がる */
 var ip=cl((q-1500)/2600,0,1),v=eo(ip)*.76;if(q>=6000)v=0;if(v!==drawn){ink(v);drawn=v}
 /* 2. 黒い面が斜めに入る→全面を覆う→次の写真へ抜ける */
 if(q<3600)poly(125,125,125,125);
 else if(q<4700){var a=eio((q-3600)/1100);poly(L(125,50,a),L(125,108,a),L(125,88,a),L(125,31,a))}
 else if(q<5300)poly(50,108,88,31);
 else if(q<6000){var b=eio((q-5300)/700);poly(L(50,-30,b),108+b*20,88+b*40,L(31,-30,b))}
 else if(q<6300)poly(-30,128,128,-30);
 else if(q<7300){var c=eio((q-6300)/1000);poly(L(-30,128,c),128,128,L(-50,128,c))}
 else poly(125,125,125,125);
 /* 黒で隠れている間に写真を替える */
 var cur=idx%sl.length,want=q>=6000?(cur+1)%sl.length:cur;sl.forEach(function(e,i){var on=i===want;if(on!==e.classList.contains('on'))e.classList.toggle('on',on)})}
var t0=performance.now();
function frame(now){var dt=Math.min(60,now-(last||now));last=now;var vh=innerHeight,y=scrollY;
 if(cv)fv(dt,y<vh*1.05);
 if(wph){var r=wph.getBoundingClientRect(),p=eo(cl((vh-r.top)/(vh*.85),0,1));wph.style.setProperty('--wy',((1-p)*7).toFixed(2)+'%');wph.style.setProperty('--wx',((1-p)*5).toFixed(2)+'%')}
 if(keys&&keys.getBoundingClientRect().top<vh*.9)keys.classList.add('seen');
 mq.forEach(function(m){var rr=m.getBoundingClientRect();if(rr.bottom<-50||rr.top>vh+50)return;var tr=m.firstElementChild,w=tr.scrollWidth/parseFloat(m.dataset.n),x=((now-t0)*.028+y*.12)%w;tr.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)'});
 requestAnimationFrame(frame)}
setTimeout(setup,80);var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){drawn=-1;setup()},300)});
requestAnimationFrame(frame)})();
