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
/* ============================================================
   PLAYGROUND — TERMINAL INTERATIVO
   ============================================================ */
(function () {
  var body  = document.getElementById('pgBody');
  var form  = document.getElementById('pgForm');
  var input = document.getElementById('pgInput');
  var chips = document.getElementById('pgChips');
  var term  = document.getElementById('pgTerm');
  if (!body || !form || !input) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = REDUCED ? 0 : 1;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms * T); }); }

  function line(txt, cls) {
    var p = document.createElement('p');
    p.className = 'tln' + (cls ? ' ' + cls : '');
    p.textContent = txt;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
    return p;
  }
  function clear() { body.innerHTML = ''; }
  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  /* ---------- banco de comandos ---------- */
  var CMD = [

    { id: 'help', keys: ['help', 'ajuda', '?', 'o que voce faz', 'comandos'], chip: 'help',
      run: async function () {
        line('Eu entendo linguagem natural. Alguns exemplos:', 'tln-dim');
        line('  nexus crie um site sobre aquários', 'tln-ok');
        line('  nexus organize minha pasta de downloads', 'tln-ok');
        line('  nexus toque lofi para estudar', 'tln-ok');
        line('  nexus avise o João que vou atrasar', 'tln-ok');
        line('  nexus tire um print da tela', 'tln-ok');
        line('  nexus resuma meus e-mails de hoje', 'tln-ok');
        line('  nexus status do meu pc', 'tln-ok');
        line('  limpar', 'tln-dim');
      }
    },

    { id: 'site', keys: ['crie um site', 'criar site', 'faca um site', 'crie uma pagina', 'landing page', 'site', 'pagina web', 'html'], chip: 'crie um site',
      run: async function () {
        line('[1/5] Interpretando a intenção.......', 'tln-dim'); await wait(360);
        line('[2/5] Escolhendo a stack............. html/css/js puro', 'tln-dim'); await wait(420);
        line('[3/5] Gerando a estrutura...........', 'tln-dim'); await wait(520);
        line('[4/5] Escrevendo os arquivos........', 'tln-dim'); await wait(560);
        line('[5/5] Abrindo no navegador..........', 'tln-dim'); await wait(380);
        line('');
        line('  site-aquarios/index.html    criado  (8,1 KB)', 'tln-ok');
        line('  site-aquarios/style.css     criado  (11,4 KB)', 'tln-ok');
        line('  site-aquarios/script.js     criado  (4,7 KB)', 'tln-ok');
        line('');
        line('Pronto. 3 arquivos em 4,2s — já está aberto no seu navegador.', 'tln-in');
      }
    },

    { id: 'organize', keys: ['organize', 'organizar', 'arquivos', 'pasta', 'downloads', 'bagunca'], chip: 'organize meus arquivos',
      run: async function () {
        line('Lendo /Downloads  →  248 itens encontrados', 'tln-dim'); await wait(480);
        line('Classificando por tipo, data e projeto...', 'tln-dim'); await wait(620);
        line('');
        line('  /Imagens      142 arquivos', 'tln-ok');
        line('  /Documentos    53 arquivos', 'tln-ok');
        line('  /Instaladores  31 arquivos', 'tln-ok');
        line('  /Projetos      22 arquivos', 'tln-ok');
        line('');
        line('Tudo organizado. 0 arquivos deletados — só movidos.', 'tln-in');
      }
    },

    { id: 'musica', keys: ['toque', 'musica', 'lofi', 'spotify', 'play', 'som', 'somz'], chip: 'toque uma música',
      run: async function () {
        line('Abrindo o player do desktop...', 'tln-dim'); await wait(380);
        line('Buscando por "lofi hip hop / study beats"...', 'tln-dim'); await wait(520);
        line('');
        line('  tocando agora: lofi beats • 1h42 de fila', 'tln-ok');
        line('Serviço iniciado. Volume em 35%.', 'tln-in');
      }
    },

    { id: 'msg', keys: ['avise', 'mensagem', 'whatsapp', 'mande um recado', 'zap', 'envie'], chip: 'mande uma mensagem',
      run: async function () {
        line('Abrindo a conversa do João no WhatsApp...', 'tln-dim'); await wait(480);
        line('Escrevendo', 'tln-dim');
        line('› "oi João, vou atrasar uns 15 min, já estou saindo"', 'tln-warn'); await wait(520);
        line('Aguardando confirmação na tela...', 'tln-dim'); await wait(400);
        line('');
        line('Mensagem enviada ✓', 'tln-in');
        line('(eu mostro na tela antes de mandar — você sempre aprova)', 'tln-dim');
      }
    },

    { id: 'print', keys: ['print', 'screenshot', 'capture', 'foto da tela', 'tela'], chip: 'tire um print da tela',
      run: async function () {
        line('Capturando tela 1 de 1  (2560×1440)...', 'tln-dim'); await wait(520);
        line('');
        line('  tela-2025-06-14-1042.png   salvo na área de trabalho', 'tln-ok');
        line('Print pronto. Quer que eu anexe em algum lugar?', 'tln-in');
      }
    },

    { id: 'email', keys: ['email', 'e-mail', 'emails', 'resuma', 'caixa de entrada', 'inbox'], chip: 'resuma meus e-mails',
      run: async function () {
        line('Conectando... 3 contas, 128 não lidos', 'tln-dim'); await wait(560);
        line('Filtrando o que é ruído, o que é trabalho, o que é urgente...', 'tln-dim'); await wait(700);
        line('');
        line('  URGENTE  1) contrato da AWS vence em 2 dias', 'tln-warn');
        line('  TRABALHO 2) cliente pediu revisão da proposta', 'tln-ok');
        line('  RUÍDO   27) newsletters, promoções, notificações', 'tln-dim');
        line('');
        line('Resumo em 40 caracteres: "contrato AWS + proposta do cliente".', 'tln-in');
      }
    },

    { id: 'status', keys: ['status', 'como esta meu pc', 'desempenho', 'sistema', 'memoria', 'processador'], chip: 'status do meu pc',
      run: async function () {
        line('Coletando métricas do sistema...', 'tln-dim'); await wait(520);
        line('');
        line('  CPU     14%   (nenhum gargalo)', 'tln-ok');
        line('  RAM     9,4 GB / 32 GB', 'tln-ok');
        line('  GPU     31°C   ociosa', 'tln-ok');
        line('  DISCO   72% usado — limpar 12 GB de cache?', 'tln-warn');
        line('  UPTIME  6d 04h', 'tln-dim');
        line('');
        line('Sistema saudável. Só esse cache aí sobrando.', 'tln-in');
      }
    },

    { id: 'piada', keys: ['piada', 'conta uma piada', 'engracado', 'humor'], chip: 'conte uma piada',
      run: async function () {
        await wait(300);
        line('Por que o programador foi ao médico?', 'tln-warn'); await wait(700);
        line('Porque estava com um bug no sistema imunológico. 🥁', 'tln-ok');
        line('(no desktop eu conto muito melhor, juro)', 'tln-dim');
      }
    },

    { id: 'sobre', keys: ['quem e voce', 'o que e o nexus', 'sobre', 'quem es tu', 'quem é você'], chip: 'quem é você?',
      run: async function () {
        line('Nexus — assistente desktop autônomo com IA.', 'tln-in'); await wait(420);
        line('Eu não sou chatbot. Eu abro programas, mexo em arquivos,');
        line('navego, escrevo, organizo, programo e executo. No seu PC.', 'tln-dim'); await wait(420);
        line('');
        line('Você fala em português. Eu transformo em ação.', 'tln-ok');
      }
    },

    { id: 'limpar', keys: ['limpar', 'clear', 'cls', 'apagar tela'], chip: 'limpar',
      run: async function () { clear(); await wait(60); line('Terminal limpo. Manda o próximo.', 'tln-dim'); }
    }
  ];

  function find(q) {
    var n = norm(q);
    if (!n) return null;
    for (var i = 0; i < CMD.length; i++) {
      for (var j = 0; j < CMD[i].keys.length; j++) {
        if (n.indexOf(norm(CMD[i].keys[j])) > -1) return CMD[i];
      }
    }
    return null;
  }

  /* ---------- executor ---------- */
  var busy = false;
  async function run(text) {
    if (busy) return;
    busy = true;
    input.value = '';
    input.disabled = true;

    line('nexus » ' + text, 'tln-in');
    var cmd = find(text);
    await wait(240);

    if (!cmd) {
      line('Ainda não sei fazer isso... mas o Nexus real, no seu desktop,');
      line('descobre na hora — ele não depende de comando decorado.', 'tln-dim');
      line('Tenta "help" pra ver o que eu já ensaiei aqui.', 'tln-warn');
    } else {
      await cmd.run();
    }

    line('');
    input.disabled = false;
    busy = false;
    input.focus({ preventScroll: true });
  }

  /* ---------- chips ---------- */
  if (chips) {
    CMD.filter(function (c) { return c.id !== 'limpar' && c.id !== 'sobre'; })
       .slice(0, 6)
       .forEach(function (c) {
         var b = document.createElement('button');
         b.type = 'button';
         b.className = 'term-chip';
         b.textContent = 'nexus ' + c.chip;
         b.addEventListener('click', function () { run(b.textContent); });
         chips.appendChild(b);
       });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) { return; }
    if (norm(v).replace(/^nexus\s+/, '') === '' || norm(v) === 'nexus') { run('help'); return; }
    run(v.replace(/^nexus\s+/i, ''));
  });

  if (term) term.addEventListener('click', function (e) {
    if (e.target === input || e.target.closest('.term-send')) return;
    if (window.getSelection && String(window.getSelection()).length) return;
    input.focus({ preventScroll: true });
  });

  /* ---------- boot ao entrar na tela ---------- */
  var booted = false;
  async function boot() {
    line('Nexus v1.0  ·  assistente desktop autônomo', 'tln-dim'); await wait(320);
    line('bridge ok · localhost:7777 · permissões concedidas ✓', 'tln-ok'); await wait(300);
    line('');
    await wait(200);
    await run('help');
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !booted) { booted = true; io.disconnect(); boot(); }
      });
    }, { threshold: 0.3 });
    io.observe(term || form);
  } else {
    booted = true; boot();
  }

})();
