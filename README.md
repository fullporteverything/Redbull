# Red Bull — concept site

An independent concept site for an energy drink. It's built with Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP with ScrollTrigger, and Lenis for smooth scrolling.

This site isn't affiliated with or endorsed by Red Bull GmbH. All copy is original. The product and story photos are openly licensed (CC BY, CC BY-SA or public domain), and each one is credited in the site footer. The cans were cut out of their original photos. The shop is a demo.

## Run

```sh
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

- `components/`
  - `Loader`, `Header` and `Footer`.
  - `Hero`: the cursor-driven blueprint reveal, the scroll takeover, the title split and the can glide into the formula section.
  - The section components: `Editions`, `Inside`, `Story`, `Press`, `Reach` and `Shop`.
  - `SpinCan`: a canvas renderer that projects the can onto a rotating cylinder.
- `lib/burn.ts`: the metaball field and marching-squares contour that draw the reveal holes.
- `lib/topo.ts`: the topographic contours.
- `lib/data.ts`: the content and the photo credits.
- `public/img/`: the optimised can cutouts and story photos.
