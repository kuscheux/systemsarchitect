# SUPAFI-AI

**Subcontractors' Unified Platform Advancing Field Intelligence** — research build 001.
First project: **Magnolia** (Charleston, SC) · first trade: **1CG Glazing & Cladding — one company, one package.**

## Run it

Double-click `index.html` (works from disk), or for best results serve it:

```bash
cd SUPAFI-AI && python3 -m http.server 8080
# → http://localhost:8080
```

Internet is needed for the basemap, motion runtime and Lumabuilt swatch thumbnails; everything else (blueprints, 3D model, CRM) is generated locally and degrades gracefully offline.

## What's inside

- **Role gate (RBAC)** — Admin / PM / Estimator / Field / GC-Client seats with permission-gated CRM edits, finish changes, uploads and presentation access. Locked trades shown as coming soon.
- **01 Pin** — the same living map language as the 1CG site (OpenFreeMap positron + 3D extrusions), delivered portfolio as quiet dots, **Magnolia as a pulsing amber PENDING pin**. Click the pin → jumps to the deal.
- **02 Intake** — the A5 elevation set regenerated as interactive vector blueprints (magenta scope / yellow Mosaic V Plank / teal perf screening / red missile datum). Drop zone feeds the single-source photo library.
- **03 Takeoff** — auto-extracted quantities with animated counters (1,690.2 sf plank · 4,739 sf perf screening · glazing zones by missile rating). Hover a row, the 3D model lights up.
- **04 Model** — parametric Three.js building generated from the same data as the blueprints. Scroll assembles it level by level (HUD reads the EL datum). Takeoff X-Ray mode recolors the model like the drawings. Missile-zone overlay included.
- **05 Materials** — live Lumabuilt library (real Mosaic Woodgrains / Solids / Visage ACM finishes + thumbnails). Swatch click retextures the plank, screening, spandrels or penthouse in place; selections persist and flow into the presentation.
- **06 Scope** — schedule of types (CW/WW/SF storefront + MP/PG/SP cladding) with missile ratings and basis-of-design callouts.
- **07 Pipeline** — CRM around the pin: stage stepper (pending pulses amber), deal facts, contacts, activity feed, field notes, photo single-source. Persists in `localStorage`.
- **08 Present** — compiles pin + model snapshot + takeoff + finishes + types into a print-ready client presentation (Print → PDF).

## Curtain language (motion.dev "Curtains" set)

Chapter jumps and view flips use the full set: **fade** (map), **blinds** (intake), **stagger wipe** (takeoff), **doors** (model flip), **shutter** (materials flip), **iris / iris-from-click** (scope, role entry, pin click), **clip wipe** (pipeline), **wipe** (presentation), **pixels** (photo lightbox), **mixed** available in the engine. Falls back to WAAPI if the motion CDN is unreachable; respects `prefers-reduced-motion`.

## Blueprint ↔ 3D

Takeoff, Materials and Scope stages carry a corner tab — flip between the vector elevation and the live model with that chapter's curtain effect. One renderer travels between stages.

## Honest numbers

Quantities were auto-extracted from the elevation set (93.2 / 116.7 / 17.5 sf plank bands; 518.9 / 2,498.3 / 1,007.9 / 271.3 / 442.6 sf screening; glazing areas estimated). **Verify against contract documents before bid day.** ESWindows / Lumabuilt references are basis-of-design placeholders to confirm with manufacturers.

## Next

Wire the deal object to Supabase (schema = `CRM_SEED`), real CRM sync, per-project routing (`/magnolia` → many pins, many packages), field check-ins from the pin, and photo OCR into takeoff.
