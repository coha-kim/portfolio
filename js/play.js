/* ── Play gallery (DESIGN.md §6.4) ─────────────────────────────────────────
   Mouse/keyboard: hover or focus an item to play it (muted). Clicking an item
   brings it into focus and blurs everything else; click it again, click
   outside or press Escape to clear. Touch: the item nearest the middle of the
   screen plays; tap toggles. Reduced motion: posters only.
   Sound: clips marked data-sound stay muted until clicked/tapped; a click
   turns their sound on (and plays), another click mutes again. Leaving the
   clip or scrolling it away mutes it. */

(function () {
  'use strict';

  var grid = document.querySelector('.play-grid');
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll('.play-item'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function video(item) { return item.querySelector('video'); }

  function play(item, withSound) {
    var v = video(item);
    if (!v || (reduced && !withSound)) return;   // a click still plays under reduced motion
    v.muted = !withSound; v.loop = true; v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
  }

  function pause(item) {
    var v = video(item);
    if (v) { v.pause(); v.muted = true; }
  }

  // Click/tap on a clip with sound: sound on (playing) ⇄ muted
  function toggleSound(item) {
    var v = video(item);
    if (!v || !v.hasAttribute('data-sound')) return false;
    if (v.muted || v.paused) play(item, true); else v.muted = true;
    return true;
  }

  if (canHover) {
    // Hover/keyboard focus: the clip plays, muted, nothing else changes.
    // Click: that item comes into focus and everything else blurs (clips with
    // sound also turn their sound on). Click it again, click outside the
    // gallery or press Escape to clear.
    var active = null;

    function setActive(item) {
      active = item;
      items.forEach(function (i) {
        i.classList.toggle('is-focus', i === item);
        if (i !== item) pause(i);
      });
      grid.classList.toggle('has-focus', !!item);
    }
    function clear() {
      if (active) pause(active);
      setActive(null);
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.play-media');
      function preview() { if (item !== active) play(item); }
      function unpreview() { if (item !== active) pause(item); }
      btn.addEventListener('pointerenter', preview);
      btn.addEventListener('pointerleave', unpreview);
      btn.addEventListener('focus', preview);
      btn.addEventListener('blur', unpreview);
      btn.addEventListener('click', function () {
        if (item === active) { clear(); return; }
        setActive(item);
        var v = video(item);
        if (v && v.hasAttribute('data-sound')) play(item, true); else play(item);
      });
    });
    document.addEventListener('click', function (e) {
      if (active && !grid.contains(e.target)) clear();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && active) clear();
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
      if (toggleSound(item)) return;
      if (v.paused) play(item); else pause(item);
    });
  });
})();
