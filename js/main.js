/* Haim Al Galgalim, anniversary page. No libraries. Everything degrades to plain links without JS. */
(function () {
  'use strict';
  var DAY = Date.UTC(2026, 11, 2);        // 2.12.2026, the anniversary
  var FIRST = Date.UTC(2025, 11, 2);      // 2.12.2025, first song
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Today's date in Israel. ?today=YYYY-MM-DD overrides it, for previewing the 2.12 state.
  function todayIL() {
    var q = /[?&]today=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (q) return Date.UTC(+q[1], +q[2] - 1, +q[3]);
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day);
  }

  var today = todayIL();
  var left = Math.round((DAY - today) / 864e5);
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };

  function daysPhrase(n) {
    if (n === 1) return 'עוד יום אחד';
    if (n === 2) return 'עוד יומיים';
    return 'עוד ' + n + ' ימים';
  }

  var dial = $('[data-dial]');
  if (left <= 0) {
    root.classList.add('is-day');
    var s = $('[data-cd="strip"]'); if (s) s.textContent = 'היום חוגגים שנה לחיים על גלגלים';
    var sl = $('.strip a'); if (sl) { sl.textContent = 'לחגוג איתנו ולהאזין'; sl.href = 'https://chaimalgalgalim.lnk.to/profile'; }
    $('[data-cd="num"]').textContent = '1';
    $('[data-cd="unit"]').textContent = 'שנה';
    dial.style.setProperty('--target', '360deg');
    var dl = $('.dial__light'); if (dl && dl.dataset.daySrc) { dl.removeAttribute('srcset'); dl.src = dl.dataset.daySrc; }
  } else {
    var line = daysPhrase(left) + ' לשנה לחיים על גלגלים';
    $('[data-cd="strip"]').textContent = line;
    $('[data-cd="title"]').textContent = line;
    $('[data-cd="num"]').textContent = left === 1 ? '1' : String(left);
    $('[data-cd="unit"]').textContent = left === 1 ? 'יום' : 'ימים';
    // The ring is drawn as far as the year has gone. The gap that is left is the days still to go.
    var done = Math.min(1, Math.max(0, (today - FIRST) / (DAY - FIRST)));
    dial.style.setProperty('--target', (done * 360).toFixed(1) + 'deg');
  }

  // Reveal on scroll + dial fill + "full ring" flash on the day
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target === dial && left <= 0) setTimeout(function () { dial.classList.add('is-full'); }, reduce ? 0 : 1400);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  document.querySelectorAll('.reveal, [data-dial]').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('is-in');
  });

  // Reminder. Apple devices get the .ics file, everyone else Google Calendar.
  var remind = $('[data-remind]');
  if (remind && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    remind.href = 'haim-al-galgalim-2-12.ics';
    remind.removeAttribute('target');
    remind.setAttribute('download', 'haim-al-galgalim-2-12.ics');
  }

  // Share. Native share sheet when available, WhatsApp link otherwise (the href).
  document.querySelectorAll('[data-share]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!navigator.share) {
        a.href = 'https://wa.me/?text=' + encodeURIComponent('שנה לחיים על גלגלים. ' + location.href.split('#')[0]);
        return;
      }
      e.preventDefault();
      navigator.share({
        title: 'שנה לחיים על גלגלים',
        text: 'שנה, שמונה שירים, שמונה קולות. להאזנה לאלבום המלא.',
        url: location.href.split('#')[0]
      }).catch(function () {});
    });
  });

  // Mobile dock. Shows once the hero buttons scroll away, hides when the closing buttons are on screen.
  var dock = $('[data-dock]');
  var seen = { 'hero-cta': true, 'finale-cta': false };
  if (dock && io) {
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[e.target.getAttribute('data-watch')] = e.isIntersecting; });
      dock.classList.toggle('is-on', !seen['hero-cta'] && !seen['finale-cta']);
    });
    document.querySelectorAll('[data-watch]').forEach(function (el) { dio.observe(el); });
  }

  // Hero video (Runway loop). Starts only after the page has loaded, so it never competes with the first paint.
  var hv = $('.hero__video');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (hv && !reduce && !saveData) {
    window.addEventListener('load', function () {
      var src = [].filter.call(hv.querySelectorAll('source[data-src]'), function (s) {
        return !s.dataset.media || window.matchMedia(s.dataset.media).matches;
      })[0];
      if (!src) return;
      var tall = window.matchMedia('(max-width: 59.99rem)').matches;
      hv.poster = hv.getAttribute(tall ? 'data-poster-tall' : 'data-poster-wide');
      src.src = src.dataset.src;
      hv.muted = true;
      hv.load();
      hv.addEventListener('playing', function () { hv.hidden = false; }, { once: true });
      var p = hv.play(); if (p && p.catch) p.catch(function () {});
    });
  }

  // Trailer facade, the YouTube iframe loads only after a click.
  document.querySelectorAll('.lite[data-yt]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + el.dataset.yt + '?autoplay=1&rel=0&playsinline=1';
      f.title = el.dataset.title;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      var box = document.createElement('div');
      box.className = 'lite is-playing';
      box.appendChild(f);
      el.replaceWith(box);
      f.focus();
    });
  });
})();
