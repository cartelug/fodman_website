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
    const minTime=650, start=performance.now();
    window.addEventListener('load',()=>{ const el=performance.now()-start; setTimeout(hide,Math.max(0,minTime-el)); });
    setTimeout(hide,1800);
  })();

  // ─── NAV SCROLL ───
  (function(){
    const nav=document.querySelector('.nav');
    if(!nav)return;
    const f=()=>nav.classList.toggle('scrolled',window.scrollY>40);
    window.addEventListener('scroll',f,{passive:true}); f();
  })();

  // ─── MOBILE NAV ───
  // Burger morphs to an X via CSS (.open class), panel animates via
  // opacity/transform (see style.css) — no more innerHTML glyph swap.
  (function(){
    const burger=document.querySelector('.nav-burger'), mn=document.querySelector('.mobile-nav');
    if(!burger||!mn)return;
    function setOpen(open){
      mn.classList.toggle('open',open);
      burger.classList.toggle('open',open);
      burger.setAttribute('aria-expanded',open?'true':'false');
      burger.setAttribute('aria-label',open?'Close menu':'Open menu');
      document.body.style.overflow=open?'hidden':'';
    }
    burger.addEventListener('click',()=>setOpen(!mn.classList.contains('open')));
    mn.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&mn.classList.contains('open'))setOpen(false);
    });
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

  // ─── RFQ FORM → WhatsApp + Email (no backend required) ───
  (function(){
    const form=document.querySelector('.rfq-form');
    if(!form)return;
    const WA='256775858924', MAIL='info@fodmaninternational.com';
    const val=n=>{const el=form.querySelector('[name="'+n+'"]');return el?el.value.trim():'';};
    function regions(){return Array.from(form.querySelectorAll('[name="region"]:checked')).map(c=>c.value).join(', ');}
    function service(){const s=form.querySelector('[name="service"]:checked');return s?s.value:'';}
    function compose(){
      const L=[];
      L.push('*NEW RFQ — Fodman International*');
      L.push('');
      L.push('Service: '+(service()||'—'));
      L.push('Organization: '+(val('org')||'—'));
      if(val('industry'))L.push('Industry: '+val('industry'));
      L.push('Contact: '+(val('person')||'—'));
      L.push('Email: '+(val('email')||'—'));
      if(val('phone'))L.push('Phone: '+val('phone'));
      if(regions())L.push('Region(s): '+regions());
      if(form.dataset.attachmentName)L.push('Referenced file: '+form.dataset.attachmentName+' (attach separately)');
      L.push('');
      L.push('Scope / details:');
      L.push(val('scope')||'—');
      return L.join('\n');
    }
    function validate(){
      let ok=true;
      form.querySelectorAll('[required]').forEach(el=>{
        if(!el.value.trim()){ok=false;el.style.borderColor='#c0392b';}
        else el.style.borderColor='';
      });
      return form.reportValidity() && ok;
    }
    function success(channel){
      let m=form.querySelector('.form-success');
      if(!m){m=document.createElement('p');m.className='form-success';m.style.cssText='color:#0F7A52;font-size:.9rem;margin-top:6px;font-weight:600;text-align:center';form.querySelector('.form-actions').after(m);}
      m.textContent='Opening '+channel+'… If nothing opens, use the direct contact details on the right.';
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!validate())return;
      const text=encodeURIComponent(compose());
      window.open('https://wa.me/'+WA+'?text='+text,'_blank','noopener');
      success('WhatsApp');
    });
    const mailBtn=form.querySelector('.js-email-rfq');
    if(mailBtn)mailBtn.addEventListener('click',e=>{
      e.preventDefault();
      if(!validate())return;
      const subject=encodeURIComponent('RFQ — '+(val('org')||'New enquiry')+' ('+(service()||'Fodman')+')');
      const body=encodeURIComponent(compose().replace(/\*/g,''));
      window.location.href='mailto:'+MAIL+'?subject='+subject+'&body='+body;
      success('your email app');
    });
  })();

  // ─── MOBILE NAV: expandable services already inline; nothing extra ───

  // ─── UPLOAD ZONE ───
  (function(){
    const zone=document.querySelector('.upload-zone');
    if(!zone)return;
    const input=document.createElement('input');
    input.type='file'; input.accept='.pdf,.docx'; input.style.display='none';
    zone.appendChild(input);
    const label=zone.querySelector('span');
    zone.setAttribute('role','button');
    zone.tabIndex=0;
    zone.addEventListener('click',e=>{if(e.target!==input)input.click();});
    zone.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}
    });
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.style.borderColor='var(--purple)';});
    zone.addEventListener('dragleave',()=>{zone.style.borderColor='';});
    function remember(file){
      if(!file)return;
      if(label)label.textContent='\u2713 '+file.name;
      const form=zone.closest('form');
      if(form)form.dataset.attachmentName=file.name;
    }
    zone.addEventListener('drop',e=>{e.preventDefault();zone.style.borderColor='';remember(e.dataTransfer.files[0]);});
    input.addEventListener('change',()=>remember(input.files[0]));
  })();

  // ─── SERVICE / PRODUCT CARD SPOTLIGHT ───
  // Same cursor-tracked highlight as .ldg-card on the homepage (home.js),
  // extended here so inner service pages get the same interaction caliber.
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    document.querySelectorAll('.svc-card,.prod-card').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        card.style.setProperty('--mx',((e.clientX-r.left)/r.width)*100+'%');
        card.style.setProperty('--my',((e.clientY-r.top)/r.height)*100+'%');
      });
    });
  }

  // ─── EDITORIAL PAGE VISUALS ───
  // Each core page receives its own art-directed hero and, where useful, a
  // second visual chapter. Content stays in the HTML; this layer keeps image
  // loading, responsive treatment and accessibility consistent site-wide.
  (function(){
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    const visualBase='assets/fodman-visuals/';
    const pages={
      'services.html':{
        hero:'20-partnership.webp',
        alt:'Fodman professionals reviewing a client partnership brief'
      },
      'lending.html':{
        hero:'03-finance-consultation.webp',
        alt:'Fodman professionals discussing a financial services request',
        secondary:'04-finance-business.webp',
        label:'Financial guidance',title:'A clear conversation before every commitment.',
        text:'We explain the process, confirm what is required and help you understand the next step before you proceed.',
        href:'apply.html',action:'Start an enquiry'
      },
      'supply-chain.html':{
        hero:'05-logistics-coordination.webp',
        alt:'Fodman logistics coordinator at a regional depot',
        secondary:'06-logistics-delivery.webp',
        label:'Operational control',title:'Visibility from requirement to delivery.',
        text:'Sourcing, movement and handover are coordinated around an agreed brief, clear documentation and assignment-specific timelines.',
        href:'contact.html',action:'Request a proposal'
      },
      'consultancy.html':{
        hero:'07-consultancy-strategy.webp',
        alt:'Fodman consultants in a strategy session',
        secondary:'08-consultancy-workshop.webp',
        label:'Working sessions',title:'Advice designed to be used, not shelved.',
        text:'We translate organisational questions into practical plans, facilitated sessions and tools your team can carry forward.',
        href:'contact.html',action:'Discuss an assignment'
      },
      'advisory.html':{
        hero:'09-research-field.webp',
        alt:'Fodman research team gathering field insights',
        secondary:'10-research-analysis.webp',
        label:'Evidence to action',title:'From field insight to usable decisions.',
        text:'Methods are shaped around the question, context and intended audience—then communicated clearly for decision-makers.',
        href:'contact.html',action:'Plan your study'
      },
      'real-estate.html':{
        hero:'11-property-viewing.webp',
        alt:'Fodman property advisers leading a viewing',
        secondary:'12-property-commercial.webp',
        label:'Property advisory',title:'A clearer brief makes a better search.',
        text:'Tell us the location, purpose, budget and timing. We use that brief to focus the search and coordinate the next step.',
        href:'contact.html',action:'Share your property brief'
      },
      'tours-travel.html':{
        hero:'13-travel-safari.webp',
        alt:'Fodman travel specialist coordinating a regional journey',
        secondary:'14-travel-airport.webp',
        label:'Travel coordination',title:'The details are handled before you depart.',
        text:'We coordinate travel around the traveller, schedule and purpose—from ticketing and transfers to group movement and tours.',
        href:'contact.html',action:'Plan a journey'
      },
      'about.html':{
        hero:'15-about-team.webp',
        alt:'Fodman professionals walking together in a modern courtyard'
      },
      'contact.html':{
        hero:'19-contact-concierge.webp',
        alt:'Fodman client service professional ready to help'
      }
    };
    const data=pages[page];
    if(!data)return;

    const hero=document.querySelector('.page-hero');
    if(hero&&data.hero){
      hero.classList.add('page-hero--media');
      const frame=document.createElement('figure');
      frame.className='page-hero-media';
      const img=document.createElement('img');
      img.src=visualBase+data.hero;
      img.alt=data.alt||'';
      img.decoding='async';
      img.fetchPriority='high';
      frame.appendChild(img);
      hero.appendChild(frame);
    }

    if(data.secondary){
      const anchor=document.querySelector('.page-hero + section');
      if(anchor){
        const chapter=document.createElement('section');
        chapter.className='visual-chapter';
        const wrap=document.createElement('div');
        wrap.className='container visual-chapter-grid';
        const frame=document.createElement('figure');
        frame.className='visual-chapter-media';
        const img=document.createElement('img');
        img.src=visualBase+data.secondary;
        img.alt=data.title;
        img.loading='lazy';
        img.decoding='async';
        frame.appendChild(img);
        const copy=document.createElement('div');
        copy.className='visual-chapter-copy';
        const eye=document.createElement('div'); eye.className='eyebrow eyebrow--dark'; eye.textContent=data.label;
        const h=document.createElement('h2'); h.textContent=data.title;
        const p=document.createElement('p'); p.textContent=data.text;
        const a=document.createElement('a'); a.href=data.href; a.className='btn btn--ghost'; a.innerHTML=data.action+' <span aria-hidden="true">→</span>';
        copy.append(eye,h,p,a);
        wrap.append(frame,copy); chapter.appendChild(wrap);
        anchor.insertAdjacentElement('afterend',chapter);
      }
    }
  })();

  // ─── READING PROGRESS ───
  (function(){
    const bar=document.createElement('div');
    bar.className='site-progress';
    bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    let ticking=false;
    function update(){
      const max=document.documentElement.scrollHeight-innerHeight;
      bar.style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';
      ticking=false;
    }
    addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
    update();
  })();

  // ─── MOBILE ENQUIRY DOCK ───
  (function(){
    if(document.querySelector('.mobile-action-dock'))return;
    const dock=document.createElement('nav');
    dock.className='mobile-action-dock';
    dock.setAttribute('aria-label','Quick contact');
    const wa=document.createElement('a');
    wa.href='https://wa.me/256775858924'; wa.target='_blank'; wa.rel='noopener';
    wa.className='mobile-action-dock__wa'; wa.textContent='WhatsApp';
    const rfq=document.createElement('a');
    rfq.href='contact.html'; rfq.className='mobile-action-dock__rfq'; rfq.textContent='Request a quote';
    dock.append(wa,rfq); document.body.appendChild(dock);
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
