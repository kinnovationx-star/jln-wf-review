(function(){
var h=document.documentElement,an=h.classList.contains('anim'),head=document.querySelector('.head'),top=document.querySelector('.p-top');
var ly=scrollY;
function st(){var y=scrollY,vh=innerHeight;if(top)top.classList.toggle('on',y>vh*.5);head.classList.toggle('p-s',y>vh*.3);
 if(y<vh*.3)head.classList.remove('p-hide');else if(y>ly+3)head.classList.add('p-hide');else if(y<ly-3)head.classList.remove('p-hide');ly=y}
addEventListener('scroll',st,{passive:true});st();
if(!an)return;
var ph=[].slice.call(document.querySelectorAll('.p-bg img'));if(ph.length>1){var i=0;setInterval(function(){ph[i].classList.remove('on');i=(i+1)%ph.length;ph[i].classList.add('on')},6000)}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
var bg=document.querySelector('.p-bg'),h1=document.querySelector('.p-fv h1'),rail=document.querySelector('.p-rail'),rtr=document.querySelector('.p-rtr'),co=document.querySelector('.p-co'),cox=document.querySelector('.p-cox'),coxs=document.querySelector('.p-coxs');
var mq=[].slice.call(document.querySelectorAll('[data-mq]')),t0=performance.now();
function frame(now){var vh=innerHeight,y=scrollY,vw=innerWidth;
 var o=1-cl((y-vh*.1)/(vh*.48),0,1);bg.style.opacity=o.toFixed(3);bg.style.visibility=o<=0?'hidden':'visible';
 h1.style.setProperty('--ta',(.58+.42*cl(y/(vh*.4),0,1)).toFixed(3));
 var r=rail.getBoundingClientRect();if(r.bottom>-100&&r.top<vh+100){var p=cl((vh-r.top)/(vh+r.height),0,1),rg=Math.max(0,rtr.scrollWidth-vw);rtr.style.transform='translate3d('+(-(vw*.04+p*rg*.86)).toFixed(1)+'px,0,0)'}
 var rc=co.getBoundingClientRect();if(rc.bottom>-100&&rc.top<vh+100){var q=cl((vh-rc.top)/(vh*.9),0,1);co.style.setProperty('--cg',((1-q)*2.4).toFixed(2)+'vw');co.style.setProperty('--cr',((1-q)*36).toFixed(1)+'px')}
 var rx=cox.getBoundingClientRect();if(rx.bottom>-100&&rx.top<vh+100){var pp=cl(-rx.top/(rx.height-vh),0,1),a=ease(cl(pp/.78,0,1)),sp=vw<768,y0=sp?26:27,x0=sp?14:35,w0=sp?.5:.24;
  coxs.style.setProperty('--ey',((1-a)*y0).toFixed(2)+'vh');coxs.style.setProperty('--ex',((1-a)*x0).toFixed(2)+'vw');coxs.style.setProperty('--er',((1-a)*14).toFixed(1)+'px');coxs.style.setProperty('--es',(1.16-.16*a).toFixed(3));coxs.style.setProperty('--ew',(w0+(1-w0)*a).toFixed(3))}
 mq.forEach(function(m){var rr=m.getBoundingClientRect();if(rr.bottom<-50||rr.top>vh+50)return;var tr=m.firstElementChild,w=tr.scrollWidth/parseFloat(m.dataset.n),x=((now-t0)*.045+y*.4)%w;tr.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)'});
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();
