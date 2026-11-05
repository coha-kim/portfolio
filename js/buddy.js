/* ── Landing bunny ─────────────────────────────────────────────────────────
   Click (or Enter/Space) and it wakes up and hands over a note, taking turns
   between the messages. After the first wall hit it looks unimpressed until
   Reset. Kept apart from landing.js, which stops early for reduced motion;
   the bunny works either way and only its animation is removed in CSS.      */

(function () {
  'use strict';

  var buddy = document.querySelector('[data-buddy]');
  if (!buddy) return;

  var face = buddy.querySelector('[data-buddy-face]');
  var arm = buddy.querySelector('[data-buddy-arm]');
  var gift = buddy.querySelector('[data-buddy-gift]');
  var said = document.querySelector('[data-buddy-said]');
  var arena = document.getElementById('arena');

  var FACES = {
    rest:  { eyes: '-.-', arm: false },
    awake: { eyes: '•.•', arm: true },
    flat:  { eyes: '-_-', arm: true }
  };
  var NOTES = ['hi', 'coffee?'];
  var SHOW_MS = 2400;

  var next = 0, timer = 0;

  function show(f) {
    face.textContent = f.eyes;
    arm.hidden = !f.arm;
  }

  function settle() {
    show(arena.classList.contains('is-hit') ? FACES.flat : FACES.rest);
  }

  function clear() {
    gift.textContent = '';
    gift.classList.remove('is-out');
    timer = 0;
    settle();
  }

  buddy.addEventListener('click', function () {
    var note = NOTES[next];
    next = (next + 1) % NOTES.length;

    clearTimeout(timer);
    clear();
    show(FACES.awake);
    void gift.offsetWidth; // restart the animation on quick repeat clicks
    gift.textContent = '[' + note + ']';
    gift.classList.add('is-out');
    said.textContent = note;
    timer = setTimeout(clear, SHOW_MS);
  });

  // The slingshot flags the wall hit and Reset on the arena
  new MutationObserver(function () { if (!timer) settle(); })
    .observe(arena, { attributes: true, attributeFilter: ['class'] });
})();
