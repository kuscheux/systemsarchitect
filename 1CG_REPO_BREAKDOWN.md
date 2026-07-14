# 1CG Website Repo Breakdown

Prepared for the June 8 executive dinner conversation.

This repo is a rebuilt 1CG website and early growth-platform foundation. It is not just a brochure site. It combines a public marketing site, project proof architecture, a custom Southeast coverage map, preconstruction intake, admin review surfaces, Supabase wiring, and the beginnings of a client/account layer. The practical value is simple: it makes 1CG look and operate more like the $100M version of the company it is trying to become.

## What this site is meant to prove

The current business problem is not that 1CG needs “a prettier website.” The business problem is that 1CG has real assets that are under-presented: national ranking, a 100,000 sq ft fabrication facility, Charlotte/Charleston/Atlanta coverage, project history, preconstruction capability, and Southeast expansion potential.

This repo turns those assets into a system:

- **Public proof**: the site gives general contractors, developers, owners, and recruits a clearer picture of what 1CG does.
- **Project credibility**: projects are structured as reusable proof assets instead of one-off gallery images.
- **Operational intake**: preconstruction opportunities can be captured and reviewed instead of being buried in email.
- **Data foundation**: Supabase utilities are already present for authentication, server access, and future CMS-style workflows.
- **Custom coverage story**: the map is now first-party and brand-owned. It no longer depends on Mapme, Leaflet, OpenStreetMap tile embeds, or any third-party map UI.

## Repo line items

| Area | Path | What it does | Why it matters |
|---|---|---|---|
| App shell | `src/app/layout.tsx` | Defines global page metadata and the root layout used by every page. | Keeps the site consistent and removes fragile external font fetching. |
| Global styling | `src/app/globals.css` | Holds the base theme, Tailwind import, reusable card styles, animation primitives, and typography variables. | Gives the site a controlled visual system instead of page-by-page styling drift. |
| Homepage | `src/app/page.tsx` | Entry route for the public site. | Main executive-facing first impression. |
| Homepage experience | `src/components/landing/scroll-showcase.tsx` | Runs the long-form homepage sections and includes the custom project map. | This is the main storytelling layer: proof, scale, project presence, and market positioning. |
| Site navigation shell | `src/components/site-shell.tsx` | Shared wrapper for public interior pages. | Keeps navigation and page structure consistent. |
| Project index | `src/app/projects/page.tsx` | Public project listing page. | Turns the portfolio into a browsable proof library. |
| Project detail route | `src/app/projects/[slug]/page.tsx` | Dynamic page for individual projects. | Lets each project become a case-study asset over time. |
| Project data | `src/data/projects.ts` | Central structured data file for project names, slugs, markets, regions, locations, descriptions, and related copy. | This is the current source of truth for portfolio content. It can later move into Supabase or another CMS. |
| Project cards | `src/components/project-card.tsx` | Reusable project summary component. | Prevents inconsistent project presentation across pages. |
| Project explorer | `src/components/project-explorer.tsx` | Search/filter-style project browsing component. | Makes the portfolio more useful than a static gallery. |
| Custom coverage map | `src/components/real-locations-map.tsx` | Renders 1CG offices and project locations from internal data using custom HTML/SVG. | Replaces vendor map dependency with a brand-owned territory visual. |
| Services page | `src/app/services/page.tsx` | Public services route. | Gives GCs and owners a clearer scope of what 1CG can deliver. |
| Markets page | `src/app/markets/page.tsx` | Public market-sector route. | Supports SEO and vertical positioning by project type. |
| Facility page | `src/app/facility/page.tsx` | Public fabrication facility route. | Makes the 100,000 sq ft facility a visible competitive asset. |
| Company page | `src/app/company/page.tsx` | Public company positioning route. | Supports founder story, locations, safety, quality, and values. |
| Careers page | `src/app/careers/page.tsx` | Public recruiting route. | Helps 1CG present itself as a serious place to work. |
| Contact page | `src/app/contact/page.tsx` | Public inquiry form route. | Gives prospects a project-starting path. |
| Preconstruction page | `src/app/preconstruction/page.tsx` | Public preconstruction intake route. | Moves serious project opportunities closer to structured intake. |
| Preconstruction form | `src/app/preconstruction/precon-intake-form.tsx` | Captures preconstruction opportunity information. | Converts “contact us” into a more useful qualification workflow. |
| Admin preconstruction page | `src/app/admin/preconstruction/page.tsx` | Internal review surface for submitted opportunities. | Gives the team an early admin layer instead of making every inquiry email-only. |
| Admin actions | `src/app/admin/preconstruction/review-actions.tsx` | Server actions for reviewing opportunities. | Begins the workflow layer needed for real operations. |
| Opportunity model | `src/lib/precon-opportunities.ts` | Shared logic/types for preconstruction opportunities. | Keeps intake and admin review aligned. |
| Login page | `src/app/login/page.tsx` | Login route. | Starts the account/client layer. |
| Login form | `src/app/login/login-form.tsx` | Handles login UI. | Prepares the repo for authenticated workflows. |
| Account page | `src/app/account/page.tsx` | Logged-in account surface. | Early foundation for future client-facing access. |
| Sign-out button | `src/app/account/sign-out-button.tsx` | Account sign-out UI/action. | Completes the basic account loop. |
| Auth callback | `src/app/auth/callback/route.ts` | Handles auth callback routing. | Required for Supabase-style auth flows. |
| Auth error page | `src/app/auth/auth-code-error/page.tsx` | Shows auth failure state. | Makes auth failures explainable instead of broken. |
| Supabase browser client | `src/lib/supabase/client.ts` | Client-side Supabase helper. | Lets browser components talk to Supabase safely. |
| Supabase server client | `src/lib/supabase/server.ts` | Server-side Supabase helper. | Supports server-rendered authenticated data. |
| Supabase service client | `src/lib/supabase/service.ts` | Server-only elevated access helper. | Supports admin/review workflows. Must protect service key. |
| Supabase env guard | `src/lib/supabase/env.ts` | Centralizes required environment variables. | Prevents silent misconfiguration. |
| Supabase proxy/helper | `src/lib/supabase/proxy.ts` and `src/proxy.ts` | Supports request/session handling. | Part of the auth/data plumbing. |
| Visual helpers | `src/components/blur-word.tsx`, `src/components/fade-image.tsx`, `src/components/logo-intro.tsx` | Small reusable presentation components. | Adds polish without scattering animation logic everywhere. |
| Virtual/aerial pages | `src/app/tour/page.tsx`, `src/app/virtual-aerial-tour/page.tsx` | Routes for visual facility/project storytelling. | Useful for drone media, facility walkthroughs, or proof-engine demos. |
| Database seed/schema | `supabase-precon-opportunities.sql` | SQL support for preconstruction opportunities. | Gives the Supabase workflow a deployable database starting point. |
| Environment template | `.env.example` | Lists required Supabase variables. | Makes the repo easier to hand off without exposing secrets. |
| Project rules | `AGENTS.md`, `CLAUDE.md` | Notes for AI/code assistants working in the repo. | Helps prevent future agents from using stale Next.js assumptions. |
| Package manifest | `package.json` | Defines dependencies and scripts. | The dependency list is now lean: Next, React, Supabase, Lucide, Tailwind, TypeScript, ESLint. |

## What changed in this pass

| Change | Files touched | Plain-English result |
|---|---|---|
| Removed map vendor dependency | `package.json`, `package-lock.json` | Removed `leaflet` and `@types/leaflet`. |
| Removed map vendor import | `src/app/layout.tsx` | Removed the global Leaflet stylesheet import. |
| Removed old vendor map styles | `src/app/globals.css` | Deleted Leaflet-specific tile, popup, zoom-control, and marker CSS. |
| Replaced map implementation | `src/components/real-locations-map.tsx` | Rebuilt the map as a custom 1CG coverage graphic driven by internal project data. |
| Removed external build-time font fetch | `src/app/layout.tsx`, `src/app/globals.css` | Removed `next/font/google` so the build is not dependent on fetching Google fonts during deployment. |

## Custom map notes

The map is now a branded Southeast coverage visualization, not an embedded map product. It uses the project data already in the repo, calculates point positions internally, shows project pins, shows the three office bases, and links users to either the relevant project page or Google directions when needed.

This is the right compromise for Monday:

- **Cleaner story**: 1CG owns the coverage visual instead of relying on a map vendor.
- **Less vendor risk**: no Mapme, no Leaflet, no OpenStreetMap tile layer, no tile attribution UI, no map CSS import.
- **Better positioning**: the map reads like a market footprint and sales-territory asset, not a generic contact-page embed.
- **Future-ready**: when projects move into Supabase, the same component can render from live data instead of `projects.ts`.

## Current technical stack

| Layer | Current implementation | Notes |
|---|---|---|
| Framework | Next.js 16 App Router | Modern React/Next architecture. |
| UI | React 19 + Tailwind CSS 4 | Componentized and responsive. |
| Icons | Lucide React | Lightweight, consistent icon system. |
| Data | Local TypeScript project data plus Supabase helpers | Good current foundation; CMS migration can come later. |
| Auth/data backend | Supabase SSR/client/server/service helpers | Already pointed toward account/admin/client workflows. |
| Forms/workflows | Preconstruction intake and admin review | Stronger than a basic contact form. |
| Map | Custom first-party HTML/SVG coverage map | Vendor map dependency removed. |
| QA scripts | `npm run lint`, `npx tsc --noEmit`, `npm run build` | Lint and TypeScript pass. Local production build is blocked by Mac sandbox process restrictions, not by TypeScript or lint errors. |

## What is real today versus what is next

| Capability | Status | Reality check |
|---|---|---|
| Public marketing site | Built | Pages and components exist. |
| Project portfolio structure | Built | Project data is centralized in `src/data/projects.ts`. |
| Custom project map | Built | Map vendor removed and replaced with first-party rendering. |
| Preconstruction intake | Built foundation | Form/admin structure exists; production readiness depends on Supabase table/env setup. |
| Supabase integration | Wired | Helpers and env patterns exist; real data use depends on configured credentials and schema. |
| Client portal | Early foundation | Login/account/auth routes exist, but a full client portal still needs project-scoped data, permissions, media, documents, and notification flows. |
| CMS/content engine | Planned foundation | Current content is code/data-file driven. Supabase or another CMS can become the source of truth later. |
| Drone/media pipeline | Strategy-ready | The repo has routes/components that can showcase it, but automated media ingestion is not yet implemented. |
| AI-generated pages | Strategy-ready | The structure supports templated project pages, but agent-driven page creation still needs a formal content model and approval flow. |

## How to explain this at dinner

Say this:

> “The site is not just a redesign. It is the first layer of a growth operating system. The public site makes 1CG look like the company it already is operationally. The project data structure turns the portfolio into reusable proof. The preconstruction intake starts moving opportunities into a system. The account/auth layer sets up the future client portal. And the map is now custom, so 1CG owns the territory story instead of embedding a generic vendor map.”

Then pause and ask:

> “If 1CG were already doing $100M, what would you want the market to believe immediately when they land on this site?”

That keeps the conversation strategic. It also stops the meeting from becoming a page-by-page website review.

## Suggested Monday framing

Do not sell this as “I built a website.” Sell it as the first proof that you can run 1CG’s public growth layer.

Line-item framing:

1. **Brand credibility**: the site now presents 1CG as a serious Southeast glazing and facade contractor.
2. **Project proof**: projects can become structured case studies, not just images.
3. **Facility proof**: the fabrication facility can become a sales asset.
4. **Territory proof**: the custom map makes Charlotte, Charleston, Atlanta, and Southeast coverage visible.
5. **Preconstruction intake**: inbound opportunities can become structured data.
6. **Admin review**: internal review can move beyond email.
7. **Client/account foundation**: the repo is already pointed toward a future portal.
8. **Supabase foundation**: the data layer can support CMS, intake, admin, and portal work.
9. **No map vendor**: the map is now first-party and not dependent on Mapme or Leaflet.
10. **Growth retainer logic**: the site is the foundation; ongoing work is the proof engine, case studies, media, SEO, GC targeting, precon workflows, and client portal buildout.

## Verification completed

| Check | Result |
|---|---|
| `npm run lint` | Passed. |
| `npx tsc --noEmit` | Passed. |
| Vendor map search | No `leaflet`, `Mapme`, `Mapbox`, `OpenStreetMap`, or `tileLayer` references remain in `src`, `package.json`, or `package-lock.json`. |
| Production build | Attempted. The Mac sandbox blocked Next’s build worker/process behavior with `EPERM`. This appears environment-related. Lint and TypeScript checks passed after the code changes. |

## Immediate next work

| Priority | Next item | Why it matters |
|---|---|---|
| High | Confirm Supabase env values and run the SQL schema. | Makes intake/admin real instead of just structurally present. |
| High | Add 3 polished project case studies. | This is the highest-value sales proof. |
| High | Turn facility page into a serious fabrication proof page. | The 100,000 sq ft facility should feel like a moat. |
| Medium | Add real contact form submission handling. | Prevents the contact page from being only visual. |
| Medium | Add metadata/SEO per route. | Helps the site perform beyond the meeting demo. |
| Medium | Create one password-protected sample client project page. | Lets Mike see the portal vision without needing the full system yet. |
| Medium | Add a project media model. | Prepares for drone/photo/video proof workflows. |
| Later | Add notifications and document vault. | Important for the full client collaboration platform, but not required for Monday. |

