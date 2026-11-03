/* ── Play gallery (DESIGN.md §6.4) ─────────────────────────────────────────
   Mouse/keyboard: hover or focus an item to play it; everything else blurs.
   The blur only clears when the pointer leaves the whole gallery, so moving
   across the gaps doesn't flicker. Touch: the item nearest the middle of the
   screen plays; tap toggles. Reduced motion: posters only. */

(function () {
  'use strict';

  var grid = document.querySelector('.play-grid');
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll('.play-item'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function video(item) { return item.querySelector('video'); }

  function play(item) {
    var v = video(item);
    if (!v || reduced) return;
    v.muted = true; v.loop = true; v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function pause(item) {
    var v = video(item);
    if (v) v.pause();
  }

  if (canHover) {
    function focusItem(item) {
      items.forEach(function (i) {
        i.classList.toggle('is-focus', i === item);
        if (i !== item) pause(i);
      });
      grid.classList.add('has-focus');
      play(item);
    }
    function clear() {
      grid.classList.remove('has-focus');
      items.forEach(function (i) { i.classList.remove('is-focus'); pause(i); });
    }
    items.forEach(function (item) {
      var btn = item.querySelector('.play-media');
      btn.addEventListener('pointerenter', function () { focusItem(item); });
      btn.addEventListener('focus', function () { focusItem(item); });
    });
    grid.addEventListener('pointerleave', clear);
    grid.addEventListener('focusout', function (e) {
      if (!grid.contains(e.relatedTarget)) clear();
    });
    return;
  }

  // Touch: no blur. Play whatever sits in the middle band of the screen.
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var item = e.target;
        if (e.isIntersecting) play(item); else pause(item);
      });
    }, { rootMargin: '-35% 0px -35% 0px' });
    items.forEach(function (item) { if (video(item)) io.observe(item); });
  }
  items.forEach(function (item) {
    item.querySelector('.play-media').addEventListener('click', function () {
      var v = video(item);
      if (!v) return;
      if (v.paused) play(item); else pause(item);
    });
  });
})();
