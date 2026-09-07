# 01 — MVP Visual Screens

**State:** Approved
**Depends on:** —
**Date:** 2026-09-07

**Objective:** Port the five screens from `references/templates/` (library, game detail, player HUD, auth, hall of fame) into real Next.js App Router routes as a purely visual/mock MVP, with no actual playable game logic.

## Scope

**In:**

- Next.js App Router pages for all 5 screens from the prototype:
  - `/` — Library (`biblioteca.jsx` → game grid, search, category filter)
  - `/juegos/[id]` — Game Detail (`detalle.jsx` → game info + leaderboard sidebar)
  - `/juegos/[id]/jugar` — Player (`reproductor.jsx` → CRT-style HUD with **simulated** fake score progress, pause, game-over modal, save score)
  - `/iniciar-sesion` — Auth (`auth.jsx` → login/signup tabs, guest button, decorative social buttons)
  - `/salon-fama` — Hall of Fame (`salon.jsx` → per-game podium + leaderboard table)
- Shared `Nav` component (logo, links, credits counter, mobile hamburger menu) and footer, both in `app/layout.tsx`.
- Porting `data.jsx` (GAMES, CATS, PLAYERS, `seededScores`) to a typed `lib/data.ts`.
- Porting `styles.css` (CSS variables, neon/retro look, Google Fonts: Press Start 2P, Courier Prime, JetBrains Mono, animations) into the project's global styles, applied via Next.js font loading conventions and `app/globals.css`.
- Client-side only auth mock: any submitted username "logs in" (no validation, no real backend), persisted to `localStorage` under `av_user`, matching the prototype.
- Score "saving" from the player screen persisted to `localStorage` under `av_scores`, matching the prototype (display-only — the Hall of Fame and Detail leaderboards keep using the same seeded mock data as the prototype, they do not read `av_scores`).
- The player screen's fake score simulation (`setInterval` incrementing score, level-up thresholds, pause/resume, game-over modal, save-score form) ported as-is — it is a visual mock, not a real game.
- Decorative GOOGLE/GITHUB buttons on the Auth screen, rendered with no click behavior (or disabled).
- All existing Spanish copy from the templates preserved as-is.

**Not in:**

- Any real, playable game (no canvas/game loop tied to actual input/collision/rules for any of the 8 games listed in `data.jsx`).
- Real authentication/backend (no API routes, no database, no real OAuth for Google/GitHub).
- Real leaderboard computation from saved scores — Hall of Fame and Detail leaderboards keep showing seeded mock rows exactly like the prototype.
- Responsive/interaction QA beyond what the prototype already implements (no new breakpoints or behaviors invented).
- Any new screens or routes not present in `references/templates/`.

## Data model

New typed module `lib/data.ts`, ported 1:1 from `references/templates/data.jsx`:

```ts
export type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;
  color: 'cyan' | 'magenta' | 'green' | 'yellow';
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[];
export const CATS: readonly ['TODOS', 'ARCADE', 'PUZZLE', 'SHOOTER', 'VERSUS'];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Client-side persistence helpers in `lib/storage.ts`, wrapping `localStorage` access behind `getUser`/`setUser`/`clearUser` and `saveScore` (keys `av_user`, `av_scores`, matching the prototype's shape: `{ name: string }` for user, `{ game: string; score: number; name: string; at: number }[]` for scores).

## Implementation plan

1. Add Google Fonts (Press Start 2P, Courier Prime, JetBrains Mono) via Next.js font conventions (check `node_modules/next/dist/docs/01-app` for the current API before implementing) and port `styles.css` into `app/globals.css` (or an imported stylesheet), preserving all CSS variables, animations, and class names used by the ported components.
2. Create `lib/data.ts` (typed port of `data.jsx`) and `lib/storage.ts` (localStorage helpers for `av_user` / `av_scores`).
3. Build `components/Nav.tsx` (client component: mobile menu state, active-link highlighting, sign-out) and wire it plus the footer into `app/layout.tsx`.
4. Build `/` (`app/page.tsx`): port `Library` + `GameCard` from `biblioteca.jsx`, using `next/link` to navigate to `/juegos/[id]`.
5. Build `/juegos/[id]` (`app/juegos/[id]/page.tsx`): port `GameDetail` from `detalle.jsx`, reading the game from `lib/data.ts` by route param, 404 (Next.js `notFound()`) if the id doesn't exist.
6. Build `/juegos/[id]/jugar` (`app/juegos/[id]/jugar/page.tsx`): port `GamePlayer` from `reproductor.jsx` as a client component, keeping the fake score simulation, pause, game-over modal and save-score flow (writing to `lib/storage.ts`).
7. Build `/iniciar-sesion` (`app/iniciar-sesion/page.tsx`): port `Auth` from `auth.jsx` as a client component, wiring login/guest submit to `lib/storage.ts` and redirecting to `/` on success.
8. Build `/salon-fama` (`app/salon-fama/page.tsx`): port `HallOfFame` from `salon.jsx`, using the currently logged-in user (via `lib/storage.ts`) for the "your best score" row.
9. Manual pass through all 5 routes in the browser (desktop + mobile width) comparing against `references/templates/Arcade Vault.html` opened directly, checking nav, filters, detail, fake player flow, auth, and hall of fame all render and navigate correctly.

## Acceptance criteria

- [ ] `/` renders the game grid with working search input and category chips, matching the prototype's cards.
- [ ] Clicking a game card navigates to `/juegos/<id>` showing that game's detail, tags, stats, and a seeded leaderboard.
- [ ] `/juegos/<id>` for a non-existent id returns a 404.
- [ ] "JUGAR AHORA" navigates to `/juegos/<id>/jugar`, which shows the CRT HUD with score auto-incrementing, pause/resume working, and a game-over modal with a save-score form that persists to `localStorage` (`av_scores`).
- [ ] `/iniciar-sesion` lets a user submit any username and be redirected to `/` logged in (name shown in Nav), or continue as guest; state persists across a page reload via `localStorage` (`av_user`).
- [ ] `/salon-fama` shows per-game tabs, a 3-slot podium, and a full leaderboard table, plus a highlighted "your score" row when logged in.
- [ ] Nav (logo, links, credits counter, mobile hamburger menu) and footer render identically across all 5 routes via the shared layout.
- [ ] No game is actually playable — the player screen's progress is the same fake simulation as the prototype, not real gameplay tied to user input.
- [ ] Visual result matches `references/templates/Arcade Vault.html` when opened side-by-side (fonts, colors, neon effects, layout).

## Decisions taken and discarded

- **Real App Router routes instead of the prototype's hash router** — chosen because this is a Next.js project with the App Router already scaffolded; using real routes is idiomatic and enables `notFound()`, `next/link`, and proper URLs.
- **Keep the player screen's fake score simulation** — discarded building a static/frozen HUD, because the fake simulation is still purely visual (no real game mechanic) and matches the prototype's intended feel more closely.
- **localStorage persistence, matching the prototype** — discarded in-memory-only state, to preserve the prototype's behavior of surviving a page reload; still no backend.
- **TypeScript (.tsx) for all new components** — discarded plain `.jsx`, to stay consistent with the project's existing TypeScript scaffold (`tsconfig.json`).
- **Decorative, inert GOOGLE/GITHUB buttons** — discarded omitting them, to preserve the prototype's visual completeness; no OAuth wiring since there's no backend in scope.
- **Hall of Fame / Detail leaderboards keep using seeded mock data, not real saved scores** — matches the prototype exactly (`seededScores`) and avoids inventing a leaderboard-computation feature that's out of scope for a visual-only MVP.
