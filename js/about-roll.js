/* ── About: practice label, ASCII scramble ────────────────────────────────
   [CREATIVE CODING] → [PHYSICAL-DIGITAL EXPERIENCE] → … Each change flickers
   through random ASCII characters, then the new word resolves letter by
   letter, mostly left to right. The window eases to the new word's width so
   the closing bracket lands once rather than jittering with each glyph.
   Pauses while hovered or while the tab is hidden. Reduced motion: stays on
   the first word. Screen readers get the full list from the visually-hidden
   sentence next to it.                                                     */

(function () {
  'use strict';

  var roll = document.querySelector('[data-roll]');
  if (!roll) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var WORDS = ['Creative coding', 'Physical-digital experience', 'Playful tech', 'User research'];
  var GLYPHS = '#%&@$*+=<>/\\|{}[]?!~^_-:;0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var FRAME_MS = 40;   // one glyph swap per frame: a stepped, terminal feel
  var HOLD_MS = 2400;  // how long a resolved word stays

  var win = roll.querySelector('.about-roll__win');
  var word = win.querySelector('.about-roll__word');
  var i = 0;
  var hovered = false;

  roll.addEventListener('pointerenter', function () { hovered = true; });
  roll.addEventListener('pointerleave', function () { hovered = false; });

  function glyph() { return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)); }

  // Width of a word in the label's font, without showing it
  var probe = document.createElement('span');
  probe.className = 'about-roll__probe';
  roll.appendChild(probe);
  function widthOf(text) { probe.textContent = text; return probe.getBoundingClientRect().width; }

  function scramble(from, to, done) {
    var len = Math.max(from.length, to.length);
    var plan = [];
    for (var k = 0; k < len; k++) {
      var start = Math.floor(Math.random() * 6);
      // Mostly left to right, with a little randomness per letter
      var end = start + 6 + Math.floor(k * 0.6) + Math.floor(Math.random() * 8);
      plan.push({ from: from.charAt(k), to: to.charAt(k), start: start, end: end, g: glyph() });
    }

    win.style.width = widthOf(to) + 'px';

    var frame = 0;
    var last = 0;
    function step(t) {
      if (t - last < FRAME_MS) { requestAnimationFrame(step); return; }
      last = t;
      var out = '';
      var settled = 0;
      for (var k = 0; k < plan.length; k++) {
        var p = plan[k];
        if (frame >= p.end) { out += p.to; settled++; }
        else if (frame >= p.start) {
          if (Math.random() < 0.4) p.g = glyph();
          out += p.g;
        } else out += p.from;
      }
      word.textContent = out;
      frame++;
      if (settled < plan.length) requestAnimationFrame(step);
      else { word.textContent = to; done(); }
    }
    requestAnimationFrame(step);
  }

  function next() {
    if (hovered || document.hidden) { setTimeout(next, 400); return; }
    var from = WORDS[i];
    i = (i + 1) % WORDS.length;
    scramble(from, WORDS[i], function () { setTimeout(next, HOLD_MS); });
  }

  // Resolve the first word on arrival too, then start the cycle. Widths are
  // measured, so wait for Supply Sans first.
  function begin() { scramble('', WORDS[0], function () { setTimeout(next, HOLD_MS); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(begin);
  else begin();
})();
