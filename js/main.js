/* K North Technologies: site behaviour. Vanilla JS, no build step. */
(function () {
  'use strict';

  /* ---------- Google Analytics 4: traffic measurement ---------- */
  (function () {
    var GA_ID = 'G-V290LH0FYP';
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  })();


  /* ============================================================
     SITE SETTINGS: replace these placeholders before going live.
     Leave a value empty ('') to hide it.
     ============================================================ */
  var CONFIG = {
    CONTACT_EMAIL: 'keita.linton@knorthtechnologies.ca', // business email
    PHONE: '(587) 335-5224',           // e.g. '+1 780 555 0123' (shown as typed). Empty = phone line hidden
    BOOKING_URL: 'https://calendly.com/keita-linton-knorthtechnologies/free-call', // e.g. Calendly / Microsoft Bookings URL. Empty = buttons go to the Contact page / email
    LINKEDIN_URL: 'https://www.linkedin.com/in/keita-linton-a11a453b1/',                  // company LinkedIn page URL. Empty = no LinkedIn link in the footer
    QUICK_START_PRICE: 1495,           // founding price, up to 15 staff
    INCLUDED_STAFF: 15,
    EXTRA_PER_PERSON: 75,
    WORK_WEEKS: 46
  };
  var isSet = function (v) { return typeof v === 'string' && v.length > 0 && v.charAt(0) !== '['; };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Placeholders → real links once CONFIG is filled ---------- */
  function applyConfig() {
    if (isSet(CONFIG.BOOKING_URL)) {
      /* Booking happens on this site: the Calendly calendar is embedded
         on contact.html#book, so no visitor is sent to calendly.com. */
      var here = (location.pathname.split('/').pop() || 'index.html');
      var bookHref = here === 'contact.html' ? '#book' : 'contact.html#book';
      $$('.js-booking').forEach(function (a) {
        a.href = bookHref;
        a.removeAttribute('target');
        a.removeAttribute('rel');
        if (a.dataset.bookingText) a.textContent = a.dataset.bookingText;
      });
    }
    if (isSet(CONFIG.CONTACT_EMAIL)) {
      $$('.js-email').forEach(function (a) { a.href = 'mailto:' + CONFIG.CONTACT_EMAIL; a.textContent = CONFIG.CONTACT_EMAIL; });
      var form = $('#contact-form');
      if (form) form.setAttribute('action', 'mailto:' + CONFIG.CONTACT_EMAIL);
    }
    $$('.js-phone').forEach(function (a) {
      var item = a.closest('.js-phone-item') || a;
      if (isSet(CONFIG.PHONE)) {
        a.href = 'tel:' + CONFIG.PHONE.replace(/[^\d+]/g, '');
        a.textContent = CONFIG.PHONE;
        item.hidden = false;
      } else {
        item.hidden = true;
      }
    });
    if (isSet(CONFIG.LINKEDIN_URL)) {
      if (!$('.js-linkedin')) {
        $$('.footer-nav ul').forEach(function (ul) {
          var li = document.createElement('li');
          li.innerHTML = '<a class="js-linkedin" href="#">LinkedIn</a>';
          ul.appendChild(li);
        });
      }
      $$('.js-linkedin').forEach(function (a) { a.href = CONFIG.LINKEDIN_URL; a.textContent = 'LinkedIn'; a.target = '_blank'; a.rel = 'noopener'; });
    }
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- Header: scrolled state + mobile menu ---------- */
  function initHeader() {
    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!header || !toggle || !nav) return;

    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) {
        var first = $('a', nav);
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { if (nav.classList.contains('open')) setOpen(false, false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false, true);
    });
    // Keep keyboard focus inside the open mobile menu.
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
      var items = [toggle].concat($$('a', nav));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === $('a', nav)) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (mq) { if (mq.matches) setOpen(false, false); });

    // Highlight the nav link for the section in view.
    if ('IntersectionObserver' in window) {
      var links = $$('a[href^="#"]', nav).filter(function (a) { return !a.classList.contains('btn'); });
      var map = {};
      links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
            map[en.target.id].classList.add('active');
            map[en.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.classList.add('is-visible');
          io.unobserve(el);
          // Clear the stagger delay afterwards so hover effects respond instantly.
          setTimeout(function () { el.style.transitionDelay = ''; }, (parseFloat(el.style.transitionDelay) || 0) + 800);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // Stagger: what is on screen when the page opens arrives in order;
    // the rest staggers within its own group as you scroll.
    var vh = window.innerHeight, first = 0;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var delay;
      if (r.top < vh && r.bottom > 0) delay = 60 + Math.min(first++, 9) * 85;
      else {
        var sibs = $$(':scope > .reveal', el.parentElement);
        delay = (sibs.indexOf(el) % 4) * 90;
      }
      el.style.transitionDelay = delay + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Tabs, page transitions and motion layer ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var PAGES = ['index.html', 'services.html', 'ai.html', 'quiz.html', 'about.html', 'faq.html', 'contact.html'];
  var fileOf = function (url) { var f = url.pathname.split('/').pop(); return f === '' ? 'index.html' : f; };
  var tabOf = function (url) { var i = PAGES.indexOf(fileOf(url)); return i < 0 ? 7 : i; };

  function initPageTransitions() {
    var here = Number(root.getAttribute('data-tab'));
    // Remember this tab so the next page knows which way to slide.
    try { sessionStorage.setItem('kn-from', String(isNaN(here) ? 7 : here)); } catch (e) { /* private mode */ }
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) root.classList.remove('page-leave', 'leave-fwd', 'leave-back');
    });
    // Browsers with cross-document View Transitions animate natively (see CSS).
    if (!root.classList.contains('no-vt') || reduceMotion) return;

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      if (!/^[\w-]+\.html(#[\w-]*)?$/.test(a.getAttribute('href'))) return;
      var url = new URL(a.href, location.href);
      if (fileOf(url) === fileOf(location)) return; // same page: normal jump
      e.preventDefault();
      var to = tabOf(url);
      root.classList.add('page-leave', to < here ? 'leave-back' : 'leave-fwd');
      slideTabLine(fileOf(url));
      setTimeout(function () { window.location.href = a.href; }, 260);
    });
  }

  // Fallback only: glide the active-tab underline to the tab being opened.
  function slideTabLine(file) {
    var line = $('.site-nav .tab-line');
    var target = $('.site-nav a[href="' + file + '"]');
    if (!line || !target || !window.matchMedia('(min-width: 1081px)').matches) return;
    var a = line.getBoundingClientRect(), t = target.getBoundingClientRect();
    var w = t.width - 24;
    line.style.transform = 'translateX(' + (t.left + 12 - a.left) + 'px) scaleX(' + (w / a.width) + ')';
  }

  function initRipple() {
    if (reduceMotion) return;
    var SEL = '.btn, .card, .price-card, .tl-body, .option label, .faq-q, .page-next-inner';
    function spawn(el, x, y) {
      if (el.disabled) return;
      var wrap = null;
      for (var i = 0; i < el.children.length; i++) if (el.children[i].classList.contains('ripple-wrap')) wrap = el.children[i];
      if (!wrap) {
        wrap = document.createElement('span');
        wrap.className = 'ripple-wrap';
        wrap.setAttribute('aria-hidden', 'true');
        el.appendChild(wrap);
      }
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.2;
      if (x == null) { x = r.left + r.width / 2; y = r.top + r.height / 2; }
      var s = document.createElement('span');
      s.className = 'ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (x - r.left - size / 2) + 'px';
      s.style.top = (y - r.top - size / 2) + 'px';
      wrap.appendChild(s);
      var gone = function () { if (s.parentNode) s.parentNode.removeChild(s); };
      s.addEventListener('animationend', gone);
      setTimeout(gone, 1000);
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !e.target.closest) return;
      var el = e.target.closest(SEL);
      if (el) spawn(el, e.clientX, e.clientY);
    });
    // Keyboard activation (Enter / Space) ripples from the centre.
    document.addEventListener('click', function (e) {
      if (e.detail !== 0 || !e.target.closest) return;
      var el = e.target.closest(SEL);
      if (el) spawn(el);
    });
  }

  function initTilt() {
    if (reduceMotion || !finePointer) return;
    $$('.card, .price-card, .tl-body').forEach(function (el) {
      el.classList.add('tilt');
      var raf = 0, px = 0.5, py = 0.5;
      var apply = function () {
        raf = 0;
        var max = el.offsetWidth > 520 ? 4 : 7;
        el.style.setProperty('--rx', ((0.5 - py) * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((px - 0.5) * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      };
      el.addEventListener('pointerenter', function () {
        if (!el.classList.contains('reveal') || el.classList.contains('is-visible')) el.classList.add('is-tilting');
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  function initHeroFX() {
    if (reduceMotion || !finePointer) return;
    $$('.hero, .page-hero').forEach(function (hero) {
      var raf = 0, x = 0.6, y = 0.3;
      var apply = function () {
        raf = 0;
        hero.style.setProperty('--mx', (x * 100).toFixed(2) + '%');
        hero.style.setProperty('--my', (y * 100).toFixed(2) + '%');
        hero.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3));
        hero.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3));
      };
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        x = (e.clientX - r.left) / r.width;
        y = (e.clientY - r.top) / r.height;
        hero.classList.add('is-pointer');
        if (!raf) raf = requestAnimationFrame(apply);
      });
      hero.addEventListener('pointerleave', function () {
        hero.classList.remove('is-pointer');
        x = 0.5; y = 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      });
    });
  }

  /* ---------- Copilot readiness quiz ---------- */
  var QUESTIONS = [
    { id: 'm365', q: 'Does your team use Microsoft 365 (Outlook, Teams, OneDrive) for daily work?',
      a: [['Yes, everyone uses it every day', 2], ['Some people, or only email', 1], ['No, we use something else', 0]],
      gap: 'Move daily email, files and meetings onto Microsoft 365. Copilot can only help with what lives there.' },
    { id: 'mfa', q: 'Is multi-factor sign-in turned on for every account?',
      a: [['Yes, for everyone', 2], ['For some people', 1], ['No, or not sure', 0]],
      gap: 'Turn on multi-factor sign-in for every account before adding Copilot.' },
    { id: 'files', q: 'Where do most of your business files live?',
      a: [['Organised in SharePoint or OneDrive', 2], ['A mix of OneDrive, email and local drives', 1], ['On local computers, USB drives or a server', 0]],
      gap: 'Move key files into SharePoint or OneDrive so Copilot can work with them safely.' },
    { id: 'perms', q: 'Do you know who can see your shared folders and files?',
      a: [['Yes, we reviewed it recently', 2], ['Roughly', 1], ['No idea', 0]],
      gap: 'Review sharing and permissions first, so Copilot never surfaces files people should not see.' },
    { id: 'licence', q: 'Where are you with Copilot today?',
      a: [['Licensed and used every week', 2], ['Licensed, but rarely used', 1], ['Not licensed yet', 0]],
      gap: 'Pick the right Copilot licences for the people who will benefit most, rather than everyone at once.' },
    { id: 'training', q: 'Has your team had any Microsoft 365 or Copilot training in the past year?',
      a: [['Yes, hands-on training', 2], ['A video or two', 1], ['None', 0]],
      gap: 'Give staff a short, hands-on workshop using their own daily tasks. This is where most of the value is.' },
    { id: 'it', q: 'Who looks after your IT?',
      a: [['An IT person or a managed IT provider', 2], ['A tech-savvy staff member, when they have time', 1], ['Nobody, really', 0]],
      gap: 'Name one person (or a partner) to own Microsoft 365 settings, new staff set-up and Copilot questions.' }
  ];

  var RESULTS = [
    { min: 75, level: 'Ready to go', title: 'You are ready. Train the team.',
      text: 'Your foundations look solid. The fastest win is getting your people confident with Copilot on their real work. The Workshop Only package, or the full Quick Start if you want usage reporting and support, will get you there.' },
    { min: 45, level: 'Nearly there', title: 'The Copilot Quick Start is your best fit.',
      text: 'You have the basics, but a few gaps could cause risk or waste. The Quick Start closes them with a security check, a clean setup and a hands-on workshop, all for one fixed price.' },
    { min: 0, level: 'Foundations first', title: 'Start with a Readiness Check.',
      text: 'Copilot will struggle (and could expose the wrong files) until a few basics are in place. A Readiness Check gives you a clear, plain-English plan for $750, so you know exactly what to fix first.' }
  ];

  function initQuiz() {
    var wrap = $('#quiz-questions');
    if (!wrap) return;
    var form = $('#quiz-form'), back = $('#quiz-back'), next = $('#quiz-next');
    var bar = $('#quiz-bar'), count = $('#quiz-count'), result = $('#quiz-result');
    var answers = new Array(QUESTIONS.length);
    var step = 0;

    function render() {
      var Q = QUESTIONS[step];
      var html = '<fieldset class="quiz-q-enter"><legend id="q-legend">' + Q.q + '</legend><div class="options">';
      Q.a.forEach(function (opt, i) {
        var id = 'q' + step + 'o' + i;
        var checked = answers[step] === i ? ' checked' : '';
        html += '<div class="option"><input type="radio" name="q' + step + '" id="' + id + '" value="' + i + '"' + checked + '>' +
                '<label for="' + id + '">' + opt[0] + '</label></div>';
      });
      html += '</div></fieldset>';
      wrap.innerHTML = html;
      count.textContent = 'Question ' + (step + 1) + ' of ' + QUESTIONS.length;
      bar.style.width = (step / QUESTIONS.length * 100) + '%';
      back.disabled = step === 0;
      next.disabled = answers[step] === undefined;
      next.textContent = step === QUESTIONS.length - 1 ? 'See my score' : 'Next';
    }

    function focusFirstOption() {
      var sel = $('input:checked', wrap) || $('input', wrap);
      if (sel) sel.focus();
    }

    wrap.addEventListener('change', function (e) {
      if (e.target && e.target.type === 'radio') {
        answers[step] = Number(e.target.value);
        next.disabled = false;
      }
    });
    // Enter on a chosen option moves on.
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.type === 'radio') {
        e.preventDefault();
        if (!e.target.checked) { e.target.checked = true; answers[step] = Number(e.target.value); }
        next.click();
      }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    next.addEventListener('click', function () {
      if (answers[step] === undefined) return;
      if (step < QUESTIONS.length - 1) { step++; render(); focusFirstOption(); }
      else showResult();
    });
    back.addEventListener('click', function () {
      if (step > 0) { step--; render(); focusFirstOption(); }
    });

    function showResult() {
      var max = QUESTIONS.length * 2;
      var total = answers.reduce(function (s, idx, qi) { return s + QUESTIONS[qi].a[idx][1]; }, 0);
      var score = Math.round(total / max * 100);
      var res = RESULTS.filter(function (r) { return score >= r.min; })[0];

      // Weakest areas first (score 0, then 1), max 3 steps.
      var gaps = answers
        .map(function (idx, qi) { return { pts: QUESTIONS[qi].a[idx][1], text: QUESTIONS[qi].gap }; })
        .filter(function (g) { return g.pts < 2; })
        .sort(function (a, b) { return a.pts - b.pts; })
        .slice(0, 3)
        .map(function (g) { return g.text; });
      if (!gaps.length) gaps = ['Book a workshop so every team member gets hands-on time with Copilot.', 'Set up a monthly usage report so you can see the time saved.'];

      $('#result-level').textContent = res.level;
      $('#result-title').textContent = res.title;
      $('#result-text').textContent = res.text;
      $('#result-steps').innerHTML = gaps.map(function (g) { return '<li>' + g + '</li>'; }).join('');

      form.hidden = true;
      bar.style.width = '100%';
      count.textContent = 'Your score: ' + score + ' out of 100. ' + res.title;
      result.hidden = false;

      var ring = $('#result-ring');
      ring.style.stroke = score >= 75 ? '#4ade9b' : score >= 45 ? '#4da3ff' : '#ffd166';
      var scoreEl = $('#result-score');
      ring.style.strokeDashoffset = '100';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { ring.style.strokeDashoffset = String(100 - score); });
      });
      if (reduceMotion) { scoreEl.textContent = String(score); }
      else {
        var t0 = null;
        var tick = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1100, 1);
          scoreEl.textContent = String(Math.round(score * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        // Make sure the final number always shows, even if animation frames are throttled.
        setTimeout(function () { scoreEl.textContent = String(score); ring.style.strokeDashoffset = String(100 - score); }, 1200);
      }
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }

    $('#quiz-restart').addEventListener('click', function () {
      answers = new Array(QUESTIONS.length);
      step = 0;
      result.hidden = true;
      form.hidden = false;
      render();
      focusFirstOption();
    });

    render();
  }

  /* ---------- ROI calculator ---------- */
  var money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });

  function initROI() {
    var staff = $('#roi-staff'), hours = $('#roi-hours'), rate = $('#roi-rate'), lic = $('#roi-licence');
    if (!staff) return;
    var clamp = function (v, lo, hi, d) { v = parseFloat(v); if (isNaN(v)) return d; return Math.min(hi, Math.max(lo, v)); };

    function paintRange(r) {
      var p = (r.value - r.min) / (r.max - r.min) * 100;
      r.style.setProperty('--fill', p + '%');
    }

    function calc() {
      var s = clamp(staff.value, 1, 50, 10);
      var h = clamp(hours.value, 0.5, 6, 2);
      var r = clamp(rate.value, 0, 1000, 35);
      var l = clamp(lic.value, 0, 1000, 0);

      $('#roi-staff-out').textContent = s + (s === 1 ? ' person' : ' people');
      $('#roi-hours-out').textContent = h + (h === 1 ? ' hour' : ' hours');
      staff.setAttribute('aria-valuetext', s + ' people');
      hours.setAttribute('aria-valuetext', h + ' hours per week');
      paintRange(staff); paintRange(hours);

      var weeklyHours = s * h;
      var monthlyHours = weeklyHours * CONFIG.WORK_WEEKS / 12;
      var yearValue = weeklyHours * CONFIG.WORK_WEEKS * r;
      var yearLicence = s * l * 12;
      var net = yearValue - yearLicence;
      var cost = CONFIG.QUICK_START_PRICE + Math.max(0, s - CONFIG.INCLUDED_STAFF) * CONFIG.EXTRA_PER_PERSON;
      var weeklyNet = net / CONFIG.WORK_WEEKS;

      $('#roi-hours-month').textContent = num.format(monthlyHours);
      $('#roi-value-year').textContent = money.format(yearValue);
      var netEl = $('#roi-net-year');
      netEl.textContent = money.format(net);
      netEl.classList.toggle('negative', net < 0);
      netEl.classList.toggle('accent', net >= 0);

      var pb = $('#roi-payback');
      if (weeklyNet <= 0) pb.textContent = 'Not at these numbers';
      else {
        var w = Math.max(1, Math.ceil(cost / weeklyNet));
        pb.textContent = w + (w === 1 ? ' week' : ' weeks');
      }
      $('#roi-cost').textContent = 'Founding price ' + money.format(cost) + (s > CONFIG.INCLUDED_STAFF ? ' for ' + s + ' staff' : ' for up to 15 staff') + ', plus GST';
    }

    [staff, hours, rate, lic].forEach(function (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); });
    calc();
  }

  /* ---------- FAQ accordion ---------- */
  function initFAQ() {
    $$('.faq-q').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var item = btn.closest('.faq-item');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        item.classList.toggle('open', !open);
        if (reduceMotion) { panel.hidden = open; return; }
        if (!open) {
          panel.hidden = false;
          var h = panel.scrollHeight;
          panel.style.height = '0px';
          requestAnimationFrame(function () { panel.style.height = h + 'px'; });
        } else {
          panel.style.height = panel.scrollHeight + 'px';
          requestAnimationFrame(function () { panel.style.height = '0px'; });
        }
        var done = function (e) {
          if (e && e.propertyName !== 'height') return;
          panel.removeEventListener('transitionend', done);
          clearTimeout(timer);
          panel.style.height = '';
          if (btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true;
        };
        var timer = setTimeout(done, 450);
        panel.addEventListener('transitionend', done);
      });
    });
    // Arrow keys move between questions.
    var list = $('#faq-list');
    if (list) list.addEventListener('keydown', function (e) {
      var btns = $$('.faq-q', list);
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var t = null;
      if (e.key === 'ArrowDown') t = btns[(i + 1) % btns.length];
      else if (e.key === 'ArrowUp') t = btns[(i - 1 + btns.length) % btns.length];
      else if (e.key === 'Home') t = btns[0];
      else if (e.key === 'End') t = btns[btns.length - 1];
      if (t) { e.preventDefault(); t.focus(); }
    });
  }

  /* ---------- Contact form (front end only, mailto) ---------- */
  function initContact() {
    var form = $('#contact-form');
    if (!form) return;
    var status = $('#form-status');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setErr(input, msg) {
      var err = document.getElementById(input.id + '-err');
      if (err) err.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      return !msg;
    }
    function validate() {
      var ok = true, first = null;
      var checks = [
        [$('#cf-name'), function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; }],
        [$('#cf-email'), function (v) { return emailRe.test(v.trim()) ? '' : 'Please enter a valid email address.'; }],
        [$('#cf-message'), function (v) { return v.trim().length >= 10 ? '' : 'Please tell us a little more (at least 10 characters).'; }]
      ];
      checks.forEach(function (c) {
        var good = setErr(c[0], c[1](c[0].value));
        if (!good) { ok = false; if (!first) first = c[0]; }
      });
      var consent = $('#cf-consent');
      if (!setErr(consent, consent.checked ? '' : 'Please tick this box so we can reply.')) { ok = false; if (!first) first = consent; }
      if (first) first.focus();
      return ok;
    }

    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') setErr(el, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.innerHTML = '';
      if (!validate()) return;

      var get = function (id) { return $(id).value.trim(); };
      var subject = 'Enquiry: ' + get('#cf-interest') + (get('#cf-business') ? ' for ' + get('#cf-business') : '');
      var body = [
        'Name: ' + get('#cf-name'),
        'Business: ' + (get('#cf-business') || 'Not given'),
        'Email: ' + get('#cf-email'),
        'Team size: ' + (get('#cf-size') || 'Not given'),
        'Interested in: ' + get('#cf-interest'),
        '',
        get('#cf-message')
      ].join('\n');

      var msg = document.createElement('div');
      msg.className = 'msg';
      if (isSet(CONFIG.CONTACT_EMAIL)) {
        var href = 'mailto:' + CONFIG.CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        msg.innerHTML = '<p><strong>Thanks! Your email app should open with your message ready.</strong> Just press send.</p>' +
          '<p>Nothing happened? <a href="' + href + '">Open it again</a> or email us at <a href="mailto:' + CONFIG.CONTACT_EMAIL + '">' + CONFIG.CONTACT_EMAIL + '</a>.</p>';
        status.appendChild(msg);
        window.location.href = href;
      } else {
        msg.className = 'msg error';
        msg.innerHTML = '<p><strong>Almost ready:</strong> the contact email for this site has not been set yet.</p>' +
          '<p>Site owner: set CONTACT_EMAIL at the top of js/main.js. Your message was not sent.</p>';
        status.appendChild(msg);
      }
    });
  }

  function init() {
    applyConfig();
    initHeader();
    initReveal();
    initQuiz();
    initROI();
    initFAQ();
    initContact();
    initPageTransitions();
    initRipple();
    initTilt();
    initHeroFX();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
/* --- K North Technologies live-traffic beacon ---
   Add this to every page of knorthtechnologies.ca (just before </body>,
   or in the shared footer / main.js). Reports an anonymous pageview + a
   heartbeat every 30 s while the tab is open, so the traffic dashboard
   can show who is on the site right now.
   No cookies, no personal data, no IP stored.
   Uses the SHARED collector (abundant-traffic) so there is no extra
   hosting cost — Knorth events are tagged site=knorth. */
(function(){
  var EP = "https://abundant-traffic.fly.dev/hit";
  var KEY = "258kL7yo5KeaBz4N5RHLxwcxFvlaNCY3";
  function payload(){
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch(e){}
    return JSON.stringify({
      key: KEY,
      site: "knorth",
      page: location.pathname,
      referrer: document.referrer || "",
      ua: navigator.userAgent || "",
      screen: (screen.width || 0) + "x" + (screen.height || 0),
      tz: tz
    });
  }
  function send(){
    try {
      if (navigator.sendBeacon) { navigator.sendBeacon(EP, payload()); return; }
    } catch(e){}
    try {
      fetch(EP, {method:"POST", headers:{"Content-Type":"application/json"}, body: payload(), keepalive:true}).catch(function(){});
    } catch(e){}
  }
  send();
  setInterval(function(){ if (!document.hidden) send(); }, 30000);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) send(); });
})();
