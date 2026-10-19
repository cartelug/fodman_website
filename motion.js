/* Fodman International motion layer: preloader, page curtain, scroll reveals, counters, parallax, map pulse and office clocks.
   The lending pages set <html data-motion="loader"> and get only the preloader and the page curtain.
   Progressive enhancement. Nothing here is needed to read or use the site, and html.m-on (set by the boot script in each page's head)
   is only present when the visitor has not asked for reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var ON = root.classList.contains('m-on'), LOADER = root.getAttribute('data-motion') === 'loader';
  var FINE = !!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  var NS = 'http://www.w3.org/2000/svg';
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function on(el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('motion:', e); } }
  function store(k, v) { try { if (v === undefined) return window.sessionStorage.getItem(k); window.sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } return null; }

  /* ---------- live office clocks ---------- */
  function clocks() {
    var els = $$('[data-clock]');
    if (!els.length || !window.Intl) return;
    function tick() {
      els.forEach(function (el) {
        try { el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: el.getAttribute('data-clock') }).format(new Date()); el.parentNode.hidden = false; } catch (e) { /* label stays hidden */ }
      });
    }
    tick(); setInterval(tick, 15000);
  }
  if (!ON) { safe(clocks); return; }

  /* ---------- text helpers ---------- */
  function split(el) {
    if (el.children.length || !el.textContent.trim()) return false;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var o = d.createElement('span'), s = d.createElement('span');
      o.className = 'm-w'; s.style.setProperty('--wi', i); s.textContent = w; o.appendChild(s);
      el.appendChild(o);
      if (i < words.length - 1) el.appendChild(d.createTextNode(' '));
    });
    el.classList.add('m-split');
    return true;
  }
  function countUp(el) {
    var node = null, n;
    for (n = el.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && /\d/.test(n.nodeValue)) { node = n; break; } }
    if (!node) return;
    var txt = node.nodeValue, m = /^(\D*)(\d+)(.*)$/.exec(txt);
    if (!m) return;
    var end = +m[2], start = end > 1900 ? end - 70 : 0, dur = end > 1900 ? 1900 : 1500, t0 = null;
    function f(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      node.nodeValue = m[1] + Math.round(start + (end - start) * e) + m[3];
      if (k < 1) requestAnimationFrame(f); else node.nodeValue = txt;
    }
    node.nodeValue = m[1] + start + m[3];
    requestAnimationFrame(f);
  }

  /* ---------- hero ---------- */
  function heroInit() {
    var h = $('.hero__txt > h1');
    if (h && !split(h)) h.classList.add('m-nosplit');
  }
  function dust() {
    $$('.hero').forEach(function (h) {
      var box = d.createElement('div'), n = window.innerWidth < 700 ? 9 : 18, i, p;
      box.className = 'm-dust'; box.setAttribute('aria-hidden', 'true');
      for (i = 0; i < n; i++) {
        p = d.createElement('i');
        p.style.cssText = '--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--t:' + (11 + Math.random() * 14).toFixed(1) + 's;--d:-' + (Math.random() * 22).toFixed(1) + 's;--dx:' + Math.round((Math.random() - .5) * 140) + 'px';
        box.appendChild(p);
      }
      h.insertBefore(box, h.firstChild);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { box.classList.toggle('is-off', !es[0].isIntersecting); }).observe(h);
      }
    });
  }

  /* ---------- scroll reveals ---------- */
  var RULES = [
    { cls: 'rv--line', sel: '.eyebrow' },
    { cls: 'rv--clip', sel: '.feat__img,.portrait' },
    { cls: 'rv--zoom', sel: '.photos figure,.map,.stack' },
    { cls: '', sel: '.lede,.sec-head p,.note,.why-list>div,.aud>div,.card,.person,.steps li,.defs>div,.tl li,.mission li,.four>div,.cost>div,.dirs>div,.tier,.office,.faq details,.form-card,.contact-lines li,.quote,.vision,.slogan,.prod,.svc,.stat,.big24,.quals li,.ticks li,.pv,.chips li,.share-inline>*,.cta .btn-row,.cta p,.cta-contact>*,.sec .btn-row,.chain-wrap>div:first-child,.why>div:first-child,.promo>div:first-child,.lead>div:last-child,.feat>div:not(.feat__img),.ftr-g>*' }
  ];
  var SKIP = '.hero,.pl,.mnav,.modal,.mq,.hdr,.topbar';
  var queue = [], CLEAN = /^(rv|in$)/, railScrolls = window.innerWidth < 1100;
  function tagReveals() {
    var sel = RULES.map(function (r) { return r.sel; }).join(',');
    $$(sel).forEach(function (el) {
      if (el.closest(SKIP) || (el.parentElement && el.parentElement.closest('.rv'))) return;
      if (railScrolls && el.closest('.svc-grid--rail')) return;   // cards in a swipe rail stay visible
      var r = RULES.filter(function (x) { return el.matches(x.sel); })[0];
      el.classList.add('rv'); if (r.cls) el.classList.add(r.cls);
      queue.push(el);
    });
    $$('.sec h2,.cta h2').forEach(function (h) { if (!h.closest(SKIP) && split(h)) queue.push(h); });
    var ch = $('.chain'); if (ch) { ch.classList.add('m-chain'); queue.push(ch); }
  }
  function settle(el) {
    function end(e) {
      if (e.target !== el && e.target.parentNode !== el) return;
      el.removeEventListener('animationend', end);
      Array.prototype.slice.call(el.classList).forEach(function (c) { if (CLEAN.test(c)) el.classList.remove(c); });
      el.style.removeProperty('--d');
    }
    on(el, 'animationend', end);
  }
  function startReveals() {
    function show(el) { el.classList.add('in'); }
    if (!('IntersectionObserver' in window)) { queue.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) {
        var ra = a.boundingClientRect, rb = b.boundingClientRect; return (ra.top - rb.top) || (ra.left - rb.left);
      }).forEach(function (e, i) {
        var el = e.target;
        el.style.setProperty('--d', Math.min(i, 6) * 85 + 'ms');
        el.classList.add('in'); io.unobserve(el);
        if (el.classList.contains('rv')) settle(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    queue.forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); countUp(e.target); } });
    }, { threshold: 0.6 });
    $$('.stat b,.big24').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- scroll progress and hero parallax ---------- */
  function scrollFx() {
    var bar = d.createElement('div'), art = $('.hero__art'), hero = $('.hero'), tick = false;
    bar.className = 'sp'; bar.setAttribute('aria-hidden', 'true'); bar.appendChild(d.createElement('i')); d.body.appendChild(bar);
    function update() {
      tick = false;
      var y = window.pageYOffset || 0, max = Math.max(1, root.scrollHeight - window.innerHeight);
      bar.style.setProperty('--sp', Math.min(1, y / max).toFixed(4));
      if (art && hero && y < hero.offsetHeight + 60) art.style.translate = '0 ' + Math.round(y * 0.14) + 'px';
    }
    function req() { if (!tick) { tick = true; requestAnimationFrame(update); } }
    on(window, 'scroll', req, { passive: true }); on(window, 'resize', req); update();
  }

  /* ---------- pointer effects (mouse only) ---------- */
  function pointerFx() {
    if (!FINE) return;
    $$('.hero .btn,.cta .btn,.sec .btn-primary,.sec .btn-gold').forEach(function (b) {
      on(b, 'pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
      });
      on(b, 'pointerleave', function () { b.style.translate = ''; });
    });
    $$('.svc,.card,.prod:not(.prod--tm),.dirs>div,.cost>div,.office').forEach(function (el) { el.classList.add('sp-c'); });
    on(d, 'pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.sp-c');
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- map: pulsing offices and a route that flows from Juba to Kampala ---------- */
  function mapFx() {
    $$('.map svg').forEach(function (svg) {
      if (!svg.querySelector('use[href="#map-ea"]')) return;
      var g = d.createElementNS(NS, 'g');
      g.setAttribute('class', 'map-fx'); g.setAttribute('aria-hidden', 'true');
      g.innerHTML = '<path class="mr" pathLength="100" d="M471,338 Q389,444 518,550"/><circle class="mp" cx="518" cy="550" r="10"/><circle class="mp mp--2" cx="518" cy="550" r="10"/><circle class="mp mp--3" cx="471" cy="338" r="10"/><circle class="mp mp--4" cx="471" cy="338" r="10"/>';
      svg.appendChild(g);
    });
  }

  /* ---------- intro, page curtain ---------- */
  var pl = $('#pl'), readied = false, failT = null, leaving = false;
  function inert(state) {
    Array.prototype.forEach.call(d.body.children, function (el) {
      if (el === pl || /^(SCRIPT|STYLE|NOSCRIPT|LINK)$/.test(el.tagName)) return;
      if (state) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function ready() {
    if (readied) return;
    readied = true; clearTimeout(window.__mf); clearTimeout(failT);
    void d.body.offsetHeight;
    root.classList.add('m-ready');
    $$('.hero .m-split').forEach(function (h) { h.classList.add('in'); });
    safe(startReveals);
  }
  function cleanup() {
    if (!pl) return;
    pl.className = 'pl'; pl.style.removeProperty('--p'); inert(false);
  }
  function runIntro(full) {
    var t0 = performance.now(), MIN = full ? 2400 : 450, MAX = full ? 6500 : 1600, finished = false, p = 0;
    pl.classList.add('pl--on', full ? 'pl--full' : 'pl--quick');
    root.classList.remove('pl-full', 'pl-quick');
    inert(true);
    if (full) store('fodman-intro', '1');
    function finish(skip) {
      if (finished) return;
      finished = true; p = 100;
      if (full) render();
      pl.classList.add('pl--fin');
      setTimeout(function () {
        pl.classList.add('pl--out');
        setTimeout(function () {
          pl.classList.add('pl--open'); ready();
          setTimeout(cleanup, full ? 1250 : 900);
        }, full ? (skip ? 100 : 320) : 0);
      }, full ? (skip ? 100 : 620) : 0);
    }
    setTimeout(function () { finish(true); }, MAX + 2000);
    var fontsReady = (d.fonts && d.fonts.ready) || Promise.resolve();
    if (!full) {
      fontsReady.then(function () { setTimeout(finish, Math.max(0, MIN - (performance.now() - t0))); }, finish);
      return;
    }
    var N = 72, ticks = [], numEl = $('#pl-n'), words = $$('.pl__tag li', pl), g = $('.pl__ticks', pl), i, lastN = -1;
    for (i = 0; i < N; i++) {
      var a = i / N * Math.PI * 2, r1 = i % 6 === 0 ? 77 : 81, l = d.createElementNS(NS, 'line');
      l.setAttribute('x1', (100 + Math.cos(a) * r1).toFixed(2)); l.setAttribute('y1', (100 + Math.sin(a) * r1).toFixed(2));
      l.setAttribute('x2', (100 + Math.cos(a) * 87).toFixed(2)); l.setAttribute('y2', (100 + Math.sin(a) * 87).toFixed(2));
      if (g) g.appendChild(l); ticks.push(l);
    }
    var total = 0, ok = 0;
    function track(pr) { var once = false; total++; function f() { if (!once) { once = true; ok++; } } pr.then(f, f); }
    function imgDone(src) { return new Promise(function (res) { var im = new Image(); im.onload = im.onerror = res; im.src = src; }); }
    if (d.fonts && d.fonts.load) track(Promise.all([d.fonts.load('600 1em Fraunces'), d.fonts.load('600 1em Montserrat')]));
    track(new Promise(function (res) { if (d.readyState === 'complete') res(); else on(window, 'load', res); }));
    var art = $('.hero__art'), bg = art && /url\(["']?([^"')]+)/.exec(window.getComputedStyle(art).backgroundImage || '');
    if (bg) track(imgDone(bg[1]));
    var mk = $('.pl__mark', pl);
    if (mk) { mk.loading = 'eager'; track(mk.complete ? Promise.resolve() : new Promise(function (res) { mk.onload = mk.onerror = res; })); }
    function render() {
      pl.style.setProperty('--p', p.toFixed(2));
      if (numEl) numEl.textContent = Math.round(p);
      var n = Math.floor(p / 100 * N + 0.001);
      if (n !== lastN) { for (i = 0; i < N; i++) ticks[i].classList.toggle('on', i < n); lastN = n; }
      words.forEach(function (w, k) { w.classList.toggle('on', p >= [2, 36, 70][k]); });
    }
    function frame(now) {
      if (finished) return;
      var el = now - t0, k = Math.min(1, el / MIN), cap = 100 * (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      var real = (!total || el > MAX) ? 100 : ok / total * 100, tgt = Math.min(cap, real);
      p += (tgt - p) * 0.16;
      if (tgt - p < 0.08) p = tgt;
      render();
      if (p >= 99.95) finish(false); else requestAnimationFrame(frame);
    }
    on($('.pl__skip', pl), 'click', function () { finish(true); });
    on(d, 'keydown', function (e) { if (e.key === 'Escape' && !finished) finish(true); });
    requestAnimationFrame(frame);
  }
  function unleave() {
    if (!leaving) return;
    leaving = false;
    pl.classList.add('pl--open');
    setTimeout(cleanup, 1000);
  }
  function curtain() {
    if (!pl) return;
    on(d, 'click', function (e) {
      if (leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var t = a.getAttribute('target'), u;
      if ((t && t !== '_self') || a.hasAttribute('download')) return;
      try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.protocol !== location.protocol || u.host !== location.host) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      if (!/\.html?$|\/$/.test(u.pathname) || /\/staff\.html?$|\/desk\//.test(u.pathname)) return;   // the staff desk is an app, not a page of the site
      e.preventDefault(); leaving = true;
      store('fodman-go', '1');
      pl.className = 'pl pl--on pl--quick pl--open'; void pl.offsetWidth;
      requestAnimationFrame(function () { pl.classList.remove('pl--open'); });
      setTimeout(function () { location.href = u.href; }, 680);
      setTimeout(unleave, 6000);
    });
    on(window, 'pageshow', function (e) { if (e.persisted) { leaving = true; unleave(); } });
  }

  /* ---------- start ---------- */
  safe(clocks);
  clearTimeout(window.__mf);
  failT = setTimeout(function () { cleanup(); ready(); }, 9000);
  if (!LOADER) { safe(heroInit); safe(tagReveals); safe(dust); safe(mapFx); safe(scrollFx); safe(pointerFx); }
  safe(curtain);
  var mode = root.classList.contains('pl-full') ? 'full' : root.classList.contains('pl-quick') ? 'quick' : '';
  if (pl && mode) { try { runIntro(mode === 'full'); } catch (e) { cleanup(); ready(); } }
  else ready();
})();
