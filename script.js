/* Rarqio site – FR/EN toggle, the score calculator and the film player.
   The language is picked before first paint by lang.js; this file wires the
   buttons, remembers the choice, swaps a few attributes, runs the calculator
   in the #rarity section and plays the film in the language shown. No network
   requests other than the film once it is asked for, no storage other than
   the language choice. */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'rarqio-lang';
  var TITLES = {
    en: 'Rarqio – Least obvious wins',
    fr: 'Rarqio – Le moins évident gagne'
  };

  // Attributes that can't hold two <span lang> children get a data-fr-* twin.
  var swaps = [];
  ['aria-label', 'alt'].forEach(function (attr) {
    var nodes = document.querySelectorAll('[data-fr-' + attr + ']');
    for (var i = 0; i < nodes.length; i++) {
      swaps.push({
        el: nodes[i],
        attr: attr,
        en: nodes[i].getAttribute(attr),
        fr: nodes[i].getAttribute('data-fr-' + attr)
      });
    }
  });

  // ---------- Score calculator ----------
  // Same rule as the app (GameCore/AnswerMatcher.swift):
  // 10 × rarity × (1.15 − 0.20 × time elapsed / duration),
  // rarity clamped to 0–100, rounded, at most 1,150 (+15% at once, −5% at the deadline).
  var calc = (function () {
    var rarityInput = document.getElementById('calc-rarity');
    var timeInput = document.getElementById('calc-time');
    var rarityOut = document.getElementById('calc-rarity-out');
    var timeOut = document.getElementById('calc-time-out');
    var tierChip = document.getElementById('calc-tier');
    var pointsOut = document.getElementById('calc-points');
    if (!rarityInput || !timeInput || !rarityOut || !timeOut || !tierChip || !pointsOut) {
      return { render: function () {} };
    }

    var TIERS = [
      { min: 80, cls: 't-exceptional', en: 'Legendary', fr: 'Légendaire' },
      { min: 60, cls: 't-very', en: 'Very rare', fr: 'Très rare' },
      { min: 40, cls: 't-rare', en: 'Rare', fr: 'Rare' },
      { min: 20, cls: 't-unexpected', en: 'Unexpected', fr: 'Inattendue' },
      { min: -Infinity, cls: 't-classic', en: 'Classic', fr: 'Classique' }
    ];

    function points(rarity, elapsedShare) {
      var r = Math.min(100, Math.max(0, rarity));
      var e = Math.min(1, Math.max(0, elapsedShare));
      var quality = 10 * r;
      return Math.min(1150, Math.round(quality * (1 + (0.15 - (0.15 + 0.05) * e))));
    }

    function tierFor(rarity) {
      for (var i = 0; i < TIERS.length; i++) {
        if (rarity >= TIERS[i].min) return TIERS[i];
      }
      return TIERS[TIERS.length - 1];
    }

    function setText(el, text) {
      el.textContent = text;
    }

    function render() {
      var lang = root.getAttribute('data-lang') === 'fr' ? 'fr' : 'en';
      var rarity = parseInt(rarityInput.value, 10) || 0;
      var time = parseInt(timeInput.value, 10) || 0;
      var tier = tierFor(rarity);
      var pts = points(rarity, time / 100);

      setText(rarityOut, String(rarity));
      setText(timeOut, lang === 'fr' ? time + ' %' : time + '%');
      timeInput.setAttribute('aria-valuetext', lang === 'fr' ? time + ' pour cent' : time + ' percent');

      tierChip.className = 'chip ' + tier.cls;
      tierChip.textContent = '';
      var label = document.createElement('span');
      label.textContent = tier[lang];
      tierChip.appendChild(label);

      // 1,000 in English, 1 000 (narrow no-break space) in French.
      var formatted = String(pts);
      if (pts >= 1000) {
        var sep = lang === 'fr' ? ' ' : ',';
        formatted = formatted.slice(0, -3) + sep + formatted.slice(-3);
      }
      setText(pointsOut, formatted);
    }

    rarityInput.addEventListener('input', render);
    timeInput.addEventListener('input', render);
    return { render: render };
  })();

  // ---------- The film ----------
  // Never autoplayed, and nothing is fetched before the click: the video has no
  // source until then. The orientation is read at the click, so a phone turned
  // upright before pressing play gets the upright cut.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var film = (function () {
    var frame = document.getElementById('film-frame');
    var video = document.getElementById('film-video');
    var cover = document.getElementById('film-cover');
    var button = document.getElementById('film-play');
    if (!frame || !video || !cover || !button) {
      return { start: function () {}, setLanguage: function () {}, frame: null };
    }
    var portrait = window.matchMedia('(orientation: portrait)');
    var filmLang = 'en';
    var loaded = null;

    function setState(state) {
      frame.setAttribute('data-state', state);
      var playing = state === 'playing';
      video.controls = playing;
      video.tabIndex = playing ? 0 : -1;
      video.setAttribute('aria-hidden', String(!playing));
      cover.inert = playing;
      button.tabIndex = playing ? -1 : 0;
    }

    function dropTracks() {
      var tracks = video.querySelectorAll('track');
      for (var i = 0; i < tracks.length; i++) tracks[i].remove();
    }

    function start() {
      var key = filmLang + '-' + (portrait.matches ? 'portrait' : 'landscape');
      if (loaded !== key) {
        loaded = key;
        dropTracks();
        video.src = 'films/' + key + '.mp4';
        var track = document.createElement('track');
        track.kind = 'captions';
        track.src = 'films/' + filmLang + '.vtt';
        track.srclang = filmLang;
        track.label = filmLang === 'fr' ? 'Français' : 'English';
        video.appendChild(track);
      } else if (video.ended) {
        video.currentTime = 0;
      }
      setState('playing');
      // Called inside the click, which is what lets it play with sound.
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () { setState('idle'); });
      requestAnimationFrame(function () { video.focus({ preventScroll: true }); });
    }

    video.addEventListener('ended', function () { setState('ended'); });
    video.addEventListener('play', function () {
      if (frame.getAttribute('data-state') !== 'playing') setState('playing');
    });
    button.addEventListener('click', start);

    return {
      frame: frame,
      start: start,
      setLanguage: function (lang) {
        var next = lang === 'fr' ? 'fr' : 'en';
        if (next === filmLang) return;
        filmLang = next;
        if (loaded) {
          // A film in the other language was loaded: drop it, back to the poster.
          video.pause();
          video.removeAttribute('src');
          dropTracks();
          video.load();
          loaded = null;
          setState('idle');
        }
      }
    };
  })();

  // "Watch the film" in the hero: start it, then bring it into view.
  var playLinks = document.querySelectorAll('[data-play-film]');
  for (var p = 0; p < playLinks.length; p++) {
    playLinks[p].addEventListener('click', function (event) {
      if (!film.frame) return;
      event.preventDefault();
      film.start();
      film.frame.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });
  }

  // ---------- Language ----------
  var buttons = document.querySelectorAll('[data-set-lang]');

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    document.title = TITLES[lang];
    swaps.forEach(function (s) {
      s.el.setAttribute(s.attr, s[lang]);
    });
    film.setLanguage(lang);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-set-lang') === lang));
    }
    calc.render();
  }

  // If the page was opened with ?lang=, keep the address in step with the choice
  // so a reload or a shared link shows what the reader picked.
  function syncUrl(lang) {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has('lang')) return;
      url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url.toString());
    } catch (e) { /* old browser: leave the address alone */ }
  }

  for (var b = 0; b < buttons.length; b++) {
    buttons[b].addEventListener('click', function () {
      var lang = this.getAttribute('data-set-lang') === 'fr' ? 'fr' : 'en';
      try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked: ignore */ }
      syncUrl(lang);
      apply(lang);
    });
  }

  apply(root.getAttribute('data-lang') === 'fr' ? 'fr' : 'en');

  // Turn on smooth scrolling only once the page (and any #anchor jump) has settled.
  function enableSmoothScroll() {
    setTimeout(function () { root.classList.add('smooth-scroll'); }, 0);
  }
  if (document.readyState === 'complete') {
    enableSmoothScroll();
  } else {
    window.addEventListener('load', enableSmoothScroll);
  }
})();
