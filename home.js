/* Fodman International — home.js V3 (performance pass) */
(function() {
  'use strict';

  // ─── JS CLASS ───
  // Also set by the inline <head> script so the hero's entrance start-state
  // applies before first paint; kept here as a harmless fallback.
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── HERO CONTENT LOAD ANIMATION ───
  // The hero's entrance starts the instant the preloader (capped at
  // ~700–1000ms in main.js) signals .done, so the two feel like one
  // continuous reveal rather than two separate waits. If the preloader
  // element is ever removed from index.html, this falls back to firing
  // on the next frame instead.
  let heroLoaded = false;
  function triggerHeroLoad() {
    const c = document.getElementById('heroContent');
    if (!c || heroLoaded) return;
    heroLoaded = true;
    c.classList.add('loaded');
    // Last headline line finishes at .33s delay + .85s — then un-clip.
    setTimeout(() => c.classList.add('settled'), reduceMotion ? 0 : 1250);
  }
  const pl = document.getElementById('preloader');
  if (pl) {
    const mo = new MutationObserver(() => {
      if (pl.classList.contains('done')) { triggerHeroLoad(); mo.disconnect(); }
    });
    mo.observe(pl, { attributes: true, attributeFilter: ['class'] });
    // Safety net only — main.js's own hard ceiling is 1000ms, so this
    // should never be the thing that actually fires.
    setTimeout(triggerHeroLoad, 1150);
  } else {
    // Double rAF: guarantees the hidden start-state has been painted once,
    // so the transition actually runs instead of snapping to the end.
    requestAnimationFrame(() => requestAnimationFrame(triggerHeroLoad));
  }

  const heroEl      = document.getElementById('hero');
  const heroImgWrap = document.getElementById('heroImgWrap');
  const regionImg   = document.getElementById('regionImg');
  const regionWrap  = regionImg ? regionImg.closest('.region-photo-wrap') : null;

  // ─── PAUSE HERO LOOPS WHEN OFF-SCREEN / TAB HIDDEN ───
  // Aurora drift, Ken Burns, pulse dots and CTA glow all stop once the hero
  // leaves the viewport, so the rest of the page scrolls on an idle GPU.
  let heroOnScreen = true;
  function syncHeroPause() {
    if (heroEl) heroEl.classList.toggle('hero--paused', !heroOnScreen || document.hidden);
  }
  document.addEventListener('visibilitychange', syncHeroPause);

  // ─── PARALLAX (hero photo + region photo) ───
  // Layout is measured once (and on resize), never inside the scroll
  // handler, and each effect only runs while its element is on screen.
  let heroH = 0, regionTop = 0, regionH = 0, vh = window.innerHeight;
  let regionOnScreen = false, desktop = window.innerWidth > 768;

  function measure() {
    vh = window.innerHeight;
    desktop = window.innerWidth > 768;
    if (heroEl) heroH = heroEl.offsetHeight;
    if (regionWrap) {
      const r = regionWrap.getBoundingClientRect();
      regionTop = r.top + window.scrollY;
      regionH = r.height;
    }
  }

  let rafPending = false;
  function render() {
    rafPending = false;
    const scrollY = window.scrollY;

    if (heroImgWrap) {
      if (desktop && heroOnScreen && !reduceMotion) {
        heroImgWrap.style.transform = 'translate3d(0,' + (Math.min(scrollY, heroH) * 0.18).toFixed(1) + 'px,0)';
      } else if (!desktop) {
        heroImgWrap.style.transform = '';
      }
    }

    if (regionImg && regionOnScreen && !reduceMotion) {
      const bottom = regionTop + regionH - scrollY;
      const progress = 1 - (bottom / (vh + regionH));
      const shift = Math.max(-8, Math.min(8, progress * 16 - 8));
      regionImg.style.transform = 'translate3d(0,' + shift.toFixed(2) + '%,0)';
    }
  }
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(render);
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); });
  // Sections above the region use content-visibility:auto, so its real
  // offset settles as they render — re-measure whenever the page resizes.
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); }).observe(document.body);

  if ('IntersectionObserver' in window) {
    if (heroEl) {
      new IntersectionObserver(entries => {
        heroOnScreen = entries[0].isIntersecting;
        syncHeroPause();
        if (heroOnScreen) onScroll();
      }).observe(heroEl);
    }
    if (regionWrap) {
      new IntersectionObserver(entries => {
        regionOnScreen = entries[0].isIntersecting;
        if (regionOnScreen) { measure(); onScroll(); }
      }, { rootMargin: '120px 0px' }).observe(regionWrap);
    }
  } else {
    regionOnScreen = true;
  }
  onScroll();

  // Ticker duplication, scroll reveal, SVG draw-on and counters are handled
  // once in main.js (loads first on every page). Sector sibling-dimming is
  // pure CSS (.sectors-grid:has(...) in home.css) — the old JS duplicate
  // that wrote inline opacity on every mouseenter has been removed.

  // ─── CURSOR SPOTLIGHTS (ledger cards + hero CTA) ───
  // Mouse events are coalesced to one read + one write per frame (the old
  // handlers did a getBoundingClientRect on every raw mousemove event).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const targets = document.querySelectorAll('.ldg-card, .hero-actions .btn--accent');
    targets.forEach(el => {
      let x = 0, y = 0, queued = false;
      function paint() {
        queued = false;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((x - r.left) / r.width) * 100 + '%');
        el.style.setProperty('--my', ((y - r.top) / r.height) * 100 + '%');
      }
      el.addEventListener('pointermove', e => {
        x = e.clientX; y = e.clientY;
        if (!queued) { queued = true; requestAnimationFrame(paint); }
      });
    });
  }

})();
