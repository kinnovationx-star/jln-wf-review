(function(){
var h=document.documentElement;if(!h.classList.contains('anim'))return;
function cl(v,a,b){return Math.max(a,Math.min(b,v))}function ss(x){return x*x*(3-2*x)}
var kb=document.querySelector('.t-kb'),kt=kb&&kb.firstElementChild,fl=[].slice.call(document.querySelectorAll('[data-fly]'));
var cow=document.querySelector('.t-cow'),cds=[].slice.call(document.querySelectorAll('.t-cd')),ows=[].slice.call(document.querySelectorAll('.t-ow span'));
var pin=matchMedia('(min-height:620px)'),wide=matchMedia('(min-width:768px)');
cds.forEach(function(c,i){c.style.zIndex=3-i});
/* 隠れたカードへキーボードで移ったら、そのカードが前に来る位置までスクロールする */
cds.forEach(function(c,i){c.addEventListener('focusin',function(){if(!pin.matches)return;var r=cow.getBoundingClientRect();var y=scrollY+r.top+(r.height-innerHeight)*i/2;if(Math.abs(y-scrollY)>4)scrollTo({top:y,behavior:'auto'})})});
var t0=performance.now(),last=-1;
function frame(now){var vh=innerHeight;
 if(kb){var rr=kb.getBoundingClientRect();if(rr.bottom>-50&&rr.top<vh+50){var w=kt.scrollWidth/3,x=((now-t0)*.045+scrollY*.3)%w;kt.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)'}}
 fl.forEach(function(f){if(!wide.matches){f.style.transform='';f._d=0;return}var r=f.getBoundingClientRect(),d0=f._d||0,c=r.top-d0+r.height/2;if(c<-vh||c>vh*2)return;var d=(c-vh/2)*parseFloat(f.dataset.fly);f._d=d;f.style.transform='translate3d(0,'+d.toFixed(1)+'px,0)'});
 if(cow){if(pin.matches){var r=cow.getBoundingClientRect(),t=cl(-r.top/(r.height-vh),0,1)*2,k=Math.min(1,Math.floor(t)),f2=t-k,p=k+ss(cl((f2-.22)/.56,0,1));
   if(r.bottom>-50&&r.top<vh+50){cds.forEach(function(c,i){var a=p-i;var ul=c.parentElement,dd=ul.offsetTop+ul.offsetHeight+24;c.style.transform=a>0?'translate3d(0,'+(-a*dd).toFixed(1)+'px,0)':'translate3d('+(Math.min(2,-a)*4).toFixed(1)+'%,0,0)'});
    var on=Math.round(p);if(on!==last){last=on;ows.forEach(function(o,i){o.classList.toggle('on',i===on)})}}}
  else if(last!==-1){last=-1;cds.forEach(function(c){c.style.transform=''});ows.forEach(function(o){o.classList.remove('on')})}}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();
