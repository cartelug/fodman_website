/* Fodman International — Interaction layer */
document.documentElement.classList.add('js');

// ─── PRELOADER ───
(function() {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  // hide after animation completes or window load (whichever is later, capped)
  let hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    pl.classList.add('done');
    document.body.style.overflow = '';
    setTimeout(() => { pl.style.display = 'none'; }, 750);
  }
  document.body.style.overflow = 'hidden';
  // minimum show time so the arrow animation reads, then hide
  const minTime = 2200;
  const start = performance.now();
  window.addEventListener('load', () => {
    const elapsed = performance.now() - start;
    setTimeout(hide, Math.max(0, minTime - elapsed));
  });
  // hard fallback
  setTimeout(hide, 3500);
})();

// ─── NAV SCROLL ───
(function() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── MOBILE NAV ───
(function() {
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!burger || !mobileNav) return;
  burger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    burger.textContent = open ? '✕' : '☰';
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      burger.textContent = '☰';
      document.body.style.overflow = '';
    });
  });
})();

// ─── SCROLL REVEAL ───
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

// ─── COUNTERS ───
(function() {
  function animate(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const dur = 1500, start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = '1';
        animate(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => obs.observe(c));
})();

// ─── TICKER DUPLICATE (seamless -50% loop) ───
(function() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  // Duplicate the set of items exactly once so translateX(-50%) loops seamlessly
  Array.from(track.children).forEach(it => track.appendChild(it.cloneNode(true)));
})();

// ─── RFQ FORM (demo) ───
(function() {
  const form = document.querySelector('.rfq-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.innerHTML = 'Submitting…';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '✓ RFQ Submitted';
      btn.style.background = '#0F7A52';
      if (!form.querySelector('.form-success')) {
        const msg = document.createElement('p');
        msg.className = 'form-success';
        msg.textContent = 'Thank you. Our corporate accounts team will respond within one business day.';
        msg.style.cssText = 'color:#0F7A52;font-size:.88rem;margin-top:14px;font-weight:500;text-align:center';
        btn.after(msg);
      }
    }, 1200);
  });
})();

// ─── UPLOAD ZONE ───
(function() {
  const zone = document.querySelector('.upload-zone');
  if (!zone) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.pdf,.docx'; input.style.display = 'none';
  zone.appendChild(input);
  const label = zone.querySelector('span');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--purple)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor = '';
    if (e.dataTransfer.files[0] && label) label.textContent = '✓ ' + e.dataTransfer.files[0].name;
  });
  input.addEventListener('change', () => {
    if (input.files[0] && label) label.textContent = '✓ ' + input.files[0].name;
  });
})();

// ─── SMOOTH ANCHOR (for in-page links) ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});
