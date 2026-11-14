/* Rarqio site – FR/EN toggle and the score calculator.
   The language is picked before first paint by lang.js; this file wires the
   buttons, remembers the choice, swaps a few attributes and runs the
   calculator in the #rarity section. No network requests, no storage other
   than the language choice. */
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
      { min: 80, cls: 't-exceptional', en: 'Exceptional', fr: 'Singulière' },
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

  // ---------- Language ----------
  var buttons = document.querySelectorAll('[data-set-lang]');

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    document.title = TITLES[lang];
    swaps.forEach(function (s) {
      s.el.setAttribute(s.attr, s[lang]);
    });
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
