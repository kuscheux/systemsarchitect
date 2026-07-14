# Magnolia Landing Exterior Envelope Presentation

A client-facing, full-viewport presentation experience for 1CG's Magnolia Landing exterior envelope proposal.

This build is intentionally focused on presentation clarity, not project management. It explains the project scope, systems, materials, sequencing, fabrication process, and quality approach in a polished, swipe-based format using the existing 1CG website visual language.

## Run

```bash
npm install
npm run dev
```

or open the static export if provided.

*(This build is the static export — double-click `index.html`, or serve it with `python3 -m http.server` from this folder.)*

## Experience

This is a full-screen presentation, not a scrolling website.

On desktop, each section fills the entire viewport. Mouse wheel, trackpad, keyboard arrows, and navigation controls move between complete presentation views.

On mobile and tablet, users swipe between full-screen sections.

## Sections

1. Cover / Hero
2. Project Overview
3. Exterior Scope Map
4. Scope Summary
5. System Components
6. Design Assist / Material Review
7. Installation Strategy
8. Typical Installation Flow
9. Fabrication Process
10. Coordination Matrix
11. Similar Project Experience
12. Quality / Closeout
13. Closing Slide

## Scope

Magnolia Landing includes curtainwall, glazing, storefront / entrance systems, ACM, garage screening, and wood-grain soffit / plank systems.

Preliminary cladding and screening quantities are shown for planning discussion only and should be verified against final contract documents and approved shop drawings.

## Design Assist

Material cards and finish options are shown for review only. They are not approval workflows. Final finish selections will be coordinated with the project team during design assist.

## Installation Language

Installation sequencing is shown as a planning-level strategy. Final sequencing will be coordinated with structural progress, slab-edge verification, embed locations, approved shop drawings, manpower planning, and material delivery.

## Editing

Presentation content should be easy to update. Editing can be handled through JSON data files or a simple internal edit mode.

Version history may be represented as simple presentation revisions for now.

## Deferred Features

The following are intentionally not part of this MVP:

* CRM pipeline
* RBAC
* Supabase real-time sync
* Client approvals
* Multi-tenant routing
* Field check-ins
* OCR takeoff
* Full BIM / 3D model
* Live manufacturer API integrations

Those may be future platform features, but this build is focused on helping the team present Magnolia clearly and confidently.
