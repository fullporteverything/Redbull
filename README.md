# Red Bull — concept site

A static, single-page concept site for an energy drink. It has a scroll-driven intro, a burn-through hero, sticky storytelling sections and a small demo shop.

This is an independent concept and is not affiliated with Red Bull GmbH. All copy, the can illustrations (built in HTML/CSS) and the story illustrations (inline SVG) are original. No official logos or product photography are used. The cart is a demo and checkout is disabled.

## Sections

1. **Loader:** wordmark, floating spec pills, load counter.
2. **Hero:** "RED BULL." with a floating can. Scrolling burns navy holes through the page (SVG turbulence and displacement).
3. **The formula:** navy section with generated topographic contour lines.
4. **Four editions:** sticky section that cycles Original → Red → Blue → Yellow.
5. **Inside:** sticky section for the functional ingredients, with clickable tabs.
6. **Story:** sticky timeline (1987 → 1997 → 2012 → today) with framed illustrations.
7. **Press:** "Widely noticed." with quotes and two marquee rows.
8. **Reach:** 177 countries, with stats that count up.
9. **Shop:** "Order direct." with pack sizes, a price that updates, and a cart drawer.

## Run locally

It has no build step. Serve the folder over HTTP, because the self-hosted fonts don't load from `file://`:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

On Vercel, Netlify or GitHub Pages, deploy the repository root as a static site. You don't need any framework settings.

## Stack

- Plain HTML, CSS and JavaScript (`index.html`, `css/style.css`, `js/main.js`)
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling, self-hosted in `js/vendor/` (MIT)
- Archivo, Newsreader and Inter, self-hosted in `fonts/` (SIL Open Font License)
