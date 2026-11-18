/* Rarqio site – invitation pages (salon/ in French, room/ in English).
   The link a player shares is …/salon/?c=K7P2QX. On an iPhone that has the app, the
   link opens the room directly and this page is never seen. Otherwise this page shows
   the code, hands it to the app (rarqio://salon?c=…) and copies it on request.
   Loaded synchronously from <head> so the right block shows at first paint.
   No network request, no storage. */
(function () {
  'use strict';

  // The app's alphabet (RoomCode.swift): no 0/O and no 1/I.
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var root = document.documentElement;
  var code = '';

  try { code = new URLSearchParams(window.location.search).get('c') || ''; } catch (e) { /* old browser */ }
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

  var valid = code.length === 6;
  for (var i = 0; valid && i < code.length; i++) {
    valid = ALPHABET.indexOf(code.charAt(i)) >= 0;
  }
  root.setAttribute('data-room', valid ? 'code' : 'none');
  if (!valid) { return; }

  // The old synchronous way first: it runs inside the tap, where every browser allows it.
  // The clipboard API is the fallback (some in-app browsers refuse one or the other).
  function copy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.className = 'copy-buffer';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    var done = false;
    try { done = document.execCommand('copy'); } catch (e) { /* refused */ }
    document.body.removeChild(field);
    if (done) { return Promise.resolve(); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tiles = document.getElementById('room-code');
    var open = document.getElementById('room-open');
    var button = document.getElementById('room-copy');

    if (tiles) {
      for (var i = 0; i < code.length; i++) {
        var tile = document.createElement('span');
        tile.textContent = code.charAt(i);
        tiles.appendChild(tile);
      }
      tiles.setAttribute('aria-label', 'Code ' + code.split('').join(' '));
    }
    if (open) { open.setAttribute('href', 'rarqio://salon?c=' + code); }
    if (button) {
      var timer = null;
      button.addEventListener('click', function () {
        copy(code).then(function () {
          button.classList.add('copied');
          window.clearTimeout(timer);
          timer = window.setTimeout(function () { button.classList.remove('copied'); }, 2500);
        }, function () { /* the code stays readable on the tiles */ });
      });
    }
  });
})();
