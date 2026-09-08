# 02 — Home Page

**State:** Implemented
**Depends on:** SPEC 01
**Date:** 2026-09-07

**Objective:** Port the landing Home page from `references/templates/home-about/home.jsx` into the real `/` route, moving the existing Library from `/` to `/games` and renaming the Spanish `/juegos` route segment to `/games` throughout.

## Scope

**In:**

- New landing page at `/` (`app/page.tsx`), ported from `references/templates/home-about/home.jsx`: hero with floating pixel silhouettes and CTAs, "why Arcade Vault" feature grid, games preview rail (first 6 games from `lib/data.ts`), stats block, live-activity ticker + top-players list, pricing/FAQ section, final CTA.
- All content in this section is static mock data ported as-is from the template (stats numbers, activity ticker rows, top-players rows, pricing copy, FAQ copy) — none of it is derived from `lib/data.ts` except the 6 games shown in the preview rail.
- Scroll-reveal behavior (`useReveal` IntersectionObserver hook adding an `in` class to `.reveal` elements) ported from the template.
- Route restructuring:
  - Current Library (today's `app/page.tsx`) moves to `app/games/page.tsx`, served at `/games`.
  - `app/juegos/[id]/page.tsx` moves to `app/games/[id]/page.tsx`, served at `/games/[id]`.
  - `app/juegos/[id]/jugar/page.tsx` moves to `app/games/[id]/jugar/page.tsx`, served at `/games/[id]/jugar`.
  - All internal navigation (`router.push`, `Link href`) referencing `/juegos/...` updated to `/games/...` (in the moved Library, `components/GamePlayer.tsx`, and anywhere else `/juegos` is referenced).
- `components/Nav.tsx` updated: add an "Inicio" link pointing to `/`, repoint the existing "Biblioteca" link to `/games`, and fix the active-link logic so `/` highlights "Inicio" and `/games*` highlights "Biblioteca" (today `/` incorrectly highlights "Biblioteca").
- New CSS ported from `references/templates/home-about/styles.css` into `app/globals.css`: only the selectors not already present (`.home-*`, `.feature-grid`/`.feature-card`, `.mini-rail`/`.mini-card`, `.activity-grid`/`.activity-card`/`.ticker`/`.top-list`, `.pricing-grid`/`.price-card`/`.pricing-faq`, `.reveal`/`.in`, and their supporting animations). Existing CSS variables and theme rules already in `app/globals.css` are reused as-is, not redefined.

**Not in:**

- The About/Contact page (`about.jsx`) — deferred to its own future spec.
- Any change to `/games/[id]`, `/games/[id]/jugar`, `/salon-fama`, or `/iniciar-sesion` page content beyond the path rename (their internals are untouched).
- Renaming any other Spanish route segment (`salon-fama`, `iniciar-sesion`) — only `juegos` → `games` is in scope.
- Deriving the stats/activity/pricing sections from real data or making the pricing section interactive — all static, matching the template.
- Any backend, API route, or persistence change.

## Data model

No new data structures. The Home page reuses the existing `GAMES` export from `lib/data.ts` (`GAMES.slice(0, 6)` for the preview rail) and otherwise renders inline static arrays ported directly from `home.jsx` (feature cards, stats, activity ticker rows, top-players rows, pricing FAQ) — no new types needed.

## Implementation plan

1. Move `app/juegos/[id]/page.tsx` → `app/games/[id]/page.tsx` and `app/juegos/[id]/jugar/page.tsx` → `app/games/[id]/jugar/page.tsx`, removing the now-empty `app/juegos/` directory.
2. Move the current `app/page.tsx` (Library) content to `app/games/page.tsx`, updating its `router.push` call from `/juegos/${game.id}` to `/games/${game.id}`.
3. Update `components/GamePlayer.tsx` and any other remaining reference to `/juegos` to use `/games`.
4. Update `components/Nav.tsx`: add an "Inicio" link to `/`, change the "Biblioteca" link's `href` to `/games`, and fix `isActive` so `/` matches "Inicio" and only `/games*` matches "Biblioteca" (both desktop links and the mobile panel).
5. Port the needed selectors from `references/templates/home-about/styles.css` into `app/globals.css` (feature grid, mini rail, stats, activity, pricing, reveal/scroll-in classes, floating-silhouette animations), skipping anything already defined for the existing theme.
6. Create the new `app/page.tsx`: port `Home`, `FloatingSilhouettes`, `MiniCard`, and `FeatureIcon` from `home.jsx` as a client component, using `GAMES` from `lib/data.ts` for the preview rail and `useRouter().push` for the CTA buttons ("Explorar juegos" → `/games`, "Crear cuenta" → `/iniciar-sesion`, "Ver todos los juegos" → `/games`, "Ver salón" → `/salon-fama`, final CTA → `/games`).
7. Manual pass in the browser: confirm `/` renders the new Home page with working scroll-reveal and CTA navigation, `/games` renders the Library at its new path, `/games/[id]` and `/games/[id]/jugar` still work, and Nav highlights "Inicio" vs "Biblioteca" correctly on each route.

## Acceptance criteria

- [ ] `/` renders the ported Home page (hero, why-section, games preview rail, stats, live activity, pricing, final CTA) instead of the Library.
- [ ] `/games` renders the same Library (search + category filter + game grid) that previously lived at `/`.
- [ ] `/games/<id>` and `/games/<id>/jugar` work exactly as `/juegos/<id>` and `/juegos/<id>/jugar` did before the move; the `/juegos/*` routes no longer exist.
- [ ] All in-app links/buttons that used to point to `/juegos/...` now point to `/games/...`, with no dead links.
- [ ] Home's "Explorar juegos", "Ver todos los juegos", and final CTA buttons navigate to `/games`; "Crear cuenta" navigates to `/iniciar-sesion`; "Ver salón" navigates to `/salon-fama`.
- [ ] Home's games-preview rail shows the first 6 games from `lib/data.ts` with correct cover/title/category.
- [ ] Nav shows "Inicio" as active on `/` and "Biblioteca" as active on `/games` and its sub-routes (desktop and mobile menu).
- [ ] Scroll-reveal sections on Home animate into view on scroll, matching the prototype.
- [ ] Visual result matches `references/templates/home-about/home.jsx` (via `arcade-vault-standalone.html`) side-by-side (fonts, colors, neon effects, layout, floating silhouettes).

## Decisions taken and discarded

- **Home replaces Library at `/`; Library moves to `/games`** — chosen per user decision, matching the template's intended landing-page role for Home; discarded keeping Library at `/` and adding Home at a secondary path, which would leave the template's own navigation model unmatched.
- **`/juegos` renamed to `/games` (English)** — chosen per explicit user instruction; the `jugar` sub-segment is left as-is since only the `juegos` segment was called out for renaming.
- **About/Contact page deferred to its own spec** — discarded bundling it here, to keep this spec's scope to one screen and one routing change.
- **Home's stats/activity/pricing sections stay hardcoded mock content** — discarded deriving them from `lib/data.ts` or real computed data, consistent with spec 01's precedent of visual-only mock content with no backend.
- **No new data types** — the Home page only needs `GAMES` (already typed) plus static literal arrays local to the component, so `lib/data.ts` is unchanged.
