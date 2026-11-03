
(function(){
  var burger=document.querySelector('.burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    var close=drawer.querySelector('.drawer-close');
    function openD(){drawer.hidden=false;burger.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';close.focus();}
    function closeD(){drawer.hidden=true;burger.setAttribute('aria-expanded','false');document.body.style.overflow='';burger.focus();}
    burger.addEventListener('click',openD);close.addEventListener('click',closeD);
    drawer.addEventListener('click',function(e){if(e.target===drawer)closeD();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!drawer.hidden)closeD();});
  }
  // B案の固定ボタン：FVを過ぎてから出す（小さな画面でFVのボタンと重ねない）
  var sticky=document.querySelector('.sticky-cta');
  if(sticky){var fv=document.querySelector('.fv,.phead');var lim=function(){return fv?fv.offsetTop+fv.offsetHeight*0.6:200;};
    var upd=function(){sticky.classList.toggle('off',scrollY<lim());};upd();addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);}
  // メガメニュー：Escapeで閉じる（表示はCSSのhover・focus-within）
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){var a=document.activeElement;if(a&&a.closest&&a.closest('.has-mega'))a.blur();}
  });
  var form=document.getElementById('wf-form');
  if(!form)return;
  if(/type=recruit/.test(location.search)){var r0=form.querySelector('[data-recruit]');if(r0)r0.checked=true;}
  var conf=document.getElementById('confirm'),list=document.getElementById('cf-list'),err=document.getElementById('form-err');
  var interest=form.querySelector('[data-interest]'),rec=form.querySelector('[data-recruit]');
  function syncType(){if(interest&&rec){interest.hidden=rec.checked;}}
  form.querySelectorAll('input[type=radio]').forEach(function(x){x.addEventListener('change',syncType);});
  syncType();
  function mark(box,bad){
    var m=box.querySelector('.fld-err');
    box.classList.toggle('invalid',bad);
    if(bad&&!m){m=document.createElement('p');m.className='fld-err';m.textContent='入力してください。';box.appendChild(m);}
    if(!bad&&m)m.remove();
  }
  function valid(){
    var ok=true;
    form.querySelectorAll('.fld').forEach(function(box){
      if(box.hidden)return;
      var bad=false;
      box.querySelectorAll('[required]').forEach(function(el){
        if(el.type==='radio'||el.type==='checkbox'){if(!form.querySelector('[name="'+el.name+'"]:checked'))bad=true;}
        else if(!el.value.trim())bad=true;
      });
      if(box.hasAttribute('data-multi-req')&&!box.querySelector('input:checked'))bad=true;
      mark(box,bad);if(bad)ok=false;
    });
    var ag=form.querySelector('[name=agree]');if(ag&&!ag.checked)ok=false;
    return ok;
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!valid()){err.hidden=false;(form.querySelector('.fld.invalid')||err).scrollIntoView({block:'center'});return;}
    err.hidden=true;list.innerHTML='';
    form.querySelectorAll('.fld').forEach(function(f){
      if(f.hidden)return;
      var lab=(f.querySelector('legend')||f.querySelector('label')).childNodes[0].textContent.trim(),val;
      var checked=f.querySelectorAll('input:checked');
      if(checked.length){val=Array.prototype.map.call(checked,function(c){return c.value;}).join('、');}
      else{var i=f.querySelector('input,textarea');val=i?i.value:'';}
      var d=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=lab;dd.textContent=val||'（未入力）';d.appendChild(dt);d.appendChild(dd);list.appendChild(d);
    });
    form.hidden=true;conf.hidden=false;conf.querySelector('h2').focus();window.scrollTo(0,conf.getBoundingClientRect().top+scrollY-120);
  });
  document.getElementById('cf-back').addEventListener('click',function(){conf.hidden=true;form.hidden=false;form.querySelector('input,textarea').focus();});
})();
