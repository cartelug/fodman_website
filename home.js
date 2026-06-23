/* Fodman International — home.js
   Homepage-specific interactions:
   - Hero photo parallax (subtle, performance-safe)
   - Region photo parallax
   - Hero content load animation (fires after preloader)
   - Cap rows custom reveal direction
*/

(function() {
  // ─── JS CLASS (for CSS gating) ───
  document.documentElement.classList.add('js');

  // ─── HERO CONTENT LOAD ───
  // Fires once preloader is gone
  function triggerHeroLoad() {
    const c = document.getElementById('heroContent');
    if (c) c.classList.add('loaded');
  }
  // If preloader is present, wait for it; else fire immediately
  const pl = document.getElementById('preloader');
  if (pl) {
    // Watch for preloader to get .done class
    const mo = new MutationObserver(() => {
      if (pl.classList.contains('done')) {
        setTimeout(triggerHeroLoad, 120);
        mo.disconnect();
      }
    });
    mo.observe(pl, { attributes: true, attributeFilter: ['class'] });
    // Fallback
    setTimeout(triggerHeroLoad, 3800);
  } else {
    triggerHeroLoad();
  }

  // ─── HERO PHOTO PARALLAX ───
  // On scroll: move the desktop hero photo upward at 0.25x scroll speed
  // Implemented via translateY — GPU-composited, no layout thrash
  const heroPhotoD = document.getElementById('heroPhotoD');
  let heroPhotoImg = heroPhotoD ? heroPhotoD.querySelector('img') : null;
  let ticking = false;

  function updateHeroParallax() {
    if (!heroPhotoImg) return;
    const scrollY = window.scrollY;
    const heroH = document.getElementById('hero')?.offsetHeight || window.innerHeight;
    if (scrollY > heroH) return; // stop calculating once hero is offscreen
    heroPhotoImg.style.transform = `translateY(${scrollY * 0.22}px)`;
    ticking = false;
  }

  // ─── REGION PHOTO PARALLAX ───
  const regionWrap = document.getElementById('regionPhotoWrap');
  const regionImg  = document.getElementById('regionImg');

  function updateRegionParallax() {
    if (!regionWrap || !regionImg) return;
    const rect = regionWrap.getBoundingClientRect();
    const vh = window.innerHeight;
    // Only compute when in viewport
    if (rect.bottom < 0 || rect.top > vh) return;
    // Progress: 0 when bottom enters, 1 when top leaves
    const progress = 1 - (rect.bottom / (vh + rect.height));
    // Shift range: -8% to +8% (image is 120% tall so there's room)
    const shift = progress * 16 - 8; // -8 to +8 percentage
    regionImg.style.transform = `translateY(${shift}%)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeroParallax();
        updateRegionParallax();
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateHeroParallax();
  updateRegionParallax();

  // ─── TICKER DUPLICATE ───
  const track = document.getElementById('tickerTrack');
  if (track) {
    Array.from(track.children).forEach(el => {
      track.appendChild(el.cloneNode(true));
    });
  }

  // ─── SECTOR CARD HOVER: lift siblings ───
  // When hovering a sector card, very subtly dim its siblings
  const sectorCards = document.querySelectorAll('.sector-card');
  sectorCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      sectorCards.forEach(c => {
        if (c !== card) c.style.opacity = '.72';
      });
    });
    card.addEventListener('mouseleave', () => {
      sectorCards.forEach(c => c.style.opacity = '');
    });
  });

  // ─── DIVISION CARD TILT (subtle, desktop only) ───
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.div-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
