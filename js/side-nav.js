/* ── Side nav, shared on every page (DESIGN.md §6.1) ───────────────────────
   Usage, as the first thing in <body>:
     <aside class="side-nav" id="side-nav" data-current="about"></aside>
     <script src="../js/side-nav.js"></script>
   data-current: home | play | about | <project id>.
   Loaded without defer so the nav is in place before first paint.        */

(function () {
  // Site root, from this script's own URL, so links work from / and /pages/
  // on GitHub Pages and from file://.
  var ROOT = new URL('../', document.currentScript.src).href;

  var PAGES = [
    // built: false → listed without a link (every link must resolve).
    { id: 'play',  title: 'Play',  href: 'pages/play.html',  built: true },
    { id: 'about', title: 'About', href: 'pages/about.html', built: true }
  ];

  var CONTACT = [
    { label: 'Email',     href: 'mailto:eigengraush@gmail.com' },
    { label: 'Instagram', href: 'https://www.instagram.com/gim.coha/' },
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/seohakim01' }
  ];

  var PROJECTS = [
    { id: 'sod',    title: 'Shape of Days', year: '2026', areas: 'UX research, creative coding',
      cover: 'assets/images/sod-cs-image1.webp', href: 'pages/new-sod.html' },
    { id: 'tether', title: 'Tether',        year: '2026', areas: '[Areas]',
      cover: 'assets/tether/tether-hero.webp', coverVideo: 'assets/tether/tether-hero.mp4',
      award: { src: 'assets/images/best-gold.png', alt: 'Best Design Awards, Gold' },
      href: 'pages/tether.html' },
    { id: 'akea',   title: 'Akea Haus',     year: '2026', areas: 'Brand strategy, UX research, app design',
      cover: 'assets/images/lp-thumb-akea.webp', href: 'pages/new-akea-haus.html' }
  ];

  var nav = document.getElementById('side-nav');
  if (!nav) return;
  var current = nav.dataset.current || '';

  function url(path) { return ROOT + path; }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Landing: a button that hands over notes (js/buddy.js). Other pages: awake,
  // holding the name, and links home.
  function bunny() {
    var home = current === 'home';
    var art =
      '<span class="buddy__art" aria-hidden="true">' +
        '<span class="buddy__ears">(\\__/)</span>' +
        '<span class="buddy__row"><span>(</span><span data-buddy-face>' + (home ? '-.-' : '•.•') + '</span><span>)</span></span>' +
        '<span class="buddy__row"><span class="buddy__legs">(nn</span>' +
          '<span class="buddy__arm" data-buddy-arm' + (home ? ' hidden' : '') + '>ノ</span><span>)</span>' +
          (home ? '<span class="buddy__gift" data-buddy-gift></span>'
                : '<span class="buddy__gift buddy__gift--name">[Seoha Kim]</span>') +
        '</span>' +
      '</span>';
    return home
      ? '<button type="button" class="buddy" data-buddy aria-label="Say hi to the bunny">' + art + '</button>'
      : '<a class="buddy" href="' + url('index.html') + '" aria-label="Seoha Kim, home">' + art + '</a>';
  }

  // ── Markup ────────────────────────────────────────────────────────────
  var primary = PAGES.map(function (p) {
    var cur = p.id === current ? ' aria-current="page"' : '';
    return p.built
      ? '<li><a class="t-title t-nav" href="' + url(p.href) + '"' + cur + '>' + esc(p.title) + '</a></li>'
      : '<li><span class="t-title t-nav">' + esc(p.title) + '</span></li>';
  }).join('');

  var contact = CONTACT.map(function (c) {
    return '<li><a class="t-title t-label" href="' + c.href + '"' +
      (c.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(c.label) + ' <span aria-hidden="true">↗</span>' +
      (c.href.indexOf('http') === 0 ? '<span class="visually-hidden"> (opens in a new tab)</span>' : '') +
      '</a></li>';
  }).join('');

  var rows = PROJECTS.map(function (p) {
    var inner = '<span class="t-title t-nav side-nav__title">' + esc(p.title) +
                  (p.award ? '<img class="side-nav__award" src="' + url(p.award.src) + '" alt="' + esc(p.award.alt) + '" width="24" height="24">' : '') +
                '</span>' +
                '<span class="t-title t-label side-nav__year">' + esc(p.year) + '</span>';
    var cur = p.id === current ? ' aria-current="page"' : '';
    return '<li>' + (p.href
      ? '<a class="side-nav__row" data-project="' + p.id + '" href="' + url(p.href) + '"' + cur + '>' + inner + '</a>'
      : '<span class="side-nav__row" data-project="' + p.id + '">' + inner + '</span>') + '</li>';
  }).join('');

  nav.setAttribute('aria-label', 'Site');
  nav.innerHTML =
    '<div class="side-nav__top">' +
      '<div class="side-nav__brand">' + bunny() + '</div>' +
      '<nav aria-label="Main"><ul class="side-nav__primary">' + primary + '</ul></nav>' +
      '<div class="side-nav__contact">' +
        '<h2 class="side-nav__contact-head t-title t-label"><span class="side-nav__leader" aria-hidden="true"></span>Contact</h2>' +
        '<ul class="side-nav__links">' + contact + '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="side-nav__bottom">' +
      '<div class="side-nav__preview" aria-hidden="true">' +
        '<div class="side-nav__cover"></div>' +
        '<p class="side-nav__areas"></p>' +
      '</div>' +
      '<h2 class="side-nav__work-head t-title t-label"><span>Work</span><span>' + PROJECTS.length + '</span></h2>' +
      '<nav aria-label="Work"><ul class="side-nav__work">' + rows + '</ul></nav>' +
      '<p class="side-nav__copy">© 2026 · Tāmaki Makaurau Auckland</p>' +
    '</div>';

  // ── Preview: hover/focus a row → Regular + its cover; leave → current ──
  var cover = nav.querySelector('.side-nav__cover');
  var areas = nav.querySelector('.side-nav__areas');
  var preview = nav.querySelector('.side-nav__preview');
  var list = nav.querySelector('.side-nav__work');
  var rowEls = nav.querySelectorAll('.side-nav__row');
  var byId = {};
  PROJECTS.forEach(function (p) {
    byId[p.id] = p;
    if (p.cover) new Image().src = url(p.cover); // warm the cache so swaps don't flash
  });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(id) {
    var p = byId[id];
    rowEls.forEach(function (r) { r.classList.toggle('is-active', r.dataset.project === id); });
    if (p && p.coverVideo && !reducedMotion) {
      cover.innerHTML = '<video src="' + url(p.coverVideo) + '" poster="' + url(p.cover) + '" muted loop playsinline autoplay></video>';
      var v = cover.querySelector('video');
      v.muted = true;
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    } else if (p && p.cover) {
      cover.innerHTML = '<img src="' + url(p.cover) + '" alt="">';
    } else {
      cover.innerHTML = '<span class="side-nav__cover-empty">Coming soon</span>';
    }
    areas.textContent = p ? p.areas : '';
    preview.hidden = !p; // nothing hovered or current: no preview at all
  }

  function reset() { show(byId[current] ? current : null); }

  rowEls.forEach(function (r) {
    r.addEventListener('pointerenter', function () { show(r.dataset.project); });
    r.addEventListener('focus', function () { show(r.dataset.project); });
  });
  list.addEventListener('pointerleave', reset);
  list.addEventListener('focusout', function (e) {
    if (!list.contains(e.relatedTarget)) reset();
  });
  reset();

  // ── Phone: top bar + menu overlay (DESIGN.md §4, §6.6) ────────────────
  var bar = document.createElement('header');
  bar.className = 'top-bar';
  bar.innerHTML =
    bunny() +
    '<button type="button" class="top-bar__menu" aria-controls="side-nav" aria-expanded="false">Menu</button>';
  nav.parentNode.insertBefore(bar, nav);
  var menuBtn = bar.querySelector('.top-bar__menu');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });
  var desktop = window.matchMedia('(min-width: 761px)');
  if (desktop.addEventListener) desktop.addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  window.SideNav = {
    show: show,
    reset: reset
  };
})();
