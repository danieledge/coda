// Coda for the Psion netBook: scroll reveals, before and after sliders, the comparison gallery,
// and pixel-crisp scaling for screenshots shown larger than their own size.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveals
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Pixel-crisp when a screenshot is drawn at or above its own pixel size
  function crisp(img) {
    if (!img.naturalWidth || !img.clientWidth) return;
    var dpr = window.devicePixelRatio || 1;
    img.classList.toggle('px', img.clientWidth * dpr >= img.naturalWidth * 0.98);
  }
  function crispAll() { Array.prototype.forEach.call(document.images, crisp); }
  Array.prototype.forEach.call(document.images, function (img) {
    if (img.complete) crisp(img); else img.addEventListener('load', function () { crisp(img); });
  });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(crispAll, 120); });

  // Before and after sliders
  function setPos(fig, pct) {
    pct = Math.max(0, Math.min(100, pct));
    fig.style.setProperty('--pos', pct + '%');
    var r = fig.querySelector('.ba-range');
    if (r && +r.value !== Math.round(pct)) r.value = Math.round(pct);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.ba'), function (fig) {
    var stage = fig.querySelector('.ba-stage');
    var range = fig.querySelector('.ba-range');
    if (!stage || !range) return;
    range.style.pointerEvents = 'none';
    range.addEventListener('input', function () { setPos(fig, +range.value); });
    var dragging = false;
    function fromEvent(e) {
      var rect = stage.getBoundingClientRect();
      setPos(fig, ((e.clientX - rect.left) / rect.width) * 100);
    }
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button > 0) return;
      e.preventDefault();
      dragging = true;
      range.focus({ preventScroll: true });
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    stage.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
      stage.addEventListener(t, function () { dragging = false; });
    });
  });

  // The chapter in view, marked in the navigation
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var chapters = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if ('IntersectionObserver' in window && chapters.every(Boolean)) {
    var current = null;
    function mark() {
      var y = window.scrollY + window.innerHeight * 0.3, idx = -1;
      chapters.forEach(function (c, i) { if (c.offsetTop <= y) idx = i; });
      if (idx === current) return;
      current = idx;
      navLinks.forEach(function (a, i) {
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (idx >= 0 && navLinks[idx].scrollIntoView && window.innerWidth <= 980) {
        var strip = navLinks[idx].closest('.nav-links');
        if (strip) strip.scrollTo({ left: navLinks[idx].offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    var watch = new IntersectionObserver(mark, { threshold: [0, 0.25, 0.5, 1] });
    Array.prototype.forEach.call(document.querySelectorAll('main > section'), function (s) { watch.observe(s); });
    mark();
  }

  // Comparison gallery
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (g) {
    var tabs = Array.prototype.slice.call(g.querySelectorAll('[role="tab"]'));
    var fig = g.querySelector('.ba');
    var stage = fig.querySelector('.ba-stage');
    var before = fig.querySelector('.ba-before');
    var after = fig.querySelector('.ba-after');
    var cap = fig.querySelector('.gallery-cap');

    function fit(w, h) { stage.classList.toggle('slim', h > w * 1.6); }
    function show(btn) {
      tabs.forEach(function (t) {
        var on = t === btn;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      var d = btn.dataset;
      [before, after].forEach(function (img) {
        img.width = +d.w; img.height = +d.h; img.classList.remove('px');
      });
      before.src = d.b; before.alt = d.altB;
      after.src = d.a; after.alt = d.altA;
      cap.textContent = d.cap;
      fit(+d.w, +d.h);
      setPos(fig, 50);
    }
    [before, after].forEach(function (img) { img.addEventListener('load', function () { crisp(img); }); });
    tabs.forEach(function (t, i) {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); tabs[j].focus(); show(tabs[j]); }
      });
    });
    var first = tabs[0];
    fit(+first.dataset.w, +first.dataset.h);
  });
})();
