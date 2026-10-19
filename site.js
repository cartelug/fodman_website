/* Fodman International website scripts. No dependencies except the QR generator that ships with the page. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var SPA = root.getAttribute('data-mode') === 'spa';
  var CFG = window.FODMAN_CONFIG || {};
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  /* Where the site starts, read from this script's own address, so pages work at any folder depth and under any base path. */
  var SITE = (function () { var s = $('script[src$="site.js"]'); try { return s ? new URL('.', s.src).href : ''; } catch (e) { return ''; } })();

  /* ---------- toast ---------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = d.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); d.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- copy ---------- */
  function fallbackCopy(text, field) {
    try {
      var t = field || d.createElement('textarea');
      if (!field) { t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; d.body.appendChild(t); }
      t.focus(); t.select(); t.setSelectionRange(0, 99999);
      var ok = d.execCommand && d.execCommand('copy');
      if (!field) d.body.removeChild(t);
      return !!ok;
    } catch (e) { return false; }
  }
  function copyText(text, field, okMsg) {
    function done(ok) { toast(ok ? (okMsg || 'Copied') : 'Press Ctrl+C or long-press to copy'); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text, field)); });
        return;
      }
    } catch (e) { /* fall through */ }
    done(fallbackCopy(text, field));
  }
  $$('[data-copy]').forEach(function (b) {
    on(b, 'click', function () { copyText(b.getAttribute('data-copy'), null, 'Copied: ' + b.getAttribute('data-copy')); });
  });

  /* ---------- menu, header, dropdown ---------- */
  var menuBtn = $('#menu-btn'), mnav = $('#mnav'), behind = $$('.skip,.topbar,main,.ftr');
  function setMenu(open) {
    if (open === root.classList.contains('menu-open')) return;
    root.classList.toggle('menu-open', open);
    behind.forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (!open && menuBtn && mnav && mnav.contains(d.activeElement)) menuBtn.focus();
  }
  on(menuBtn, 'click', function () { setMenu(!root.classList.contains('menu-open')); });
  $$('.mn-acc').forEach(function (b) { on(b, 'click', function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); }); });
  on(mnav, 'click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) setMenu(false); });
  function openCurrentGroup() { var cur = $('.mn-sub [aria-current]', mnav), acc = $('.mn-acc', mnav); if (cur && acc) acc.setAttribute('aria-expanded', 'true'); }
  var hdr = $('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-stuck', (window.pageYOffset || 0) > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $$('.dd > button').forEach(function (b) {
    on(b, 'click', function (e) { e.stopPropagation(); var dd = b.parentNode; var o = !dd.classList.contains('open'); dd.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  });
  on(d, 'click', function (e) {
    $$('.dd.open').forEach(function (dd) { if (!dd.contains(e.target)) { dd.classList.remove('open'); var b = $('button', dd); if (b) b.setAttribute('aria-expanded', 'false'); } });
  });
  on(d, 'keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) setMenu(false); });

  /* ---------- skip link ---------- */
  $$('[data-skip]').forEach(function (a) { on(a, 'click', function (e) { e.preventDefault(); var m = $('#main'); if (m) { m.focus(); try { m.scrollIntoView(); } catch (x) { /* ignore */ } } }); });

  /* ---------- router (single-page build) ---------- */
  var titles = {};
  function currentRoute() {
    var r = (location.hash || '').replace(/^#\/?/, '').replace(/[^a-z0-9-]/gi, '');
    if (!r || !d.getElementById('v-' + r)) r = 'home';
    return r;
  }
  function markNav(r) {
    $$('[data-nav]').forEach(function (a) {
      var k = a.getAttribute('data-nav');
      var cur = (k === r) || (k === 'services' && /^(logistics|consultancy|research|finance|property|travel)$/.test(r));
      if (cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  var firstRoute = true;
  function route() {
    var r = currentRoute();
    root.setAttribute('data-route', r);
    var v = d.getElementById('v-' + r);
    if (v && v.getAttribute('data-title')) d.title = v.getAttribute('data-title');
    markNav(r); openCurrentGroup(); setMenu(false);
    $$('.dd.open').forEach(function (dd) { dd.classList.remove('open'); });
    if (!firstRoute) {
      window.scrollTo(0, 0);
      var h = v && $('h1', v); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    }
    firstRoute = false;
    if (r === 'profile') pvInit();
  }
  if (SPA) { window.addEventListener('hashchange', route); route(); }
  else {
    var nav = root.getAttribute('data-nav'); if (nav) markNav(nav);
    openCurrentGroup();
    if ($('#pv')) pvInit();
  }
  $$('[data-scroll]').forEach(function (b) {
    on(b, 'click', function (e) {
      e.preventDefault();
      var id = b.getAttribute('data-scroll');
      var vis = SPA ? d.getElementById('v-' + currentRoute()) : d;
      var t = $('#' + id, vis) || d.getElementById(id);
      if (t) { try { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) { t.scrollIntoView(); } var f = $('input,select,textarea', t); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (x) { f.focus(); } }, 450); }
    });
  });

  /* ---------- share sheet ---------- */
  var SHARE_TEXT = 'Fodman International Ltd: supplies, logistics, consultancy, finance, real estate and travel in Uganda and South Sudan.';
  function pageUrl() {
    if (CFG.base) return CFG.base.split('#')[0] + (SPA ? (location.hash || '') : '');
    var ok = /^https?:$/.test(location.protocol);
    if (!ok) return CFG.canonical || 'https://www.fodmaninternational.com/';
    return location.href.split('#')[0].split('?')[0].replace(/index\.html$/, '');
  }
  function homeUrl() {
    if (CFG.base) return CFG.base.split('#')[0];
    var ok = /^https?:$/.test(location.protocol);
    if (!ok) return CFG.canonical || 'https://www.fodmaninternational.com/';
    if (SPA) return location.href.split('#')[0].split('?')[0];
    return SITE || location.origin + location.pathname.replace(/[^\/]*$/, '');
  }
  function assetUrl(name) {
    if (!/^https?:$/.test(location.protocol)) return (CFG.canonical || 'https://www.fodmaninternational.com/') + name;
    try { return new URL(name, SITE || location.href).href; } catch (e) { return homeUrl().replace(/[^\/]*$/, '') + name; }
  }
  function qrSvg(text) {
    try {
      var q = qrcode(0, 'M'); q.addData(text); q.make();
      var n = q.getModuleCount(), p = '';
      for (var r = 0; r < n; r++) { var run = -1; for (var c = 0; c <= n; c++) { var dark = c < n && q.isDark(r, c); if (dark && run < 0) run = c; if (!dark && run >= 0) { p += 'M' + run + ' ' + r + 'h' + (c - run) + 'v1h-' + (c - run) + 'z'; run = -1; } } }
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="QR code for the link"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + p + '" fill="#22074b"/></svg>';
    } catch (e) { return '<p class="small muted">The link is too long for a QR code.</p>'; }
  }
  function wire(scope, getUrl) {
    var f = $('[data-share-url]', scope), qr = $('[data-qr]', scope);
    function refresh() {
      var u = f.value.trim();
      if (qr) qr.innerHTML = qrSvg(u);
      var wa = $('[data-share-wa]', scope), em = $('[data-share-mail]', scope);
      if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + ' ' + u);
      if (em) em.href = 'mailto:?subject=' + encodeURIComponent('Fodman International Ltd') + '&body=' + encodeURIComponent(SHARE_TEXT + '\n\n' + u);
    }
    function set(mode) {
      f.value = getUrl(mode);
      $$('[data-share-mode]', scope).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-share-mode') === mode ? 'true' : 'false'); });
      refresh();
    }
    $$('[data-share-mode]', scope).forEach(function (b) { on(b, 'click', function () { set(b.getAttribute('data-share-mode')); }); });
    on(f, 'input', refresh);
    on(f, 'focus', function () { f.select(); });
    var cb = $('[data-share-copy]', scope);
    on(cb, 'click', function () { copyText(f.value, f, 'Link copied'); });
    return { set: set, refresh: refresh };
  }
  function shareMode() { return (SPA ? currentRoute() === 'home' : root.getAttribute('data-nav') === 'home') ? 'home' : 'page'; }
  function urlFor(mode) { return mode === 'home' ? homeUrl() : pageUrl(); }
  var modal = $('#share'), lastOpener = null, modalApi = null;
  if (modal) {
    modalApi = wire(modal, urlFor);
    var closeShare = function () { modal.classList.remove('open'); root.style.overflow = ''; if (lastOpener) { try { lastOpener.focus(); } catch (e) {} } };
    $$('[data-share-open]').forEach(function (b) {
      on(b, 'click', function () {
        lastOpener = b; setMenu(false);
        var here = shareMode();
        var seg = $('.seg', modal); if (seg) seg.hidden = here === 'home';
        modalApi.set(here);
        modal.classList.add('open'); root.style.overflow = 'hidden';
        var x = $('.modal-x', modal); if (x) x.focus();
      });
    });
    $$('[data-share-close]', modal).forEach(function (b) { on(b, 'click', closeShare); });
    on(modal, 'click', function (e) { if (e.target === modal) closeShare(); });
    on(d, 'keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeShare();
      if (e.key === 'Tab' && modal.classList.contains('open')) {
        var f = $$('button,a[href],input', modal).filter(function (x) { return !x.hidden && x.offsetParent !== null; });
        if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  $$('[data-share-inline]').forEach(function (sc) { var api = wire(sc, urlFor); api.set('home'); });
  $$('[data-copy-link]').forEach(function (b) {
    on(b, 'click', function () {
      var k = b.getAttribute('data-copy-link'), u;
      if (k === 'pdf') u = assetUrl('Fodman_International_Company_Profile_2026.pdf');
      else if (k === 'profile') u = SPA ? homeUrl() + '#profile' : homeUrl() + 'company-profile/';
      else u = homeUrl();
      copyText(u, null, 'Link copied');
    });
  });
  if (SPA) window.addEventListener('hashchange', function () { if (modal && modal.classList.contains('open')) { /* sheet is modal; nothing to do */ } });

  /* ---------- enquiry forms ---------- */
  var EMAIL = CFG.email || 'info@fodmaninternational.com';
  $$('form[data-enquiry]').forEach(function (form) {
    form.noValidate = true;
    var out = $('.enq-out', form.parentNode);
    function val(el) {
      if (el.type === 'checkbox') return el.checked ? el.value : '';
      return (el.value || '').trim();
    }
    on(form, 'submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('.field', form).forEach(function (f) {
        var inp = $('input[required],select[required],textarea[required]', f);
        var empty = inp && !val(inp);
        if (inp && inp.type === 'email') { /* contact may be phone or email: no format check */ }
        f.classList.toggle('has-err', !!empty);
        if (inp) inp.setAttribute('aria-invalid', empty ? 'true' : 'false');
        if (empty && !bad) bad = inp;
      });
      if (bad) { bad.focus(); return; }
      var lines = ['Hello Fodman International,', '', 'I would like to enquire about: ' + form.getAttribute('data-service') + '.', ''];
      $$('.field', form).forEach(function (f) {
        var lab = $('label,legend', f); if (!lab) return;
        var name = lab.textContent.replace(/\s*\(optional\)\s*/i, '').trim();
        var chk = $$('input[type=checkbox]:checked', f);
        var v;
        if ($('input[type=checkbox]', f)) v = chk.map(function (c) { return c.value; }).join(', ');
        else { var i = $('input,select,textarea', f); v = i ? val(i) : ''; }
        if (v && !/^(Your name|Phone or email)/i.test(name)) lines.push(name + ': ' + v);
      });
      var nm = $('[data-f=name]', form), ct = $('[data-f=contact]', form);
      lines.push('', 'Name: ' + (nm ? val(nm) : ''), 'Phone or email: ' + (ct ? val(ct) : ''), '', 'Written on the Fodman International website.');
      var msg = lines.join('\n');
      if (!out) return;
      var subject = 'Enquiry: ' + form.getAttribute('data-service');
      $('textarea', out).value = msg;
      var mail = $('[data-mail]', out);
      if (mail) mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
      var wa = $('[data-wa]', out);
      if (wa) { if (CFG.whatsapp) { wa.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg); wa.hidden = false; } else wa.hidden = true; }
      out.classList.add('show');
      var h = $('h4', out); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      try { out.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (x) { /* ignore */ }
      if (CFG.endpoint && window.fetch) {
        try {
          fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ service: form.getAttribute('data-service'), message: msg }) })
            .then(function (r) { if (r.ok) { var p = $('[data-sent]', out); if (p) p.hidden = false; } });
        } catch (x) { /* message panel stays as fallback */ }
      }
    });
    if (out) {
      on($('[data-copy-msg]', out), 'click', function () { var t = $('textarea', out); copyText(t.value, t, 'Message copied'); });
    }
    $$('input,select,textarea', form).forEach(function (i) { on(i, 'input', function () { var f = i.closest('.field'); if (f && f.classList.contains('has-err') && val(i)) { f.classList.remove('has-err'); i.setAttribute('aria-invalid', 'false'); } }); });
  });

  /* ---------- profile viewer ---------- */
  var pvDone = false;
  function pvInit() {
    var pv = $('#pv'); if (!pv || pvDone) return; pvDone = true;
    var titles = JSON.parse(pv.getAttribute('data-titles') || '[]'), n = titles.length, cur = 1;
    var img = $('#pv-img'), cap = $('#pv-cap'), prev = $('.prev', pv), next = $('.next', pv), thumbs = $$('.pv-thumbs button', pv);
    function pad(i) { return (i < 10 ? '0' : '') + i; }
    function show(i, fromUser) {
      cur = Math.max(1, Math.min(n, i));
      img.src = SITE + 'profile/p' + pad(cur) + '.jpg';
      img.alt = 'Company profile page ' + cur + ' of ' + n + ': ' + titles[cur - 1];
      cap.innerHTML = '<b>Page ' + cur + ' of ' + n + '</b> &middot; ' + titles[cur - 1];
      prev.disabled = cur === 1; next.disabled = cur === n;
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k + 1 === cur ? 'true' : 'false'); });
      var t = thumbs[cur - 1]; if (t && fromUser) { try { t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ } }
      [cur + 1, cur - 1].forEach(function (k) { if (k >= 1 && k <= n) { var im = new Image(); im.src = SITE + 'profile/p' + pad(k) + '.jpg'; } });
    }
    on(prev, 'click', function () { show(cur - 1, true); });
    on(next, 'click', function () { show(cur + 1, true); });
    thumbs.forEach(function (t, k) { on(t, 'click', function () { show(k + 1, true); }); });
    on(d, 'keydown', function (e) {
      if (!pv.offsetParent) return;
      var tag = (d.activeElement && d.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowRight') { show(cur + 1, true); }
      else if (e.key === 'ArrowLeft') { show(cur - 1, true); }
    });
    var start = 1;
    show(start, false);
  }
})();
