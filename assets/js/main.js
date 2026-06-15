/* =====================================================================
   Hannemanns Eck — Interaktivität
   Sticky-Nav · Scroll-Reveal · Parallax · Lightbox · Menü-Filter · Formulare
   Scroll-Fortschritt · Ripple · Zurück-nach-oben · Reservierungs-Popup
   Vanilla JS, keine Abhängigkeiten → schnelle Ladezeiten, offline lauffähig.
   ===================================================================== */
(function () {
  'use strict';
  document.documentElement.className += ' js';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =================================================================
     FORMSPREE-ANBINDUNG (E-Mail-Empfang der Formulare)
     -----------------------------------------------------------------
     1. Kostenloses Konto auf https://formspree.io anlegen.
     2. Neues Formular erstellen -> du erhältst eine Endpoint-URL der
        Form: https://formspree.io/f/ABCD1234
     3. Diese URL unten bei FORMSPREE_ENDPOINT eintragen. Fertig.
     Solange hier 'YOUR_FORM_ID' steht, läuft die Seite im Demo-Modus:
     Die Bestätigung wird angezeigt, aber es wird nichts versendet.
     ================================================================= */
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdavydow';

  function isFormspreeConfigured() {
    return /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(FORMSPREE_ENDPOINT) &&
      FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') === -1;
  }

  /* Sendet ein Formular an Formspree.
     box = Statusfeld, successHtml = optionaler Bestätigungstext,
     onSuccess = optionaler Callback (z. B. Popup) statt Statusfeld. */
  function submitForm(form, data, box, successHtml, dateInput, onSuccess) {
    if (box && box.getAttribute('data-orig') === null) {
      box.setAttribute('data-orig', box.innerHTML);
    }
    function resetForm() {
      form.reset();
      if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
    }
    function showSuccess() {
      if (onSuccess) { onSuccess(); return; }
      if (!box) return;
      if (successHtml) box.innerHTML = successHtml;
      else if (box.getAttribute('data-orig')) box.innerHTML = box.getAttribute('data-orig');
      box.classList.remove('error');
      box.classList.add('show');
      box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    function showError() {
      if (!box) { window.alert('Das hat leider nicht geklappt. Bitte rufen Sie uns an: +49 7824 659916.'); return; }
      box.innerHTML = '<strong>Das hat leider nicht geklappt.</strong> Bitte versuchen Sie es erneut oder rufen Sie uns an: <a href="tel:+497824659916">+49 7824 659916</a>.';
      box.classList.add('error');
      box.classList.add('show');
    }
    if (!isFormspreeConfigured()) { showSuccess(); resetForm(); return; }
    var btn = form.querySelector('[type="submit"]');
    var label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Senden …'; }
    fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function (res) { if (res.ok) { showSuccess(); resetForm(); } else { showError(); } })
      .catch(function () { showError(); })
      .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } });
  }

  /* ---------- Jahr im Footer ---------- */
  function setYear() {
    var els = document.querySelectorAll('[data-year]');
    var y = new Date().getFullYear();
    els.forEach(function (el) { el.textContent = y; });
  }

  /* ---------- Sticky-Navigation ---------- */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var toggle = nav.querySelector('.nav__toggle');
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('.nav__links a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---------- Scroll-Fortschrittsbalken ---------- */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Zurück-nach-oben-Button ---------- */
  function initToTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Nach oben scrollen');
    btn.innerHTML = '\u2191';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    var onScroll = function () {
      if (window.scrollY > 600) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Klick-Ripple auf Buttons ---------- */
  function initRipple() {
    if (reduceMotion) return;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 650);
    });
  }

  /* ---------- Scroll-Reveal (IntersectionObserver) ---------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); el.classList.add('reveal-done'); });
      return;
    }
    function markDone(el) { el.classList.add('reveal-done'); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);
        var finish = function (ev) {
          if (ev && ev.propertyName && ev.propertyName !== 'clip-path') return;
          el.removeEventListener('transitionend', finish);
          markDone(el);
        };
        el.addEventListener('transitionend', finish);
        setTimeout(function () { markDone(el); }, 2600);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Automatische, gestaffelte Reveals für Listen ---------- */
  function initAutoReveal() {
    if (reduceMotion) return;
    var groups = document.querySelectorAll('.menu-grid, .legend');
    groups.forEach(function (grid) {
      var kids = grid.children;
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].hasAttribute('data-reveal')) {
          kids[i].setAttribute('data-reveal', '');
          kids[i].setAttribute('data-reveal-delay', String((i % 6)));
        }
      }
    });
  }

  /* ---------- Rotierendes Wort (Hero) ---------- */
  function initRotator() {
    var els = document.querySelectorAll('.rotator');
    els.forEach(function (el) {
      var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean);
      if (words.length < 2) return;
      var i = 0;
      setInterval(function () {
        i = (i + 1) % words.length;
        if (reduceMotion) { el.textContent = words[i]; return; }
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(function () {
          el.textContent = words[i];
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, 240);
      }, 2200);
    });
  }

  /* ---------- Parallax (dezent, rAF-gedrosselt) ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      layers.forEach(function (layer) {
        var rect = layer.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var speed = parseFloat(layer.getAttribute('data-parallax')) || 0.15;
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        layer.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0) scale(1.12)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Animierte Zahlen (Stats) ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target % 1 === 0 ? Math.floor(eased * target) : (eased * target).toFixed(1);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        if (reduceMotion) { el.textContent = target + suffix; }
        else requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Menü-Filter ---------- */
  function initMenuFilter() {
    var bar = document.querySelector('.menu-filter');
    if (!bar) return;
    var cats = document.querySelectorAll('.menu-cat');
    bar.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        bar.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        cats.forEach(function (cat) {
          var show = (f === 'all' || cat.getAttribute('data-cat') === f);
          cat.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Lightbox-Galerie ---------- */
  function initLightbox() {
    var figures = Array.prototype.slice.call(document.querySelectorAll('.gallery figure'));
    var box = document.querySelector('.lightbox');
    if (!figures.length || !box) return;
    var imgEl = box.querySelector('img');
    var current = 0;
    var sources = figures.map(function (f) {
      var im = f.querySelector('img');
      return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' };
    });
    function show(i) {
      current = (i + sources.length) % sources.length;
      imgEl.setAttribute('src', sources[current].src);
      imgEl.setAttribute('alt', sources[current].alt);
    }
    function open(i) { show(i); box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
    function close() { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
    figures.forEach(function (f, i) {
      f.setAttribute('tabindex', '0');
      f.setAttribute('role', 'button');
      f.addEventListener('click', function () { open(i); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__nav.prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox__nav.next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Bestätigungs-Popup (Modal) ---------- */
  var TICK_SVG = '<div class="modal__icon"><svg viewBox="0 0 52 52" aria-hidden="true">' +
    '<circle class="ring" cx="26" cy="26" r="24"/><path class="tick" d="M16 27l7 7 14-15"/></svg></div>';

  function ensureModal() {
    var modal = document.getElementById('confirm-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="modal__card">' +
      '<button class="modal__close" aria-label="Schlie\u00dfen">\u00d7</button>' +
      TICK_SVG +
      '<h3>Vielen Dank!</h3>' +
      '<div class="modal__body"></div>' +
      '<div class="modal__actions"><button type="button" class="btn btn--primary" data-close>Alles klar</button></div>' +
      '</div>';
    document.body.appendChild(modal);
    function close() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
    modal.querySelector('.modal__close').addEventListener('click', close);
    modal.querySelector('[data-close]').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
    return modal;
  }

  function openModal(title, bodyHtml) {
    var modal = ensureModal();
    modal.querySelector('h3').innerHTML = title || 'Vielen Dank!';
    modal.querySelector('.modal__body').innerHTML = bodyHtml || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /* ---------- Reservierung: Min-Datum + Popup + Versand ---------- */
  function initReservation() {
    var form = document.getElementById('reservation-form');
    if (!form) return;
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    function showReservationDone(form, popupHtml, summaryHtml) {
      // 1) Bestätigung als Popup einblenden
      openModal('Reservierung eingegangen', popupHtml);
      // 2) Formular ausblenden → keine sofortige Doppel-Reservierung
      form.style.display = 'none';
      if (form.nextElementSibling && form.nextElementSibling.classList.contains('reservation-done')) {
        form.nextElementSibling.remove();
      }
      var done = document.createElement('div');
      done.className = 'reservation-done';
      done.innerHTML = TICK_SVG +
        '<h3>Reservierung eingegangen</h3>' +
        '<p>' + summaryHtml + '</p>' +
        '<div class="modal__actions">' +
        '<button type="button" class="btn btn--outline" data-new-reservation>Weitere Reservierung</button>' +
        '<a class="btn btn--primary" href="index.html">Zur Startseite</a></div>';
      form.insertAdjacentElement('afterend', done);
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      done.querySelector('[data-new-reservation]').addEventListener('click', function () {
        done.remove();
        form.reset();
        form.style.display = '';
        if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var name = String(data.get('name') || '');
      var guests = String(data.get('guests') || '');
      var time = String(data.get('time') || '19:00');
      var when = new Date(data.get('date') + 'T' + time);
      var fmt = when.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      var popupHtml = 'Ihre Reservierungsanfrage f\u00fcr <strong>' + escapeHtml(guests) + ' Personen</strong> am <strong>' +
        fmt + '</strong> um <strong>' + escapeHtml(time) + ' Uhr</strong> ist eingegangen.<br>' +
        'Wir best\u00e4tigen Ihren Tisch in K\u00fcrze telefonisch oder per E-Mail.';
      var summaryHtml = '<strong>' + escapeHtml(guests) + ' Personen</strong> \u00b7 ' + fmt + ' \u00b7 ' + escapeHtml(time) + ' Uhr';
      // Aussagekr\u00e4ftiger Betreff + Reply-To → bessere Zustellbarkeit, kein Spam
      data.append('_subject', 'Reservierung: ' + name + ' \u00b7 ' + guests + ' Pers. \u00b7 ' + fmt + ' ' + time + ' Uhr');
      var email = String(data.get('email') || '');
      if (email) data.append('_replyto', email);
      submitForm(form, data, null, null, dateInput, function () {
        showReservationDone(form, popupHtml, summaryHtml);
      });
    });
  }

  /* ---------- Generische Formulare (Kontakt / Newsletter) ---------- */
  function initSimpleForms() {
    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var box = document.getElementById(form.getAttribute('data-confirm'));
        var data = new FormData(form);
        var isNews = form.classList.contains('newsletter');
        data.append('_subject', isNews ? 'Newsletter-Anmeldung – Hannemanns Eck' : 'Neue Nachricht über die Website – Hannemanns Eck');
        var email = String(data.get('email') || '');
        if (email) data.append('_replyto', email);
        submitForm(form, data, box, null, null);
      });
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setYear();
    initNav();
    initScrollProgress();
    initToTop();
    initRipple();
    initAutoReveal();
    initReveal();
    initRotator();
    initParallax();
    initCounters();
    initMenuFilter();
    initLightbox();
    initReservation();
    initSimpleForms();
  });
})();
