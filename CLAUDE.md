# Portfolio site: instructions for Claude Code

Static site (plain HTML/CSS/JS, GitHub Pages). Owner: Seoha Kim.

## Before changing any page
1. Read `DESIGN.md`. It's the full spec for the 2026 redesign (layout, type, lines, every page).
2. Use tokens from `css/tokens.css` only. Don't hard-code colours, sizes or spacing that exist as tokens, and don't add inline `style="width:…px"`.

## Hard rules
- PP Supply Sans weight 200 (Ultralight) is **never below 16px** (`--ultralight-min`). Smaller text → weight 400 or Geist.
- Title face is always uppercase; Geist never is.
- Only Regular (400) marks the active/current/hovered item. No other bold in the title face.
- Lines: only the hairline under "WORK" in the side nav and the dashed leaders (nav contact, slingshot pull). No lines in page content.
- PP Supply Sans files in `fonts/` are committed and used under Pangram Pangram's free personal-portfolio terms. Don't add other Pangram fonts or use these on anything commercial.
- Every link must resolve. Unbuilt pages (e.g. Tether) are listed without a link.
- Keep keyboard access and `prefers-reduced-motion` handling for anything interactive (slingshot, Play hover, hobby reveal).

## Workflow
- CSS/JS links carry a version (`?v=20261111.7`, including the `@import`s in `css/style.css`). After changing any CSS or JS file, bump the version in every HTML page and in style.css so browsers don't keep the old file.
- Build in the order in DESIGN.md §7, side nav first.
- Ask before deleting existing pages or assets.
