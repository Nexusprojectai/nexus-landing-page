/* ============================================================
   NEXUS v3.0 — Neo-Brutalist Terminal
   script.js
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. CLOCK (nav + status bar)
     --------------------------------------------------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tickClock() {
    var d = new Date();
    var t = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    var navClock = $('#navClock');
    var statusClock = $('#statusClock');
    if (navClock) navClock.textContent = t;
    if (statusClock) statusClock.textContent = t;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------------------------------------------------
     2. SCROLL PROGRESS + NAV STATE
     --------------------------------------------------------- */
  var nav = $('#nav');
  var progress = $('#scrollProgress');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (y / h) * 100 : 0;

    if (progress) progress.style.width = pct.toFixed(2) + '%';
    if (nav) {
      if (y > 40) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     3. MOBILE MENU
     --------------------------------------------------------- */
  var menuBtn = $('#menuBtn');
  var navLinks = $('#navLinks');

  function closeMenu() {
    if (!navLinks || !menuBtn) return;
    navLinks.classList.remove('is-open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  if (menuBtn && navLinks) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
    });

    $$('a', navLinks).forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     4. REVEAL ON SCROLL
     --------------------------------------------------------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !REDUCED) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 70) + 'ms';
      ro.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     5. ACTIVE NAV LINK
     --------------------------------------------------------- */
  var sections = $$('section[id]');
  var links = $$('#navLinks a[data-sec]');

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-sec') === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { threshold: 0.25, rootMargin: '-25% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------------------------------------------------------
     6. COUNTERS (stats)
     --------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dec = (el.getAttribute('data-count') || '').indexOf('.') > -1 ? 1 : 0;
    var dur = REDUCED ? 0 : 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = dur === 0 ? 1 : Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(1) : Math.round(val).toString();
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = dec ? target.toFixed(1) : Math.round(target).toString();
    }
    window.requestAnimationFrame(step);
  }

  var counters = $$('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            co.unobserve(en.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { co.observe(c); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------------------------------------------------------
     7. BARS (stats)
     --------------------------------------------------------- */
  var bars = $$('.bar-fill[data-w]');
  if (bars.length) {
    if ('IntersectionObserver' in window) {
      var bo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.width = en.target.getAttribute('data-w') + '%';
            bo.unobserve(en.target);
          }
        });
      }, { threshold: 0.35 });
      bars.forEach(function (b) { bo.observe(b); });
    } else {
      bars.forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
    }
  }

  /* ---------------------------------------------------------
     8. TERMINAL TYPING
     --------------------------------------------------------- */
  var typingLine = $('#typingLine');
  var FULL = 'nexus --criar-site "landing-page" --deploy';

  function typeLoop() {
    if (!typingLine) return;
    if (REDUCED) { typingLine.textContent = FULL; return; }

    var i = 0;
    var dir = 1;
    var hold = 0;

    function frame() {
      if (hold > 0) {
        hold--;
        return setTimeout(frame, 60);
      }
      typingLine.textContent = FULL.slice(0, i);

      if (dir === 1) {
        if (i < FULL.length) { i++; return setTimeout(frame, 55 + Math.random() * 45); }
        dir = -1; hold = 40; return setTimeout(frame, 60);
      } else {
        if (i > 0) { i--; return setTimeout(frame, 28); }
        dir = 1; hold = 12; return setTimeout(frame, 60);
      }
    }
    setTimeout(frame, 700);
  }
  typeLoop();

  /* ---------------------------------------------------------
     9. EASTER EGG — konami-ish: type "nexi"
     --------------------------------------------------------- */
  var buf = '';
  document.addEventListener('keydown', function (e) {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-6);
    if (buf.indexOf('nexi') > -1) {
      buf = '';
      var sk = $('#statusClock');
      if (sk) {
        var orig = sk.textContent;
        sk.textContent = '\u2726 Nexi diz: ola! \u2726';
        setTimeout(function () { sk.textContent = orig; }, 2600);
      }
      document.documentElement.classList.add('egg');
      setTimeout(function () { document.documentElement.classList.remove('egg'); }, 1400);
    }
  });

  /* ---------------------------------------------------------
     10. SMOOTH ANCHOR (fallback)
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var offset = nav ? nav.offsetHeight + 8 : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

})();
