(function(){
var h=document.documentElement,head=document.querySelector('.head'),zones=[].slice.call(document.querySelectorAll('[data-hd]'));
head.classList.add('js');
var logo=head.querySelector('.logo'),fvEl=document.querySelector('.s-fv');
function zone(){var z='light';zones.forEach(function(s){var r=s.getBoundingClientRect();if(r.top<=40&&r.bottom>40)z=s.getAttribute('data-hd')});var off=false;if(z==='fv'){var f=fvEl.getBoundingClientRect(),l=logo.getBoundingClientRect(),m=innerWidth<768;off=l.right/(f.width*(m?.52:.3))+(l.bottom-f.top)/(f.height*(m?.32:.4))>=1}head.classList.toggle('z-fvd',off);head.classList.toggle('z-fv',z==='fv');head.classList.toggle('z-dark',z==='dark');head.classList.toggle('z-light',z==='light')}
addEventListener('scroll',zone,{passive:true});addEventListener('resize',zone);zone();
var an=h.classList.contains('anim');
var ph=[].slice.call(document.querySelectorAll('.s-sl img'));if(ph.length>1&&an){var pi=0;setInterval(function(){ph[pi].classList.remove('on');pi=(pi+1)%ph.length;ph[pi].classList.add('on')},7000)}
if(!an)return;
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
/* スライダー：前後に複製を足して輪にする。複製は読み上げ・キーボードの対象にしない */
var sl=document.querySelector('.s-sli');
if(sl){var tr=sl.querySelector('.s-trk'),orig=[].slice.call(tr.children),N=orig.length,ds=[].slice.call(document.querySelectorAll('.s-ctl .ds button')),idx=0,hold=false;
 function mk(el){var c=el.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('a').forEach(function(a){a.tabIndex=-1});return c}
 orig.slice().reverse().forEach(function(el){tr.insertBefore(mk(el),tr.firstChild)});orig.forEach(function(el){tr.appendChild(mk(el))});
 sl.classList.add('s-on');
 function size(){var w=innerWidth;sl.style.setProperty('--cw',(w>=1024?w*.325:w>=768?w*.52:w*.8)+'px')}
 function step(){var a=tr.children[0],b=tr.children[1];return b.getBoundingClientRect().left-a.getBoundingClientRect().left}
 function place(anim){tr.style.transition=anim?'':'none';tr.style.transform='translate3d('+(-(idx+N)*step())+'px,0,0)';var k=((idx%N)+N)%N;ds.forEach(function(d,i){d.classList.toggle('on',i===k);d.setAttribute('aria-current',i===k?'true':'false')})}
 function go(i){idx=i;place(true)}
 tr.addEventListener('transitionend',function(e){if(e.target!==tr)return;if(idx<0||idx>=N){idx=((idx%N)+N)%N;place(false)}});
 size();place(false);addEventListener('resize',function(){size();place(false)});
 document.querySelector('.s-ctl .pv').addEventListener('click',function(){go(idx-1)});document.querySelector('.s-ctl .nx').addEventListener('click',function(){go(idx+1)});
 ds.forEach(function(d,i){d.addEventListener('click',function(){go(i)})});
 var wrap=sl.parentElement;wrap.addEventListener('mouseenter',function(){hold=true});wrap.addEventListener('mouseleave',function(){hold=false});
 sl.addEventListener('focusin',function(e){var li=e.target.closest('.s-lk'),k=orig.indexOf(li);sl.scrollLeft=0;hold=true;if(k>=0)go(k)});sl.addEventListener('focusout',function(){hold=false});
 var sx=null,moved=false;sl.addEventListener('pointerdown',function(e){sx=e.clientX;moved=false});addEventListener('pointerup',function(e){if(sx===null)return;var d=e.clientX-sx;sx=null;if(Math.abs(d)>40){moved=true;go(idx+(d<0?1:-1))}});sl.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false}},true);
 setInterval(function(){var r=sl.getBoundingClientRect();if(!hold&&!document.hidden&&r.top<innerHeight&&r.bottom>0)go(idx+1)},5200)}
/* スクロールと連動する動き */
var rows=[].slice.call(document.querySelectorAll('.s-row')),lastW=0;
function fit(force){var w=innerWidth;if(!force&&w===lastW)return;lastW=w;var pb=document.createElement('div');pb.style.cssText='position:fixed;top:0;left:-9px;width:1px;height:100svh;visibility:hidden';document.body.appendChild(pb);var av=pb.offsetHeight-64;pb.remove();rows.forEach(function(r){r.classList.remove('st');if(w<1024&&r.firstElementChild.offsetHeight<=av)r.classList.add('st')})}
fit(true);addEventListener('resize',function(){fit()});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fit(true)});
var fly=[].slice.call(document.querySelectorAll('[data-fly]')),fix=[].slice.call(document.querySelectorAll('.s-fix')),arc=document.querySelector('.s-arc'),mq=[].slice.call(document.querySelectorAll('[data-mq][data-n]')),big=[].slice.call(document.querySelectorAll('.s-big')),t0=performance.now();
function frame(now){var vh=innerHeight,y=scrollY,w=innerWidth;
 if(arc&&y<vh*1.2)arc.style.transform='translate3d(0,'+(y*-.12).toFixed(1)+'px,0)';
 fix.forEach(function(f){var r=f.parentElement.getBoundingClientRect();f.style.setProperty('--b',cl((-r.top-vh*.25)/Math.max(r.height-vh*1.4,1),0,1).toFixed(3))});
 fly.forEach(function(el){var s=el.closest('section').getBoundingClientRect();if(s.bottom<-200||s.top>vh+200)return;var k=parseFloat(el.dataset.fly)*(w<768?.45:1);el.style.transform='translate3d(0,'+(s.top*k).toFixed(1)+'px,0)'});
 rows.forEach(function(row,i){var a=row.firstElementChild,n=rows[i+1];if(!n||(w<1024&&!row.classList.contains('st'))){a.style.opacity='';a.style.transform='';return}if(w<1024){var u=cl(1-(n.getBoundingClientRect().top-64)/(vh-64),0,1),q=cl((u-.45)/.55,0,1);if(q>0){a.style.opacity=(1-q*.8).toFixed(3);a.style.transform='scale('+(1-q*.05).toFixed(3)+')'}else{a.style.opacity='';a.style.transform=''}return}var t=cl(1-n.getBoundingClientRect().top/vh,0,1);if(t>0){a.style.opacity=(1-t*1.15).toFixed(3);a.style.transform='translate3d(0,'+(-t*7).toFixed(2)+'vh,0) scale('+(1-t*.05).toFixed(3)+')'}else{a.style.opacity='';a.style.transform=''}});
 big.forEach(function(b){if(b.getBoundingClientRect().top<vh*.92)b.classList.add('seen')});
 mq.forEach(function(m){var rr=m.getBoundingClientRect();if(rr.bottom<-50||rr.top>vh+50)return;var tr=m.firstElementChild,u=tr.scrollWidth/parseFloat(m.dataset.n),x=((now-t0)*.045+y*.3)%u;tr.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)'});
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();
