# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TwoLostTourists is a travel and maintenance/restoration log for a **1999 Country
Coach** diesel pusher, published as a Next.js site. Content covers road trips and
hands-on repair/restoration of the coach. Country Coach wound down around 2009, so
parts-sourcing and keeping an orphaned luxury coach running is a recurring,
deliberately useful theme — write for the person trying to keep one of these alive.

The codebase itself is still an early-stage scaffold: the only application code
present is the default `create-next-app` page ([src/app/page.tsx](src/app/page.tsx))
and root layout ([src/app/layout.tsx](src/app/layout.tsx)) — no custom routes,
content pipeline, or Cloudflare Images integration has been built yet. Treat the
sections below on voice, privacy, and Cloudflare Images as the target architecture
to build toward, not a description of what's already implemented.

## Voice & style: "Famous Hands"
- Modeled on older printed DIY/shop manuals where only the demonstrator's hands
  appear in the photos. Instructional, terse, competent.
- Write imperative / second person ("Torque the fitting to spec"), never first-person
  narrative. Avoid "I", personal anecdote, and anything that reveals who the author is.
- Captions describe the **action and the part**, never the person.
- Tone: calm, plain, mechanically precise. No hype, no lifestyle-vlogger voice.

## Privacy — IMPORTANT, these are hard rules
The author is deliberately anonymous. YOU MUST NOT produce or suggest content that
could identify the author, their exact location, or the vehicle's identity.
- Never include the author's name, face, likeness, household members, or contact
  details in copy, alt text, metadata, or commit messages.
- Photos are hands-and-work only. Before any image is referenced on the site it MUST
  have EXIF/GPS stripped. NEVER commit original camera/phone photos to git — EXIF
  (GPS, timestamps, device serial) lives in history forever. Originals go to
  Cloudflare Images; pages reference variant URLs only.
- Never surface identifying details that may be visible in a shot: license plate,
  VIN/data plate, registration stickers, house numbers, mail or labels, or nav/phone
  screens showing names or coordinates.
- Reflection risk: a coach is full of chrome, glass, and mirrors. Flag when a
  described shot could capture the author's reflection.
- Hands appear in every frame, so treat distinctive rings, tattoos, scars, or watches
  as potentially identifying — note when to avoid or obscure them.
- Keep locations vague. Don't pair precise place names with dates in a way that
  reveals a real-time itinerary.
- Do NOT write the author's real name, home base, plate, or VIN into this file or any
  committed file. If such specifics are ever needed, they belong in CLAUDE.local.md
  (gitignored) — preferably nowhere.

## Commands

- `npm run dev` — start the Next.js dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build via `next build`
- `npm run lint` — run `next lint` (ESLint, flat config extending `next/core-web-vitals` and `next/typescript`)
- `npm run preview` — build with `opennextjs-cloudflare` and preview locally under the actual Cloudflare Workers runtime (use this, not `next start`, to validate Cloudflare-specific behavior like bindings and image optimization)
- `npm run deploy` — build and deploy to Cloudflare via `opennextjs-cloudflare`
- `npm run upload` — build and upload a new version to Cloudflare without deploying it
- `npm run cf-typegen` — regenerate `cloudflare-env.d.ts` types from `wrangler.jsonc` bindings (run after adding/changing any binding)

There is no test setup in this repo yet.

## Architecture

- **Framework**: Next.js App Router (`src/app/`), TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`), path alias `@/*` → `./src/*`.
- **Deployment target**: Cloudflare Workers, not Vercel/Node, via `@opennextjs/cloudflare`, which converts the Next.js build output into a Worker (`.open-next/worker.js`, referenced as `main` in [wrangler.jsonc](wrangler.jsonc)). Static assets are served via the `ASSETS` binding pointing at `.open-next/assets`.
- **Local Cloudflare bindings in `next dev`**: [next.config.ts](next.config.ts) calls `initOpenNextCloudflareForDev()` so that `getCloudflareContext()` works while running the plain `next dev` server, without needing `wrangler dev`.
- **Bindings/config**: [wrangler.jsonc](wrangler.jsonc) is the source of truth for Cloudflare bindings (KV, D1, R2, vars, secrets, services, etc.). No bindings are configured yet — the relevant sections are present but commented out as templates. After adding a binding, update `wrangler.jsonc` and re-run `npm run cf-typegen` to refresh `cloudflare-env.d.ts` (a large generated file — do not hand-edit it).
- **Env vars for local dev**: `.dev.vars` (gitignored, based on `.dev.vars.example`) is loaded by `wrangler`/OpenNext for `NEXTJS_ENV` and other local secrets — do not commit real values here.
- **Observability**: `wrangler.jsonc` has `observability.logs` and `observability.traces` enabled with `persist: true`, but the top-level `observability.enabled` flag is currently `false`.
- **Images (target architecture)**: Cloudflare Images is intended as the CDN and origin store for photos. `next/image` optimization should be backed by Cloudflare Images on this adapter — large photos never live in the repo; the repo holds content (markdown), code, and small UI assets only.

## Engineering rules
- Keep `@opennextjs/cloudflare` and Next.js current. The `/_next/image` route has had
  security fixes (SSRF fixed in adapter 1.3.0; Aug 2025 image-optimization CVEs).
  Do not pin to an old adapter version.
- Set a `remotePatterns` allow-list in `next.config` for image sources; never leave
  remote image loading open.
- Prefer WebP/AVIF output (all invisible metadata is dropped on those formats).
  Do not expose Cloudflare Images "original"/flexible variants publicly.
- Large photos never live in the repo. The repo holds content (markdown), code, and
  small UI assets only.
- Ask before adding dependencies or changing the deploy/build configuration.

## Workflow
- Prefer small, reviewable diffs. Don't refactor beyond the scope of the request.
- Explain the plan before large or multi-file changes.
- Commit messages describe the change — never the author or location.
