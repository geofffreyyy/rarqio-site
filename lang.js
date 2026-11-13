/* Rarqio site – picks the page language before first paint.
   Order: ?lang= in the URL, then the saved choice, then the browser language.
   Loaded synchronously from <head> as a file (not inline) so the
   Content Security Policy can forbid inline scripts. */
(function () {
  'use strict';

  var root = document.documentElement;
  var lang = null;

  root.classList.add('js');

  try { lang = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* old browser */ }
  if (lang !== 'en' && lang !== 'fr') {
    try { lang = window.localStorage.getItem('rarqio-lang'); } catch (e) { /* storage blocked */ }
  }
  if (lang !== 'en' && lang !== 'fr') {
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    lang = nav.indexOf('fr') === 0 ? 'fr' : 'en';
  }

  root.setAttribute('data-lang', lang);
  root.lang = lang;
})();
