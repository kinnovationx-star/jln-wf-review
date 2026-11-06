(function(){
var h=document.documentElement;
var ph=[].slice.call(document.querySelectorAll('.k-ph img'));if(ph.length>1&&h.classList.contains('anim')){var i=0;setInterval(function(){ph[i].classList.remove('on');i=(i+1)%ph.length;ph[i].classList.add('on')},6000)}
if(!h.classList.contains('anim'))return;
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
var bl=document.querySelector('.k-blind'),bd=[].slice.call(document.querySelectorAll('.k-bd i')),bh=document.querySelector('.k-bhead'),ex=document.querySelector('.k-ex'),exs=document.querySelector('.k-exs');
var dg=[].slice.call(document.querySelectorAll('.k-dg')),mq=[].slice.call(document.querySelectorAll('[data-mq]'));
var t0=performance.now();
function frame(now){var vh=innerHeight,y=scrollY;
 if(bl){var r=bl.getBoundingClientRect(),st=vh*.55,p=cl((st-r.top)/(r.height-vh+st),0,1);
  bd.forEach(function(b,k){var o=k*.035,c=cl((p-o)/(.5-.18),0,1),u=cl((p-.5-o*.5)/.2,0,1);
   if(u>0){b.style.transformOrigin='center bottom';b.style.transform='scaleY('+(1-u).toFixed(3)+')'}else{b.style.transformOrigin='center top';b.style.transform='scaleY('+c.toFixed(3)+')'}});
  bl.style.setProperty('--bp',p.toFixed(3));if(bh){var q=cl((p-.46)/.06,0,1);bh.style.opacity=q;bh.style.transform='translateY('+((1-q)*30)+'px)'}}
 if(ex){var r2=ex.getBoundingClientRect(),p2=cl((vh-r2.top)/(r2.height),0,1),a=cl((p2-.05)/.45,0,1),b2=cl((p2-.42)/.14,0,1);
  exs.style.setProperty('--ey',((1-a)*14).toFixed(2)+'vh');exs.style.setProperty('--ex',((1-a)*8).toFixed(2)+'vw');exs.style.setProperty('--eo',(.1+.52*b2).toFixed(3));exs.style.setProperty('--et',b2.toFixed(3));exs.style.setProperty('--etY',((1-b2)*40).toFixed(1)+'px')}
 dg.forEach(function(d){var s=d.parentElement.getBoundingClientRect();d.style.setProperty('--s',cl((vh-s.top)/(vh*1.05),0,1).toFixed(3))});
 mq.forEach(function(m){var rr=m.getBoundingClientRect();if(rr.bottom<-50||rr.top>vh+50)return;var tr=m.firstElementChild,w=tr.scrollWidth/parseFloat(m.dataset.n),x=((now-t0)*.05+y*.45)%w;tr.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)'});
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();
