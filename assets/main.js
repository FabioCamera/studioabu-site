(function () {
  var PREVIEW = !!window.SA_PREVIEW;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // menu
  var nav = $('.nav'), btn = $('.menu-btn');
  function closeMenu() { if (!nav) return; nav.classList.remove('open'); if (btn) { btn.textContent = 'Menu'; btn.setAttribute('aria-expanded', 'false'); } }
  if (btn) btn.addEventListener('click', function () { var o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); btn.textContent = o ? 'Close' : 'Menu'; });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // YouTube: load the player only when clicked (live site only)
  if (!PREVIEW) $$('.yt[data-yt]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + a.dataset.yt + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = a.querySelector('img').alt;
      var box = document.createElement('div'); box.className = a.className; box.appendChild(f); a.replaceWith(box);
    });
  });

  // archive filters + lightbox
  $$('.filters').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', group).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      $$('.tile').forEach(function (t) { t.hidden = !(b.dataset.f === 'all' || t.dataset.c === b.dataset.f); });
    });
  });
  var lb = $('#lightbox');
  if (lb && lb.showModal) {
    function open(t) { var i = $('img', t); $('img', lb).src = i.src; $('img', lb).alt = i.alt; $('p', lb).textContent = $('figcaption', t).textContent; lb.showModal(); }
    $$('.tile').forEach(function (t) {
      t.addEventListener('click', function () { open(t); });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(t); } });
    });
    $('#lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  // contact form (Web3Forms)
  var form = $('#project-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('#form-status'), send = $('button[type=submit]', form), ok = true;
    $$('[required]', form).forEach(function (f) { var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)); f.setAttribute('aria-invalid', bad); if (bad) ok = false; });
    if (!ok) { status.className = 'form-note err'; status.innerHTML = 'Fill in the highlighted blanks and try again.'; return; }
    if (PREVIEW) { status.className = 'form-note ok'; status.innerHTML = 'Preview only; nothing was sent. On the live site this goes straight to <b>hello@studioabu.nz</b>.'; return; }
    send.disabled = true; send.textContent = 'Sending…';
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success) throw new Error(d.message);
        form.reset(); status.className = 'form-note ok';
        status.innerHTML = 'Thanks; your message is on its way. I\'ll be in touch soon.';
        if (window.gtag) gtag('event', 'generate_lead');
      })
      .catch(function () { status.className = 'form-note err'; status.innerHTML = 'Something went wrong. Please email <b>hello@studioabu.nz</b> instead.'; })
      .finally(function () { send.disabled = false; send.textContent = 'Send it →'; });
  });

  // preview router: every page lives in one document, switched by #hash
  if (PREVIEW) {
    var views = $$('.view');
    function route() {
      var h = location.hash.slice(1) || 'home', target = null;
      var id = document.getElementById('v-' + h) ? h : 'home';
      if (!document.getElementById('v-' + h)) target = h && document.getElementById(h);
      views.forEach(function (v) { v.hidden = v.id !== 'v-' + id; });
      $$('.nav a').forEach(function (a) { a.removeAttribute('aria-current'); });
      var map = { archive: '#archive', about: '#about' }, nv = map[id] ? $('.nav a[href="' + map[id] + '"]') : (id !== 'contact' ? $('.nav a[href="#work"]') : null);
      if (nv) nv.setAttribute('aria-current', 'page');
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
      var shown = document.getElementById('v-' + id); if (window.SA_PRIME && shown) window.SA_PRIME(shown);
    }
    addEventListener('hashchange', route); route();
  }
})();

/* ---------- motion: load sequence, scroll reveals, parallax, cursor ---------- */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // split headline text into words that rise into view
  function split(el) {
    if (el.dataset.split) return; el.dataset.split = 1; var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'), inner = document.createElement('span');
            o.className = 'sw'; inner.textContent = w; inner.style.transitionDelay = (0.15 + i++ * 0.06) + 's';
            o.appendChild(inner); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('sw')) walk(n);
      });
    })(el);
  }

  var REVEAL = '.chapter-head,.chapter h2,.chapter-foot,.index li,.act-grid,.pull,.stat,.disc,.media>figure,.media>.media,.reels figure,.posts figure,.next h2,.next .eyebrow,.strip-head,.contact h2,.contact .row,.tile,.steps li,.madlib .ml,.form-foot';
  var IMGS = '.chapter .frame,.next .frame,.strip .frame,.cs-hero + .wrap > *,.full img';
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function prime(scope) {
    // hero: words rise, the rest fades up in sequence
    $$('.intro, .cs-hero', scope).forEach(function (h) {
      h.classList.remove('is-in');
      $$('h1', h).forEach(split);
      $$('.eyebrow, .lede, .intro-meta, .spec, .scroll-cue, .back, .filters, .about-grid .portrait', h).forEach(function (el, k) {
        el.classList.add('fade-up'); el.style.transitionDelay = (0.35 + k * 0.12) + 's';
      });
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
    });
    $$(REVEAL, scope).forEach(function (el) {
      if (el.closest('.cs-hero')) return;
      el.classList.add('reveal');
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = ((sibs % 4) * 0.08) + 's';
      io.observe(el);
    });
    $$(IMGS, scope).forEach(function (el) { el.classList.add('reveal-img'); io.observe(el); });
  }
  window.SA_PRIME = prime;

  function start() {
    prime(document);
    requestAnimationFrame(function () { root.classList.add('ready'); });
    // safety: never leave content hidden
    setTimeout(function () { $$('.reveal,.reveal-img').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }); }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  // parallax on project images
  var ticking = false;
  function parallax() {
    ticking = false;
    $$('.chapter .frame img, .next .frame img').forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
      img.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();

  // custom cursor (mouse only)
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var c = document.createElement('div'); c.className = 'cursor'; c.innerHTML = '<b>View</b>'; document.body.appendChild(c);
  root.classList.add('has-cursor');
  var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; c.classList.add('on'); }, { passive: true });
  document.addEventListener('mouseleave', function () { c.classList.remove('on'); });
  addEventListener('mousedown', function () { c.classList.add('down'); });
  addEventListener('mouseup', function () { c.classList.remove('down'); });
  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    var view = t.closest && t.closest('.chapter .frame, .next, .tile, .yt, .strip .frame');
    var link = !view && t.closest && t.closest('a, button, select, label, .menu-btn');
    c.classList.toggle('view', !!view);
    c.classList.toggle('link', !!link);
    if (view) c.querySelector('b').textContent = t.closest('.yt') ? 'Play' : t.closest('.tile') ? 'Open' : 'View';
  });
  (function loop() {
    cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
    c.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    requestAnimationFrame(loop);
  })();

  // magnetic buttons
  $$('.cta, .btn, .btn-big, .read').forEach(function (b) {
    b.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)'; b.style.display = b.style.display || '';
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });
})();
