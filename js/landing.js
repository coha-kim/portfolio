/* ── Landing slingshot (DESIGN.md §6.2) ────────────────────────────────────
   Pull SEOHA KIM in any direction and let go. A stretched spring stores
   ½kx² of energy, which becomes ½mv² of kinetic energy on release, so the
   launch speed grows linearly with the pull (v = x·√(k/m)) and the energy
   with its square. Zero gravity, bouncy walls, letters collide with each
   other. The first wall hit turns the arena blue. */

(function () {
  'use strict';

  var arena = document.getElementById('arena');
  if (!arena) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static name stays

  var layer    = arena.querySelector('.sling-letters');
  var lead     = arena.querySelector('.sling-lead');
  var proj     = arena.querySelector('.sling-proj');
  var dot      = arena.querySelector('.sling-dot');
  var energyEl = arena.querySelector('.sling-energy');
  var launchBtn = arena.querySelector('[data-launch]');
  var resetBtn  = arena.querySelector('[data-reset]');

  var TEXT = 'SEOHA KIM';
  var RESTITUTION = 0.86;   // energy kept per bounce
  var AIR = 0.992;          // air drag per step
  var SPIN_DAMP = 0.985;
  var SPEED_PER_PX = 0.15;  // launch speed (px/step) per px of pull: the spring constant
  var MAX_PULL = 0.3;       // visual pull cap, fraction of arena width
  var EASE = 0.14;          // how quickly the pull stiffens (tanh)
  var STEP = 1000 / 60;     // fixed physics step

  var W = 0, H = 0, fs = 64;
  var letters = [];         // { el, w, x, y, vx, vy, a, va }
  var home = [];
  var mode = 'rest';        // rest | drag | free
  var pull = { x: 0, y: 0 };
  var grab = null;
  var raf = 0, last = 0, acc = 0;
  var hit = false, launched = false;

  function size() {
    W = arena.clientWidth;
    H = arena.clientHeight;
    fs = parseFloat(getComputedStyle(layer.querySelector('.sling-letter') || layer).fontSize) || 64;
  }

  function build() {
    layer.innerHTML = '';
    letters = [];
    var spaceW = 0;
    TEXT.split('').forEach(function (ch) {
      if (ch === ' ') { letters.push(null); return; }
      var el = document.createElement('span');
      el.className = 'sling-letter';
      el.textContent = ch;
      layer.appendChild(el);
      letters.push({ el: el });
    });
    size();
    spaceW = fs * 0.28;
    letters.forEach(function (l) { if (l) l.w = l.el.getBoundingClientRect().width; });
    layoutHome(spaceW);
    letters = letters.filter(Boolean);
    letters.forEach(function (l, i) {
      l.x = home[i].x; l.y = home[i].y; l.vx = 0; l.vy = 0; l.a = 0; l.va = 0;
    });
    render();
  }

  function layoutHome(spaceW) {
    var src = letters;
    var total = 0;
    src.forEach(function (l) { total += l ? l.w : spaceW; });
    var x = (W - total) / 2;
    home = [];
    src.forEach(function (l) {
      if (!l) { x += spaceW; return; }
      home.push({ x: x + l.w / 2, y: H / 2 });
      x += l.w;
    });
  }

  function relayoutHome() {
    // Recentre the name on resize while it's still at rest
    var spaceW = fs * 0.28, total = spaceW, x;
    letters.forEach(function (l) { total += l.w; });
    x = (W - total) / 2;
    home = letters.map(function (l, i) {
      if (i === 5) x += spaceW; // gap between SEOHA and KIM
      var h = { x: x + l.w / 2, y: H / 2 };
      x += l.w;
      return h;
    });
  }

  function render() {
    letters.forEach(function (l) {
      l.el.style.transform =
        'translate(' + (l.x - l.w / 2).toFixed(1) + 'px,' + (l.y - fs / 2).toFixed(1) + 'px) rotate(' + l.a.toFixed(3) + 'rad)';
    });

    var d = Math.hypot(pull.x, pull.y);
    if (mode === 'drag' && d > 4) {
      var c = grab.c, ang = Math.atan2(pull.y, pull.x) * 180 / Math.PI;
      var t = Math.min(1, d / (W * MAX_PULL));
      lead.style.cssText = 'opacity:' + (0.3 + t * 0.6) + ';width:' + d + 'px;transform:translate(' + c.x + 'px,' + c.y + 'px) rotate(' + ang + 'deg)';
      proj.style.cssText = 'opacity:' + (0.15 + t * 0.4) + ';width:' + (d * 1.8) + 'px;transform:translate(' + c.x + 'px,' + c.y + 'px) rotate(' + (ang + 180) + 'deg)';
      dot.style.cssText = 'opacity:' + (0.3 + t * 0.6) + ';transform:translate(' + c.x + 'px,' + c.y + 'px)';
      energyEl.style.cssText = 'opacity:.7;transform:translate(' + (c.x + 12) + 'px,' + (c.y + 10) + 'px)';
      energyEl.textContent = 'Energy ' + Math.round(t * t * 100) + '%';
    } else {
      lead.style.opacity = proj.style.opacity = dot.style.opacity = energyEl.style.opacity = 0;
    }
  }

  function point(e) {
    var r = arena.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function near(p) {
    var pad = 56, hh = fs * 0.4;
    return letters.some(function (l) {
      return Math.abs(p.x - l.x) < l.w / 2 + pad && Math.abs(p.y - l.y) < hh + pad;
    });
  }

  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  // ── Drag ─────────────────────────────────────────────────────────────
  arena.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || (e.target.closest && e.target.closest('button'))) return;
    var p = point(e);
    if (!near(p)) return;
    try { arena.setPointerCapture(e.pointerId); } catch (err) {}
    stop();
    var cx = 0, cy = 0;
    var rest = letters.map(function (l) {
      l.vx = l.vy = l.va = 0; cx += l.x; cy += l.y;
      return { x: l.x, y: l.y };
    });
    grab = { start: p, rest: rest, c: { x: cx / letters.length, y: cy / letters.length } };
    mode = 'drag';
    pull = { x: 0, y: 0 };
    arena.classList.add('is-dragging');
    e.preventDefault();
  });

  arena.addEventListener('pointermove', function (e) {
    if (mode !== 'drag') return;
    var p = point(e);
    var dx = p.x - grab.start.x, dy = p.y - grab.start.y, d = Math.hypot(dx, dy);
    var v = d ? W * MAX_PULL * Math.tanh(d / (W * EASE)) : 0;
    var k = d ? v / d : 0;
    pull = { x: dx * k, y: dy * k };
    letters.forEach(function (l, i) { l.x = grab.rest[i].x + pull.x; l.y = grab.rest[i].y + pull.y; });
    render();
  });

  function release() {
    if (mode !== 'drag') return;
    arena.classList.remove('is-dragging');
    var d = Math.hypot(pull.x, pull.y);
    if (d < 4) {
      letters.forEach(function (l, i) { l.x = grab.rest[i].x; l.y = grab.rest[i].y; });
      mode = 'rest'; pull = { x: 0, y: 0 }; render();
      return;
    }
    fire(-pull.x / d, -pull.y / d, d);
  }
  arena.addEventListener('pointerup', release);
  arena.addEventListener('pointercancel', release);

  // ── Launch ───────────────────────────────────────────────────────────
  function fire(ux, uy, d) {
    var speed = d * SPEED_PER_PX; // v ∝ x  (½kx² = ½mv²)
    letters.forEach(function (l) {
      var ang = (Math.random() - 0.5) * 0.5, sv = 1 + (Math.random() - 0.5) * 0.28;
      var c = Math.cos(ang), s = Math.sin(ang);
      l.vx = (ux * c - uy * s) * speed * sv;
      l.vy = (ux * s + uy * c) * speed * sv;
      l.va = (Math.random() - 0.5) * 0.3;
    });
    mode = 'free';
    pull = { x: 0, y: 0 };
    if (!launched) {
      launched = true;
      arena.classList.add('is-launched');
      resetBtn.hidden = false;
    }
    stop();
    last = 0; acc = 0;
    raf = requestAnimationFrame(frame);
  }

  function step() {
    var hh = fs * 0.4, moving = false, wallHit = false, i, j;
    for (i = 0; i < letters.length; i++) {
      var l = letters[i], hw = l.w / 2;
      l.vx *= AIR; l.vy *= AIR; l.va *= SPIN_DAMP;
      l.x += l.vx; l.y += l.vy; l.a += l.va;
      if (l.x < hw)          { l.x = hw;     l.vx =  Math.abs(l.vx) * RESTITUTION; l.va += l.vy * 0.003; wallHit = true; }
      else if (l.x > W - hw) { l.x = W - hw; l.vx = -Math.abs(l.vx) * RESTITUTION; l.va -= l.vy * 0.003; wallHit = true; }
      if (l.y < hh)          { l.y = hh;     l.vy =  Math.abs(l.vy) * RESTITUTION; l.va -= l.vx * 0.003; wallHit = true; }
      else if (l.y > H - hh) { l.y = H - hh; l.vy = -Math.abs(l.vy) * RESTITUTION; l.va += l.vx * 0.003; wallHit = true; }
    }
    // Letter–letter: equal-mass elastic push along the contact normal
    for (i = 0; i < letters.length; i++) {
      for (j = i + 1; j < letters.length; j++) {
        var a = letters[i], b = letters[j];
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = (a.w + b.w) / 2 * 0.9;
        if (d > 0 && d < m) {
          var nx = dx / d, ny = dy / d, o = (m - d) / 2;
          a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          var rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            var jj = -(1 + RESTITUTION) * rv / 2;
            a.vx -= jj * nx; a.vy -= jj * ny; b.vx += jj * nx; b.vy += jj * ny;
          }
        }
      }
    }
    for (i = 0; i < letters.length; i++) if (Math.abs(letters[i].vx) + Math.abs(letters[i].vy) > 0.06) moving = true;
    if (wallHit && !hit) {
      hit = true;
      arena.classList.add('is-hit');
    }
    return moving;
  }

  function frame(ts) {
    if (!last) last = ts;
    acc += Math.min(ts - last, 100);
    last = ts;
    var moving = true;
    while (acc >= STEP) { moving = step(); acc -= STEP; }
    render();
    if (moving) raf = requestAnimationFrame(frame);
    else {
      raf = 0; mode = 'rest';
    }
  }

  // ── Buttons ──────────────────────────────────────────────────────────
  launchBtn.addEventListener('click', function () {
    if (mode === 'drag') return;
    var a = Math.random() * Math.PI * 2;
    fire(Math.cos(a), Math.sin(a), W * 0.22);
  });

  resetBtn.addEventListener('click', function () {
    stop();
    letters.forEach(function (l, i) { l.x = home[i].x; l.y = home[i].y; l.vx = l.vy = l.a = l.va = 0; });
    mode = 'rest'; hit = false;
    arena.classList.remove('is-hit');
    render();
  });

  // ── Resize ───────────────────────────────────────────────────────────
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      size();
      letters.forEach(function (l) { l.w = l.el.getBoundingClientRect().width; });
      relayoutHome();
      if (mode === 'rest' && !launched) {
        letters.forEach(function (l, i) { l.x = home[i].x; l.y = home[i].y; });
      } else {
        letters.forEach(function (l) {
          l.x = Math.min(Math.max(l.x, l.w / 2), W - l.w / 2);
          l.y = Math.min(Math.max(l.y, fs * 0.4), H - fs * 0.4);
        });
      }
      render();
    }, 120);
  });

  // Build once the title font is in, so letter widths are real
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(build);
})();
