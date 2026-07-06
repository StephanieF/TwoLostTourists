# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TwoLostTourists is a travel and maintenance/restoration log for a **1999 Country
Coach** diesel pusher, published as a Next.js site. Content covers road trips and
hands-on repair/restoration of the coach. Country Coach wound down around 2009, so
parts-sourcing and keeping an orphaned luxury coach running is a recurring,
deliberately useful theme — write for the person trying to keep one of these alive.

The blog content pipeline, routes, and D1-backed search described under
[Architecture](#architecture) are built. Cloudflare Images itself (the actual
account/variants) is still the user's manual setup step — the code is ready to
consume it via `NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL` once configured.

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

- `npm run dev` — start the Next.js dev server (Turbopack) at http://localhost:3000 (runs `generate-content` first)
- `npm run build` — production build via `next build` (runs `generate-content` first)
- `npm run lint` — run `next lint`. **Currently broken** on this Next.js 16.2.10 / eslint-config-next / ESLint 9.39 combination, pre-existing and unrelated to app code (`next lint` fails with "Invalid project directory"; running `eslint` directly hits a circular-JSON error in `@eslint/eslintrc`'s legacy compat shim). Confirmed broken on the bare scaffold too — not something to "fix" as part of an unrelated task without calling it out first.
- `npm run preview` — build with `opennextjs-cloudflare` and preview locally under the actual Cloudflare Workers runtime (use this, not `next start`, to validate Cloudflare-specific behavior like bindings and image optimization)
- `npm run deploy` — build and deploy to Cloudflare via `opennextjs-cloudflare`
- `npm run upload` — build and upload a new version to Cloudflare without deploying it
- `npm run cf-typegen` — regenerate `cloudflare-env.d.ts` types from `wrangler.jsonc` bindings (run after adding/changing any binding)
- `npm run generate-content` — regenerate `src/generated/posts.json` (frontmatter index) from `content/posts/*.mdx`; runs automatically before dev/build/preview/deploy/upload
- `npm run sync-content` — regenerate `d1/seed.sql` from `content/posts/*.mdx`, for the D1 search index (see Architecture below). Apply with `wrangler d1 execute twolosttourists-blog --local/--remote --file=d1/seed.sql`

There is no test setup in this repo yet.

## Architecture

- **Framework**: Next.js App Router (`src/app/`), TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`), path alias `@/*` → `./src/*`.
- **Deployment target**: Cloudflare Workers, not Vercel/Node, via `@opennextjs/cloudflare`, which converts the Next.js build output into a Worker (`.open-next/worker.js`, referenced as `main` in [wrangler.jsonc](wrangler.jsonc)). Static assets are served via the `ASSETS` binding pointing at `.open-next/assets`.
- **Local Cloudflare bindings in `next dev`**: [next.config.ts](next.config.ts) calls `initOpenNextCloudflareForDev()` so that `getCloudflareContext()` works while running the plain `next dev` server, without needing `wrangler dev`.
- **Bindings/config**: [wrangler.jsonc](wrangler.jsonc) is the source of truth for Cloudflare bindings. `d1_databases` (binding `DB`, database `twolosttourists-blog`) is configured for the blog search index — see below. KV/R2/vars/services templates remain commented out, unused. After adding a binding, update `wrangler.jsonc` and re-run `npm run cf-typegen` to refresh `cloudflare-env.d.ts` (a large generated file — do not hand-edit it).
- **Env vars for local dev**: `.dev.vars` (gitignored, based on `.dev.vars.example`) is loaded by `wrangler`/OpenNext for `NEXTJS_ENV` and other local secrets — do not commit real values here.
- **Observability**: `wrangler.jsonc` has `observability.logs` and `observability.traces` enabled with `persist: true`, but the top-level `observability.enabled` flag is currently `false`.
- **Images**: Cloudflare Images is the CDN and origin store for photos. `next.config.ts` sets a **custom** `next/image` loader (`src/lib/cloudflare-image-loader.ts`) rather than OpenNext's own Images-binding optimizer, since photos are already optimized/cached by Cloudflare Images itself — re-optimizing through `/_next/image` would double-process them. The loader maps requested widths to a small set of **named** Cloudflare Images variants (`sm`/`md`/`lg`) rather than passing arbitrary `w=` params through, per the flexible-variant restriction above. Requires `NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL` in `.env.local` (see `.env.example`) — a Next.js build-time var, not a `.dev.vars`/Wrangler binding, since the loader runs outside the Worker binding runtime.
- **Blog content pipeline**: Posts are MDX files with frontmatter under `content/posts/*.mdx` (`title`, `date`, `excerpt`, `tags`, optional `draft`/`coverImageId`). No separate `category` field — every post's `tags` includes exactly one of `restoration` or `road-trip` plus topical tags; `/blog/tag/[tag]` serves both the two nav sections and ordinary tags.
  - **Rendering**: MDX bodies are compiled to plain JS at build time via `@next/mdx` (configured in `next.config.ts` with `remark-frontmatter` + `remark-gfm`, passed as **string** plugin names — required for Turbopack) and loaded via a dynamic `import(`@content/posts/${slug}.mdx`)` in `src/app/blog/[slug]/page.tsx`. Global MDX component overrides (incl. a `Figure` component requiring `alt` text — reinforces the "action and part, never the person" caption rule) live in the required `src/mdx-components.tsx` convention file.
  - **Do not use `next-mdx-remote` or any runtime MDX compiler** (e.g. `evaluate`/`compile` called per-request). Cloudflare Workers' V8 isolates disallow dynamic code generation (`new Function`/`eval`) with no compat flag to re-enable it — runtime MDX compilation throws `EvalError: Code generation from strings disallowed for this context`. MDX must be compiled ahead of time by the bundler.
  - **Do not read `content/` with `fs.readdirSync`/`readFileSync` at request time** — the Workers `nodejs_compat` polyfill doesn't implement `readdirSync` (throws `[unenv] fs.readdirSync is not implemented yet!`), and even routes that look purely static can still have their page function executed inside the Worker at request time (not just at build), so this isn't limited to routes marked "dynamic". Post frontmatter is instead pre-baked at build time into `src/generated/posts.json` (via `npm run generate-content`, a plain JSON import — no runtime fs) and read through `src/lib/posts.ts`.
- **D1 (search only)**: A `posts` table (`d1/schema.sql`) backs `/blog/search` — the one genuinely dynamic route (arbitrary keyword `LIKE` query against `env.DB`). Every other blog route (index, tag, post) is fully static-generated via `generateStaticParams` reading `src/generated/posts.json` at build time — no DB read needed there, so don't add one. Binding name is `DB`. Content syncs into D1 via `npm run sync-content` → `d1/seed.sql` (committed, generated — do not hand-edit), applied manually with `wrangler d1 execute`; there's no Wrangler D1 migrations setup for this one small denormalized index table.
- **Photo guardrail**: `.gitignore` blocks raw photo extensions under `content/**` so an original camera file can't be accidentally committed alongside a post.

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
