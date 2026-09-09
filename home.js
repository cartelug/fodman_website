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
      if (heroImgWrap && heroEl && window.innerWidth > 768) {
        const heroH = heroEl.offsetHeight;
        if (scrollY < heroH) {
          heroImgWrap.style.transform = `translateY(${scrollY * 0.18}px)`;
        }
      } else if (heroImgWrap) {
        heroImgWrap.style.transform = '';
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

  // Ticker duplication is handled once, in main.js (which loads first on
  // every page including this one) — doing it here too used to double the
  // ticker content to 4x the intended DOM nodes. Removed.

  // Scroll reveal, SVG symbol draw-on, and counter animation are all
  // handled once, in main.js (which loads first on every page, including
  // this one) — duplicating them here used to run two independent
  // IntersectionObservers over the same elements, with a mismatched
  // threshold on .sym-wrap (.5 here vs .4 in main.js). Removed.

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

  // (The old "division card tilt" handler that lived here targeted
  // .div-card, a class removed from the markup when the Ledger Grid
  // replaced it — the listener was firing on zero elements. Removed.)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
