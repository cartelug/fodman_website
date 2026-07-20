/* Fodman International — home.js V2 */
(function() {
  'use strict';

  // ─── JS CLASS ───
  document.documentElement.classList.add('js');

  // ─── HERO CONTENT LOAD ANIMATION ───
  function triggerHeroLoad() {
    const c = document.getElementById('heroContent');
    if (c) c.classList.add('loaded');
  }
  const pl = document.getElementById('preloader');
  if (pl) {
    const mo = new MutationObserver(() => {
      if (pl.classList.contains('done')) {
        setTimeout(triggerHeroLoad, 100);
        mo.disconnect();
      }
    });
    mo.observe(pl, { attributes: true, attributeFilter: ['class'] });
    setTimeout(triggerHeroLoad, 3800);
  } else {
    triggerHeroLoad();
  }

  // ─── PARALLAX: HERO RIGHT PHOTO ───
  // The wrapper slides at 0.18x page scroll; the <img> inside owns its
  // own CSS Ken Burns zoom — two elements, one transform each, so the
  // scroll-driven translateY never fights the animation's scale().
  const heroImgWrap = document.getElementById('heroImgWrap');
  const heroEl  = document.getElementById('hero');

  // ─── PARALLAX: REGION PHOTO ───
  const regionImg = document.getElementById('regionImg');

  let rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Hero parallax (only while hero is on screen)
      if (heroImgWrap && heroEl) {
        const heroH = heroEl.offsetHeight;
        if (scrollY < heroH) {
          heroImgWrap.style.transform = `translateY(${scrollY * 0.18}px)`;
        }
      }

      // Region photo parallax
      if (regionImg) {
        const rect = regionImg.closest('.region-photo-wrap')?.getBoundingClientRect();
        if (rect) {
          const vh = window.innerHeight;
          if (rect.bottom > 0 && rect.top < vh) {
            const progress = 1 - (rect.bottom / (vh + rect.height));
            const shift = (progress * 16 - 8);
            regionImg.style.transform = `translateY(${shift}%)`;
          }
        }
      }

      rafPending = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── TICKER DUPLICATE ───
  const track = document.getElementById('tickerTrack');
  if (track) {
    Array.from(track.children).forEach(el => track.appendChild(el.cloneNode(true)));
  }

  // ─── SCROLL REVEAL ───
  const reveals = document.querySelectorAll('.reveal, .reveal-right');
  if (reveals.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObs.observe(el));
  }

  // ─── SVG SYMBOL DRAW-ON ───
  // When sym-wrap enters viewport, animate .sym-draw strokes
  const symWraps = document.querySelectorAll('.sym-wrap');
  if (symWraps.length) {
    const symObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const draws = e.target.querySelectorAll('.sym-draw');
          draws.forEach((el, i) => {
            setTimeout(() => el.classList.add('drawn'), i * 80);
          });
          symObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    symWraps.forEach(el => symObs.observe(el));
  }

  // ─── COUNTER ANIMATION ───
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.done) {
          e.target.dataset.done = '1';
          const target = parseFloat(e.target.dataset.target);
          const suffix = e.target.dataset.suffix || '';
          const dur = 1500, start = performance.now();
          function step(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            e.target.textContent = Math.round(target * ease) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          cObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cObs.observe(c));
  }

  // ─── SECTOR CARD SIBLINGS DIM ───
  const sectorCards = document.querySelectorAll('.sector-card');
  sectorCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      sectorCards.forEach(c => { if (c !== card) c.style.opacity = '.7'; });
    });
    card.addEventListener('mouseleave', () => {
      sectorCards.forEach(c => c.style.opacity = '');
    });
  });

  // ─── DIVISION CARD TILT ───
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.div-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 3.5}deg) rotateY(${x * 3.5}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ─── LEDGER CARD SPOTLIGHT ───
    // Cursor-tracked highlight — position set as CSS custom properties,
    // visibility/animation handled entirely in CSS (:hover opacity).
    document.querySelectorAll('.ldg-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    });

    // ─── HERO CTA SPOTLIGHT (same technique, primary button only) ───
    const heroCta = document.querySelector('.hero-actions .btn--accent');
    if (heroCta) {
      heroCta.addEventListener('mousemove', e => {
        const r = heroCta.getBoundingClientRect();
        heroCta.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        heroCta.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    }
  }

})();
