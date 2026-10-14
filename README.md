# Chaabi Nour El Houda · Portfolio

The portfolio of **Chaabi Nour El Houda**, a DevOps & Cloud engineering student. Layout inspired by td-tomasfolio.framer.website (giant name, cut-out portrait, capability rows, big project cards, full-bleed footer with a giant email) in a deep navy + sky blue cloud palette.

React + TypeScript + Vite. It builds to a static site, with no backend, no analytics and no runtime API calls.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # lint + typecheck + test + build
```

Node 22.18 or newer is needed, because `npm test` runs a TypeScript file directly.

## Edit the content

Everything a visitor reads lives in two files:

| File | What's in it |
| --- | --- |
| `src/content/site.ts` | Name, intro, links, availability, capabilities, experience, education (from the CV) |
| `src/content/projects.ts` | Featured projects, case studies, architecture nodes, evidence links, the “also on the shelf” list |

Rules the content follows:

- **Every claim links to its source** (a README, doc, CI file or commit history). If you can't link it, leave it out or put it in `notVerified`.
- **Contact & CV:** `links.email`, `links.linkedin`, `links.resume` and `availability` come from the CV. Set any to `null` to hide it.
- **Name / giant word:** `identity.name`, `identity.bigWord` (plus the `<title>` and meta tags in `index.html`).
- **Résumé:** `public/Chaabi_Nour_El_Houda_CV.pdf`. Replace the file to update it.
- **New project:** add an entry to `projects`. `architecture` is optional; leave it out when there's nothing worth diagramming. Only set `demo` for a real, public demo.

## Structure

```
src/
  content/        site.ts, projects.ts   ← edit these
  components/     Header, Home (all sections), CaseStudy (+ architecture explorer),
                  PipelineLab, Art (pixel icons, architecture miniatures, glyphs)
  lib/            router.tsx (tiny history router), pipeline.ts (pure demo-pipeline model)
  styles.css      design tokens on :root + all styles
tests/            pipeline.test.ts (plain node:assert)
```

## Deploy (static hosting)

`npm run build` writes `dist/`. It also copies `index.html` to `404.html`, so a host that serves `404.html` for unknown paths (GitHub Pages, for example) can still open case-study deep links like `/work/k8s-autoguard`.

- **Root domain** (e.g. `chaabi8noor.github.io` or a custom domain): `npm run build`.
- **Project subpath** (e.g. `chaabi8noor.github.io/portfolio/`): `BASE_PATH=/portfolio/ npm run build`.
- **Netlify / Cloudflare Pages:** add a SPA rewrite (`/* /index.html 200`) instead of relying on `404.html`.

Once the site has a real address, add `<link rel="canonical">` and an absolute `og:image` to `index.html`.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on pushes and PRs. It deliberately does not deploy anything.

## Asset provenance

- All diagrams and the favicon are original inline SVGs written for this site. The project miniatures are drawn from the architecture data in `projects.ts`.
- `public/me/hero.webp` is the owner's supplied photo with its background and lettering removed (rembg cut-outs merged + colour key restricted to the lettering band; face untouched).
- `public/me/headshot.webp` is the owner's own portrait with the background replaced (rembg cut-out, composited on a generated studio gradient, resampled 2× with Lanczos). The face is not retouched or generated.
- Fonts are self-hosted through Fontsource: Space Grotesk (500/700), IBM Plex Sans (400/600) and IBM Plex Mono 400, both under the SIL Open Font License.
- No stock art or third-party images are used.
- Design inspiration: td-tomasfolio.framer.website (layout and rhythm). No artwork or copy was reused; colours, icons and diagrams are original.

## Motion (copied from the reference)

Measured on td-tomasfolio.framer.website and rebuilt with CSS + a small `src/lib/motion.ts`:

- Desktop rails: fixed left "Reach out" rail and right rail with the + menu and vertical wordmark.
- Hero photo: parallax at 0.4× scroll, clipped by the hero (no entrance animation).
- Text effect: headings/descriptions reveal letter by letter, statements word by word (`Reveal.tsx`).
- Capabilities (desktop, mouse): tools hidden until hover; each pill's tint wipes in left→right with its label, 0.2s apart. ASCII icons flicker.
- Experience: accordion — + rotates to ×, details expand, a dark line sweeps across the divider on hover/open.
- Links: hover fades in a small square and slides the label 32px right.
- Project images: scale 1.1× → 1× as they scroll in.
- Menu: page blurs/dims, then the panel appears top-right; links fade in in sequence.
- Footer: static 8×14 pixel fade measured from the reference.

Everything respects `prefers-reduced-motion` (content shows immediately, no animation).

## The demo pipeline

The Lab section's pipeline is a **simulation**. `src/lib/pipeline.ts` is a pure state machine with hard-coded, clearly fake logs. It runs no commands, calls no cloud API and reflects no real repository.
