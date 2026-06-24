/* Fodman International — main.js (shared across ALL pages) */
(function(){
  'use strict';
  document.documentElement.classList.add('js');

  // ─── PRELOADER ───
  (function(){
    const pl = document.getElementById('preloader');
    if(!pl) return;
    let hidden=false;
    function hide(){ if(hidden)return; hidden=true; pl.classList.add('done'); document.body.style.overflow=''; setTimeout(()=>{pl.style.display='none';},750); }
    document.body.style.overflow='hidden';
    const minTime=2200, start=performance.now();
    window.addEventListener('load',()=>{ const el=performance.now()-start; setTimeout(hide,Math.max(0,minTime-el)); });
    setTimeout(hide,3600);
  })();

  // ─── NAV SCROLL ───
  (function(){
    const nav=document.querySelector('.nav');
    if(!nav)return;
    const f=()=>nav.classList.toggle('scrolled',window.scrollY>40);
    window.addEventListener('scroll',f,{passive:true}); f();
  })();

  // ─── MOBILE NAV ───
  (function(){
    const burger=document.querySelector('.nav-burger'), mn=document.querySelector('.mobile-nav');
    if(!burger||!mn)return;
    burger.addEventListener('click',()=>{
      const open=mn.classList.toggle('open');
      burger.innerHTML=open?'&#10005;':'&#9776;';
      document.body.style.overflow=open?'hidden':'';
    });
    mn.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      mn.classList.remove('open'); burger.innerHTML='&#9776;'; document.body.style.overflow='';
    }));
  })();

  // ─── SCROLL REVEAL ───
  (function(){
    const els=document.querySelectorAll('.reveal,.reveal-right');
    if(!els.length)return;
    if(!('IntersectionObserver'in window)){ els.forEach(e=>e.classList.add('visible')); return; }
    const o=new IntersectionObserver((ents)=>{ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target);}});},{threshold:.1});
    els.forEach(e=>o.observe(e));
  })();

  // ─── SVG SYMBOL DRAW-ON ───
  (function(){
    const wraps=document.querySelectorAll('.sym-wrap');
    if(!wraps.length||!('IntersectionObserver'in window))return;
    const o=new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(e.isIntersecting){
          e.target.querySelectorAll('.sym-draw').forEach((el,i)=>setTimeout(()=>el.classList.add('drawn'),i*80));
          o.unobserve(e.target);
        }
      });
    },{threshold:.4});
    wraps.forEach(w=>o.observe(w));
  })();

  // ─── COUNTERS ───
  (function(){
    const cs=document.querySelectorAll('[data-counter]');
    if(!cs.length)return;
    const o=new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if(e.isIntersecting&&!e.target.dataset.done){
          e.target.dataset.done='1';
          const t=parseFloat(e.target.dataset.target), sfx=e.target.dataset.suffix||'', dur=1500, st=performance.now();
          function step(now){ const p=Math.min((now-st)/dur,1), ease=1-Math.pow(1-p,3); e.target.textContent=Math.round(t*ease)+sfx; if(p<1)requestAnimationFrame(step); }
          requestAnimationFrame(step); o.unobserve(e.target);
        }
      });
    },{threshold:.6});
    cs.forEach(c=>o.observe(c));
  })();

  // ─── TICKER DUPLICATE ───
  (function(){
    const t=document.querySelector('.ticker-track');
    if(!t)return;
    Array.from(t.children).forEach(el=>t.appendChild(el.cloneNode(true)));
  })();

  // ─── RFQ FORM (demo) ───
  (function(){
    const form=document.querySelector('.rfq-form');
    if(!form)return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const btn=form.querySelector('[type=submit]');
      btn.innerHTML='Submitting…'; btn.disabled=true;
      setTimeout(()=>{
        btn.innerHTML='&#10003; RFQ Submitted'; btn.style.background='#0F7A52';
        if(!form.querySelector('.form-success')){
          const m=document.createElement('p');
          m.className='form-success';
          m.textContent='Thank you. Our corporate accounts team will respond within one business day.';
          m.style.cssText='color:#0F7A52;font-size:.88rem;margin-top:14px;font-weight:500;text-align:center';
          btn.after(m);
        }
      },1200);
    });
  })();

  // ─── UPLOAD ZONE ───
  (function(){
    const zone=document.querySelector('.upload-zone');
    if(!zone)return;
    const input=document.createElement('input');
    input.type='file'; input.accept='.pdf,.docx'; input.style.display='none';
    zone.appendChild(input);
    const label=zone.querySelector('span');
    zone.addEventListener('click',()=>input.click());
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.style.borderColor='var(--purple)';});
    zone.addEventListener('dragleave',()=>{zone.style.borderColor='';});
    zone.addEventListener('drop',e=>{e.preventDefault();zone.style.borderColor='';if(e.dataTransfer.files[0]&&label)label.textContent='\u2713 '+e.dataTransfer.files[0].name;});
    input.addEventListener('change',()=>{if(input.files[0]&&label)label.textContent='\u2713 '+input.files[0].name;});
  })();

  // ─── SMOOTH ANCHORS ───
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      if(id==='#'||id.length<2)return;
      const el=document.querySelector(id);
      if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}
    });
  });
})();
