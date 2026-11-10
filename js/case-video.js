/* ── Case-study videos ─────────────────────────────────────────────────────
   Videos marked data-inview play (muted, looping) only while at least 40% of
   them is on screen, and pause when they scroll away, so a long page never
   runs every clip at once. preload="none" in the markup keeps them from
   downloading until they're near. Reduced motion: no autoplay; each video
   gets controls instead so it can still be played on purpose.             */

(function () {
  'use strict';

  var videos = document.querySelectorAll('video[data-inview]');
  if (!videos.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    videos.forEach(function (v) { v.controls = true; v.preload = 'metadata'; });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        v.muted = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.4 });

  videos.forEach(function (v) { io.observe(v); });
})();
