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

## Hosting (AWS, Terraform)

Live at **https://chaabinourelhouda.com**. Everything is in `infra/`:

| File | What it defines |
| --- | --- |
| `bootstrap/main.tf` | One-time state bucket (versioned, encrypted, private, protected from deletion). Local state. |
| `versions.tf` | Pinned providers; remote state in S3 with S3-native locking; a `us_east_1` provider for the certificate. |
| `site_bucket.tf` | Private site bucket; policy lets only this CloudFront distribution read it (OAC). |
| `cdn.tf` | CloudFront: HTTPS, `/assets/*` vs pages behaviours, response-headers policies (security headers + Cache-Control). |
| `functions/spa-rewrite.js` | CloudFront Function: extension-less paths → `/index.html`, so deep links work and missing files still 404. |
| `domain.tf` | ACM certificate (DNS-validated) and Route 53 alias records for the domain and `www`. |
| `github_oidc.tf` | GitHub OIDC provider + least-privilege deploy role (main branch of this repo only). |
| `budget.tf` | $5/month budget with email alerts. |

Make infra changes from `infra/`: `terraform init`, `terraform plan`, `terraform apply`. Copy `terraform.tfvars.example` to `terraform.tfvars` (git-ignored) first.

Deploys: `.github/workflows/deploy.yml` runs on every push to `main`. It builds and checks the site, assumes the deploy role through OIDC (no stored keys), syncs `dist/` to S3 and invalidates CloudFront. `ci.yml` stays a build check for every push and PR.

## Asset provenance

- All diagrams and the favicon are original inline SVGs written for this site. The project miniatures are drawn from the architecture data in `projects.ts`.
- `public/me/hero.webp` is the owner's supplied photo with its background and lettering removed (rembg cut-outs merged + colour key restricted to the lettering band; face untouched).
- `public/me/headshot.webp` is the owner's own portrait with the background replaced (rembg cut-out, composited on a generated studio gradient, resampled 2× with Lanczos). The face is not retouched or generated.
- Fonts are self-hosted through Fontsource: Space Grotesk (500/700), IBM Plex Sans (400/600) and IBM Plex Mono 400, both under the SIL Open Font License.
- No stock art or third-party images are used.
- Design inspiration: td-tomasfolio.framer.website (layout and rhythm). No artwork or copy was reused; colours, icons and diagrams are original.


The Lab section's pipeline is a **simulation**. `src/lib/pipeline.ts` is a pure state machine with hard-coded, clearly fake logs. It runs no commands, calls no cloud API and reflects no real repository.
