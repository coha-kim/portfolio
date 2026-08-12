(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'interactive' || document.readyState === 'complete') init();

  function init() {
    if (window.__heroInteractionInit) return;
    window.__heroInteractionInit = true;

    const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;

    const canvas       = document.getElementById('hero-canvas');
    const lettersLayer = document.getElementById('hero-letters');
    if (!canvas || !lettersLayer) return;

    const ctx = canvas.getContext('2d');

    let canvasRect = canvas.getBoundingClientRect();
    let W = canvasRect.width;
    let H = canvasRect.height;
    canvas.width  = W;
    canvas.height = H;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    const world  = engine.world;

    const FONT_SIZE = 24; // matches WORK / PLAY / ABOUT (var(--size-nav))
    const FONT      = `400 ${FONT_SIZE}px 'Geist Mono', monospace`;
    ctx.font = FONT;

    const TEXT = 'SEOHA KIM';
    const PX = 6, PY = 5;

    const glyphs = TEXT.split('').map(ch => {
      if (ch === ' ') return { ch, isSpace: true, bw: ctx.measureText(' ').width * 1.4 };
      const tw = ctx.measureText(ch).width;
      return { ch, isSpace: false, bw: tw + PX * 2, bh: FONT_SIZE + PY * 2 };
    });

    const rowW = glyphs.reduce((s, g) => s + g.bw, 0);

    function layoutPositions(currentW, currentH) {
      let gx = (currentW - rowW) / 2;
      const rowY = currentH / 2;
      const positions = [];
      glyphs.forEach(g => {
        if (g.isSpace) { gx += g.bw; return; }
        positions.push({ cx: gx + g.bw / 2, cy: rowY });
        gx += g.bw;
      });
      return positions;
    }

    const items = [];

    layoutPositions(W, H).forEach((pos, i) => {
      const g = glyphs.filter(gl => !gl.isSpace)[i];

      const body = Bodies.rectangle(pos.cx, pos.cy, g.bw, g.bh, {
        restitution : 0.88,
        friction    : 0.01,
        frictionAir : 0.009,
        label       : 'letter',
      });

      const el = document.createElement('span');
      el.textContent = g.ch;
      el.style.position      = 'absolute';
      el.style.top           = '0';
      el.style.left          = '0';
      el.style.fontFamily    = "'Geist Mono', monospace";
      el.style.fontSize      = `${FONT_SIZE}px`;
      el.style.fontWeight    = '400';
      el.style.lineHeight    = '1';
      el.style.whiteSpace    = 'pre';
      el.style.willChange    = 'transform';
      lettersLayer.appendChild(el);

      Composite.add(world, body);
      items.push({ body, el, baseX: pos.cx, baseY: pos.cy, hitTimer: null });
    });

    let wallBodies = [];

    function buildWalls(currentW, currentH) {
      if (wallBodies.length) Composite.remove(world, wallBodies);
      const T   = 80;
      const wOp = { isStatic: true, label: 'wall', restitution: 0.88, friction: 0.01 };
      wallBodies = [
        Bodies.rectangle(currentW / 2,      -T / 2,           currentW + 2 * T, T,                wOp),
        Bodies.rectangle(currentW / 2,      currentH + T / 2, currentW + 2 * T, T,                wOp),
        Bodies.rectangle(-T / 2,            currentH / 2,     T,                currentH + 2 * T, wOp),
        Bodies.rectangle(currentW + T / 2,  currentH / 2,     T,                currentH + 2 * T, wOp),
      ];
      Composite.add(world, wallBodies);
    }

    buildWalls(W, H);

    Events.on(engine, 'collisionStart', ({ pairs }) => {
      for (const { bodyA, bodyB } of pairs) {
        const letterBody =
          bodyA.label === 'wall' && bodyB.label === 'letter' ? bodyB :
          bodyB.label === 'wall' && bodyA.label === 'letter' ? bodyA : null;
        if (!letterBody) continue;
        const item = items.find(it => it.body === letterBody);
        if (item) flashHit(item);
      }
    });

    function flashHit(item) {
      item.el.style.color = 'var(--blue)';
      clearTimeout(item.hitTimer);
      item.hitTimer = setTimeout(() => {
        item.el.style.color = '';
      }, 220);
    }

    Runner.run(Runner.create(), engine);

    let physicsState = 'locked';
    let lockTargets  = items.map(it => ({ x: it.baseX, y: it.baseY }));

    Events.on(engine, 'afterUpdate', () => {
      if (physicsState !== 'locked') return;
      items.forEach((it, i) => {
        Body.setPosition(it.body, lockTargets[i]);
        it.body.angle = 0;
        Body.setVelocity(it.body,        { x: 0, y: 0 });
        Body.setAngularVelocity(it.body, 0);
      });
    });

    const POWER         = 0.14;
    const SCATTER_ANGLE = 0.55;
    const SPEED_VAR     = 0.28;
    const MIN_SPEED     = 6;
    let   VISUAL_MAX    = W * 0.30;
    let   EASE          = W * 0.09;

    let grabbed    = false;
    let grabGroupX = 0;
    let grabGroupY = 0;
    let grabMouseX = 0;
    let pullOffset = 0;
    let offsets    = [];

    function resist(rawDX) {
      return VISUAL_MAX * Math.tanh(rawDX / EASE);
    }

    function nearText(pt, pad = 50) {
      return items.some(({ body }) => {
        const { min, max } = body.bounds;
        return pt.x >= min.x - pad && pt.x <= max.x + pad &&
               pt.y >= min.y - pad && pt.y <= max.y + pad;
      });
    }

    function doGrab(mouseX) {
      grabbed    = true;
      grabMouseX = mouseX;
      pullOffset = 0;

      const snap = items.map(({ body }) => ({ x: body.position.x, y: body.position.y }));

      items.forEach((it, i) => {
        Body.setVelocity(it.body,        { x: 0, y: 0 });
        Body.setAngularVelocity(it.body, 0);
        lockTargets[i] = { x: snap[i].x, y: snap[i].y };
      });

      physicsState = 'locked';

      const cx = snap.reduce((s, p) => s + p.x, 0) / snap.length;
      const cy = snap.reduce((s, p) => s + p.y, 0) / snap.length;
      grabGroupX = cx;
      grabGroupY = cy;

      offsets = snap.map(p => ({ dx: p.x - cx, dy: p.y - cy }));

      canvas.style.cursor = 'ew-resize';
    }

    function doMove(mouseX) {
      pullOffset = resist(mouseX - grabMouseX);

      items.forEach((_, i) => {
        lockTargets[i] = {
          x: grabGroupX + pullOffset + offsets[i].dx,
          y: grabGroupY +              offsets[i].dy,
        };
      });
    }

    function doRelease() {
      if (!grabbed) return;
      grabbed = false;
      canvas.style.cursor = 'default';

      if (Math.abs(pullOffset) < 3) return;

      document.getElementById('page-wrap')?.classList.add('activated');

      const baseVX = -pullOffset * POWER;

      const vels = items.map(() => {
        const angle = (Math.random() - 0.5) * SCATTER_ANGLE;
        const sv    = 1 + (Math.random() - 0.5) * SPEED_VAR;
        let vx = baseVX * Math.cos(angle) * sv;
        let vy = baseVX * Math.sin(angle) * sv;
        const spd = Math.hypot(vx, vy);
        if (spd > 0 && spd < MIN_SPEED) { vx = vx / spd * MIN_SPEED; vy = vy / spd * MIN_SPEED; }
        return { vx, vy };
      });

      physicsState = 'free';
      pullOffset   = 0;

      items.forEach((it, i) => {
        Body.setVelocity(it.body, { x: vels[i].vx, y: vels[i].vy });
        Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.45);
      });
    }

    canvas.addEventListener('mousedown', e => {
      if (nearText({ x: e.offsetX, y: e.offsetY })) doGrab(e.offsetX);
    });

    canvas.addEventListener('mousemove', e => {
      if (grabbed) {
        doMove(e.offsetX);
      } else {
        canvas.style.cursor = nearText({ x: e.offsetX, y: e.offsetY }, 22) ? 'grab' : 'default';
      }
    });

    canvas.addEventListener('mouseup',    () => doRelease());
    window.addEventListener('mouseup',    () => { if (grabbed) doRelease(); });
    canvas.addEventListener('mouseleave', () => { if (grabbed) doRelease(); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 120);
    });

    function handleResize() {
      if (grabbed) return;

      canvasRect = canvas.getBoundingClientRect();
      W = canvasRect.width;
      H = canvasRect.height;
      canvas.width  = W;
      canvas.height = H;

      VISUAL_MAX = W * 0.30;
      EASE       = W * 0.09;

      buildWalls(W, H);

      layoutPositions(W, H).forEach((pos, i) => {
        const it = items[i];
        it.baseX = pos.cx;
        it.baseY = pos.cy;
        if (physicsState === 'locked') {
          lockTargets[i] = { x: pos.cx, y: pos.cy };
          Body.setPosition(it.body, lockTargets[i]);
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (grabbed && Math.abs(pullOffset) > 3) {
        const originX = grabGroupX;
        const pulledX = grabGroupX + pullOffset;
        const midY    = grabGroupY;
        const t       = Math.abs(pullOffset) / VISUAL_MAX;
        const alpha   = 0.08 + t * 0.28;

        ctx.save();
        ctx.lineWidth = 1;

        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(originX, midY);
        ctx.lineTo(pulledX, midY);
        ctx.stroke();

        const arrowX = originX + (originX - pulledX) * 0.45;
        ctx.setLineDash([2, 8]);
        ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(originX, midY);
        ctx.lineTo(arrowX, midY);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.beginPath();
        ctx.arc(originX, midY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      items.forEach(it => {
        it.el.style.transform =
          `translate(${it.body.position.x}px, ${it.body.position.y}px) translate(-50%, -50%) rotate(${it.body.angle}rad)`;
      });

      requestAnimationFrame(draw);
    }

    draw();
  }
}());
