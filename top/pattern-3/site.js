(function(){
var head=document.querySelector('.head');function sc(){head.classList.toggle('solid',scrollY>40)}addEventListener('scroll',sc,{passive:true});sc();
var b=document.querySelector('.burger'),d=document.getElementById('drawer');
if(b&&d){var c=d.querySelector('.drawer-close');
function o(){d.hidden=false;b.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';c.focus()}
function x(){d.hidden=true;b.setAttribute('aria-expanded','false');document.body.style.overflow='';b.focus()}
b.addEventListener('click',o);c.addEventListener('click',x);d.addEventListener('click',function(e){if(e.target===d)x()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!d.hidden)x()})}
var ms=[].slice.call(document.querySelectorAll('.has-mega'));
function close(){ms.forEach(function(m){m.classList.remove('open');m.querySelector('button').setAttribute('aria-expanded','false')})}
ms.forEach(function(m){var t=m.querySelector('button');var hov=window.matchMedia('(hover:hover)').matches;
function open(){close();m.classList.add('open');t.setAttribute('aria-expanded','true')}
t.addEventListener('click',function(e){e.stopPropagation();if(hov||!m.classList.contains('open'))open();else close()});
if(hov){m.addEventListener('mouseenter',open);m.addEventListener('mouseleave',close)}
m.querySelector('.mega').addEventListener('click',function(e){e.stopPropagation()})});
document.addEventListener('click',close);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var a=document.querySelector('.has-mega.open button');close();if(a)a.focus()}});

ms.forEach(function(m){m.addEventListener('focusout',function(e){if(e.relatedTarget&&!m.contains(e.relatedTarget)){m.classList.remove('open');m.querySelector('button').setAttribute('aria-expanded','false')}})});
if(d){d.addEventListener('keydown',function(e){if(e.key!=='Tab')return;var f=[].slice.call(d.querySelectorAll('a,button')).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}})}

/* 動き：reveal（表示で出す）・視差・横流れ・線の描画。動きを減らす設定では何もしない */
if(document.documentElement.classList.contains('anim')){
var rv=[].slice.call(document.querySelectorAll('[data-r]'));
var ps=[].slice.call(document.querySelectorAll('[data-p]')),xs=[].slice.call(document.querySelectorAll('[data-x]')),fd=document.querySelector('[data-fade]'),rt=document.querySelector('.fv .routes'),run=document.querySelector('[data-run]');
var rp=rt?[].slice.call(rt.querySelectorAll('path')):[];
var tick=false;function frame(){tick=false;var vh=innerHeight,y=scrollY;
/* 表示の判定は位置で行う（幕で隠した写真は IntersectionObserver では交差しないため） */
rv=rv.filter(function(el){var r=el.getBoundingClientRect();if(r.top<vh*.92){el.classList.add('seen');return false}return true});
ps.forEach(function(el){var par=el.parentElement.getBoundingClientRect();if(par.bottom<-200||par.top>vh+200)return;var d=(par.top+par.height/2-vh/2)*parseFloat(el.dataset.p);var over=(el.offsetHeight-el.parentElement.offsetHeight)/2;if(over>0)d=Math.max(-over,Math.min(over,d));el.style.transform='translate3d(0,'+d.toFixed(1)+'px,0)'});
xs.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;var d=(r.top+r.height/2-vh/2)*parseFloat(el.dataset.x);el.style.transform='translate3d('+d.toFixed(1)+'px,0,0)'});
if(fd){var t=Math.min(1,y/(vh*.8));fd.style.opacity=(1-t*1.1).toFixed(3);fd.style.transform='translate3d(0,'+(t*70).toFixed(1)+'px,0)'}
if(rp.length){var q=Math.min(1,y/(vh*.9));rp.forEach(function(pa,i){pa.style.strokeDashoffset=(q*(420+i*90)).toFixed(0)})}
if(run){[].forEach.call(run.children,function(u){u.style.translate=(-y*.18%u.offsetWidth).toFixed(1)+'px 0'})}
}
function on(){if(!tick){tick=true;requestAnimationFrame(frame)}}addEventListener('scroll',on,{passive:true});addEventListener('resize',on);frame();
}
})();