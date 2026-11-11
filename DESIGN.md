# Portfolio 2026 — Design system & redesign spec

This is the source of truth for the redesign. Tokens live in `css/tokens.css`;
this file explains how to use them and what each page should do.
Visual reference (private canvas, owner-only): https://claude.ai/artifact/Whuodq5dBCQJ5bRTaJN7BH

---

## 1. Principles

- **Two columns.** A sticky side nav (left) is visible on every page; content scrolls on the right.
- **Weight is the only highlight.** The title face sits at Ultralight; whatever is active, current or hovered goes Regular. Nothing else is bold.
- **Almost no lines.** Lines exist only in the side nav. Case studies, About and Play have none: sections are separated by space and their label.
- **One accent.** `--color-accent` (#112490) is used only for the research question, link hover and the slingshot wall-hit.
- **No footer.** The side nav carries contact and ©. Case studies end with a "Next project" link.

## 2. Type

| Role | Face | Weight | Size / line | Case |
|---|---|---|---|---|
| Display (case-study title) | `--font-title` | 200 | 76/80 (phone 42/44) | UPPER |
| Name (SEOHA KIM) | `--font-title` | 400 | 24/30 | UPPER |
| Nav item, project row | `--font-title` | 200 → 400 active | 22/28 | UPPER |
| Label (section name, meta key, year) | `--font-title` | 200 | 16/20, +0.03em | UPPER |
| Next-project link | `--font-title` | 200 | 44/48 | UPPER |
| Lede | `--font-body` | 400 | 22/32 | Sentence |
| Statement (problem, research Q) | `--font-body` | 400 | 30/38 (phone 23/31) | Sentence |
| Heading | `--font-body` | 500 | 20/28 | Sentence |
| Body | `--font-body` | 400 | 18/28 (phone 17/26) | Sentence |
| Meta value | `--font-body` | 400 | 15/22 | Sentence |
| Caption | `--font-body` | 400 | 14/20 (Play 13) | Sentence |

Rules:
1. **Ultralight minimum is 16px** (`--ultralight-min`). Anything smaller is Supply Sans 400 or Geist (e.g. ©, empty-image labels).
2. Title face is always uppercase and short (≤ ~5 words). Geist is never uppercase.
3. Load only Supply Sans 200 + 400 and Geist 400 + 500.
4. Reading text is left-aligned, max ~70 characters per line. Captions are left-aligned everywhere.
5. Supply Sans is proportional, so Regular is ~6% wider than Ultralight. Right-align years in the nav so the hover weight change doesn't push them; reserve the Regular width if titles twitch.

### Fonts
- PP Supply Sans (Ultralight + Regular) lives in `fonts/` and is committed. It's used under Pangram Pangram's free personal-use terms, which allow the free fonts "in your portfolio (PDF, print or web!)". If the site ever becomes commercial (client work, selling things), buy a licence.
- `css/fonts.css` declares the `@font-face`s.
- Geist comes from Google Fonts: `family=Geist:wght@400;500`.

## 3. Lines

Only two kinds, both in the side nav:
- **Hairline**: `--line-hairline`, under the "WORK" label only.
- **Leader** (dashed, 4 on / 4 off, drawn with `--line-leader` as a background so every browser matches): before "CONTACT", and the slingshot's pull line.

Do **not** add lines under titles, above sections, between rows, in meta details or on "Next project".

## 4. Layout & spacing

- Desktop: `[nav: var(--nav-width), sticky, height 100vh] [content: flex 1, padding var(--content-pad), max-width var(--content-max)]`.
- Content uses a 12-column grid, 20px gutter. Labels sit in cols 1–3; text in cols 4–12.
- Section gap `--section-gap` (120px; 80px on phone). 168px before "Next project".
- Phone (`< 760px`): no side nav. Slim top bar (bunny left, with `[SEOHA KIM]` off the landing page; MENU right) that opens the nav screen as an overlay; content is a single column with 16px padding.
- Tap targets ≥ 44px.

## 5. Images

Only four sizes, always in fixed ratios. Every image row uses one of five patterns (markup and classes in `css/case-study.css`):

| Pattern | Classes | Ratios |
|---|---|---|
| Full | `.m--full` (12 col) | 21:9 (16:9 on phone). Hero, or one moment per section |
| Half + Half | `.m--half` ×2 (6 + 6) | 4:3 |
| Wide + Third | `.m--wide` + `.m--third` (8 + 4) | 3:2 + 4:5 |
| Wide + text | `.m--wide` + `.cs-aside` (8 + 4) | 3:2, text bottom-aligned |
| Third × 3 | `.m--third` ×3 (4 + 4 + 4) | 4:5, or 1:1 with `.m--square` for app screens |

- Photos fill their box (`object-fit: cover`).
- Diagrams, screenshots and code go on a plate: add `.m--plate` (grey box, 32px padding, 16 on phone, image contained). They then sit in the same frames as photos.
- Every figure has a short caption, just the name ("Menu", "Rock"). No "Fig. n —" numbering.
- Rows: 64px after section text, 40px between consecutive rows.
- Don't use any other column span, natural-ratio image or inline size. If an image doesn't fit a pattern, put it on a plate in the nearest one.
- Two extras for branding pages: **Small 2×2** (`.m--grid4` > `.m-grid4`, cols 1–6, four 3:4 photos, one caption, stays 2×2 on phone) for supporting shots like an interior; and **brand plates** (`.m--plate.m--brand`), a plate in the project's own colour (`--color-<project>-…` in tokens.css, set as `--plate-brand` by the page's `.cs--<project>` class).

## 6. Components & pages

### 6.1 Side nav (shared on every page; build first)
Top block:
- Bunny (ASCII character, `js/side-nav.js`): sits at the top of the nav. Rows are laid out with CSS, not typed spaces, so the brackets line up in any font.
  - Landing: a button with no name beside it. Clicking it hands over `[hi]` then `[coffee?]` (`js/buddy.js`). Faces: `-.-` at rest, `•.•` with a note, `-_-` after the first wall hit until Reset.
  - Every other page: a home link, `•.•`, holding `[SEOHA KIM]` beside it in Supply Sans 400 (the heaviest cut).
- `PLAY`, `ABOUT`: nav style. The current page is Regular with `aria-current="page"`.
- Leader (88px) + `CONTACT`, then indented links: `EMAIL ↗` (mailto:eigengraush@gmail.com), `INSTAGRAM ↗` (instagram.com/gim.coha), `LINKEDIN ↗` (linkedin.com/in/seohakim01). Label style.

Bottom block (pinned to the bottom):
- Preview row: project cover (16:10, 3fr) + areas text (Geist 14, right-aligned, 2fr).
- `WORK` label with the count at the right, hairline under it.
- Project rows: title (nav style) + year (label size, right-aligned). Order: Shape of Days, Tether, Akea Haus.
- Behaviour: hovering or focusing a row makes it Regular and swaps the preview to that project. On leave it goes back to the current project. Only one Regular row at a time.
- On non-project pages (home, Play, About): no row is Regular, and the preview is an empty `--color-empty` slot saying "HOVER A PROJECT".
- `© 2026 · Tāmaki Makaurau Auckland`: Geist 12, `--color-secondary`.
- Height budget: it must fit about 650px of viewport. If projects push past that, shrink the cover with `clamp()` before anything else.

Project data:
| id | title | year | areas | cover | page |
|---|---|---|---|---|---|
| sod | Shape of Days | 2026 (old page said 2025, confirm) | UX research, creative coding | assets/images/sod-cs-image1.webp | pages/new-sod.html |
| tether | Tether | 2026 | Installation design, physical computing | assets/tether/tether-hero.webp (+ tether-hero.mp4) | pages/tether.html |
| akea | Akea Haus | 2026 | Brand strategy, UX research, app design | assets/images/lp-thumb-akea.webp | pages/new-akea-haus.html |

### 6.2 Landing (`index.html`): slingshot
Starting point: the prototype `script.js` (Matter.js 0.19.0). The content area is the arena (`--color-plate` background), with the side nav on the left.
- `SEOHA KIM` sits centred in the arena at `--t-slingshot-size`, Supply Sans 400. Each letter is a body sized to its glyph.
- **Pull in any direction** (2D vector; the current prototype only reads mouseX). Visual pull = `MAX * tanh(d / EASE)` along the drag direction, MAX ≈ 30% of arena width.
- **Energy law:** spring potential ½kx² becomes kinetic ½mv², so launch speed v ∝ pull distance (energy ∝ pull²). Small random spread per letter (±0.25 rad, ±14% speed).
- Zero gravity, restitution ≈ 0.86, light air drag. Walls on all four arena edges.
- While dragging: a dashed leader from the origin to the pulled position, plus a fainter projection the opposite way; opacity scales with the pull.
- First wall hit: arena turns `--color-accent`, letters turn white.
- Accessibility & fallbacks: a real visually-hidden `<h1>` exists. Provide `LAUNCH ↗` (keyboard) and `RESET ↺` buttons. Hint "PULL MY NAME, THEN LET GO" fades after the first throw.
- Build fixes needed vs the prototype: use pointer events + `touch-action: none` on the arena, scale the canvas by `devicePixelRatio`, rebuild the walls on resize, and size the font from the token instead of 2% of width.

### 6.3 Case study (`pages/new-sod.html`, then `new-akea-haus.html`)
Order: hero (21:9) → title (display) → [lede cols 1–6 | details cols 8–12] → sections → Next project.
- Details: a 2×2 grid of label-style keys over Geist 15 values (Role, Areas, Year, Type). No leaders.
- Sections: `01 — PROBLEM` label (cols 1–3) + content (cols 4–12). No lines anywhere.
- Research question: label + statement, both in `--color-accent`.
- Design approach: 3 columns (stacked on phone) of number label, Geist 500 heading and body.
- End: right-aligned `NEXT PROJECT` label over a `TETHER →` link (next-project style).
- Details may add Tools and Award (Tether: 3×2). The award links out to its Best Awards entry, underlined, `--color-accent` on hover.
- Video in a figure (`<video data-inview … preload="none">` + poster, `js/case-video.js`): plays muted and looping only while 40% on screen, pauses when scrolled away; reduced motion shows controls instead. Screen recordings go on a plate like screenshots.
- Copy fixes from the old page: "how they ware" → "are", "participants references" → "referred", "guided question" → "questions", "they received" → "receive".

### 6.3b Branding page (`pages/bakkatchae.html`)
Not a case study, so no hero. Header: title, lede and the details grid (Areas, Type, Year, Instagram link) on the left, cols 1–8; the logo (3:4) in cols 10–12, top-aligned (on phone it comes first, half width). Then image rows only: no numbered sections. Rows: Half + Half (menu, floor guide, on brand plates) → Third × 3 (sticker, entrance, poster) → Small 2×2 (interior). Ends with Next project → Shape of Days. Listed under "Other" in the side nav.

### 6.3c Sequence (`pages/sequence.html`)
Short case study, listed under "Other" with the Silver pin. Hero is the header image (Silver badge baked in), then the header (Areas, Year, Type, Award ↗ to its Best Awards entry), then the walkthrough film as a Full row at 16:9 (`.m--169`, never cropped; has sound, so it carries controls). Sections: 01 Problem, 02 Idea, 03 Two screens, 04 Behind the scenes. Ends with Next project → Shape of Days.

### 6.4 Play (`pages/play.html`)
- Top: "Welcome to playground. More to come." in statement style, cols 7–12, then a section gap. No categories or filters.
- Grid: 4 columns of square tiles (`--color-plate` behind), staggered in bands like a shop catalogue. Each band is one row: a big tile spans 2 columns; small tiles pin to the top or bottom of the band, so the gaps shift from band to band.
- Media fills its tile (`object-fit: cover`). Diagrams (`.is-plate`) keep their whole frame, contained on the plate with padding. `.is-natural` tiles take the media's own ratio instead of square, so nothing is cropped (tall images, comic pages, screen recordings); give the img/video its width and height.
- Caption: Geist 13, left-aligned, 8px under the tile.
- Mix of video and images. Video: `muted loop playsinline preload="none"` + poster frame; it plays only while hovered or focused.
- Hover/focus one item: it plays, muted. No blur on hover.
- Click one item: it comes into focus and every other item gets `filter: blur(var(--play-blur))` + opacity 0.5 (a clip with sound also turns its sound on). Click it again, click outside the gallery or press Escape to clear. Clicking another item moves the focus.
- Touch: no hover, so play the item nearest the middle of the screen (IntersectionObserver), tap to toggle, no blur.
- Phone (< 760px): 2 columns. Big tiles take a full row; small ones pair up.
- Reduced motion: posters only.
- Ship MP4 (H.264) at ~960px wide. The .mov files in `assets/videos/` won't play reliably in Chrome/Firefox.
- Items, in this order (bands of 4 columns): Fluid sim, Water ripple, AI image gen | BirdCare billboard, Point cloud, Abstract study | Reactive ocean, Photography | Digital scrapbook, Audio-reactive | Needle felting, ASCII hand tracking | Simply app, Graphic novel. Keep each band at 4 columns (big = 2) when adding items, and mix images in with videos rather than appending.
- Sound: Fluid sim, Point cloud and ASCII hand tracking have sound (`data-sound`). They play muted on hover; the click that focuses them turns sound on, the click that clears it mutes. The other clips have no audio track.

### 6.5 About (`pages/about.html`)
- First viewport: bio (cols 1–5, bottom-aligned, Geist 18) | portrait (cols 8–12, 2:3, upright: the current `about-portrait.webp` is stored rotated 90°).
- Above the bio, 40px gap: a practice label in Supply Sans 22 Regular, uppercase, in brackets: [CREATIVE CODING] → [PHYSICAL-DIGITAL EXPERIENCE] → [PLAYFUL TECH] → [USER RESEARCH] (`js/about-roll.js`). ASCII scramble, after daas.graphics: each change flickers through random ASCII glyphs (one swap per 40ms frame), then the word resolves letter by letter, mostly left to right; it holds 2.4s. The bracket window eases to the new width and clips the glyphs. Pauses on hover and in a hidden tab; reduced motion stays on the first word. Screen readers get the list as one visually-hidden sentence.
- Then, 168px down, "Outside of design": five hobby photos in one row (cols 1–7, 4px apart; four at 3:4, the last a little wider, `about-hobby-1…5.webp`), then the note (cols 1–5, Geist 18), 24px under it. This replaces the workspace photo and "This is where everything is made."
- **Removed for now:** practice, location, degree, recognition, resume.

### 6.6 Phone
- Nav screen (the MENU overlay): name, PLAY, ABOUT, leader + CONTACT with links, then preview + WORK list at the bottom.
- Case study: same order as desktop in one column, hero 4:3, details 2×2, sections 80px apart.

## 7. Build order

1. Add `css/tokens.css` + `css/fonts.css` to `style.css`; delete the old tokens in `variables.css` / `typography.css` once nothing uses them.
2. Side nav as one shared partial (JS include or template) used by every page.
3. Landing slingshot.
4. Case-study template (Shape of Days first, then Akea Haus).
5. Play page.
6. About page.
7. Phone layout (< 760px) across all pages.
8. Check: no 404 links, no inline pixel widths, every Ultralight text ≥ 16px, keyboard focus works everywhere.

## 8. Retire from the old build
- The fat top nav (`css/nav.css`), the landing carousel (`js/project-list.js`), Geist Mono, Switzer, the 3px dashed lines and the link-tree on About.
- Inline `style="width:…px"` layouts in the case-study HTML.
