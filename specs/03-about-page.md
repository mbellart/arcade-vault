# 03 — About Page

**State:** Implemented
**Depends on:** SPEC 01, SPEC 02
**Date:** 2026-09-14

**Objective:** Port the About/Contact page from `references/templates/home-about/about.jsx` into a real `/about` route, wiring the contact form to send a real email via Resend through a Next.js Route Handler.

## Scope

**In:**

- New page at `/about` (`app/about/page.tsx`), ported from `references/templates/home-about/about.jsx`: hero section (kicker, title, mission text, 3-item highlight row with pixel icons), scroll-reveal divider, and the contact section (intro copy + tips list + contact form).
- Scroll-reveal behavior reusing the existing `.reveal`/`.in` IntersectionObserver pattern already ported in spec 02 (no new hook needed if `useReveal` already exists; otherwise port the `IntersectionObserver` effect from `about.jsx` as-is).
- `components/Nav.tsx` updated: add an "Acerca de" link pointing to `/about` (desktop links and mobile panel), and extend `isActive` so `/about` highlights it.
- New CSS ported from `references/templates/home-about/styles.css` into `app/globals.css`: only the selectors not already present (`.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`/`.highlight`/`.hl-icon`, `.about-divider`/`.div-bar`/`.div-pixels`, `.about-contact`/`.contact-grid`/`.contact-intro`/`.contact-title`/`.contact-sub`/`.contact-tips`/`.tip`/`.tip-led`, `.contact-form` (including `.shake` animation), `.terminal-success`/`.term-bar`/`.term-body`/`.line`/`.caret`). Existing CSS variables and theme rules already in `app/globals.css` are reused as-is.
- Real email sending: the contact form's `onSubmit` calls a new API route `app/api/contact/route.ts` (Next.js Route Handler, `POST`) which validates the payload and sends the message via the `resend` npm package.
- Server-side validation in the route handler: `name`, `email`, and `msg` must be non-empty strings; `email` must match a basic email-format regex. Invalid payloads return `400` with an error message; the API key and Resend call happen only after validation passes.
- Email delivery via Resend: `from: "onboarding@resend.dev"`, `to: "mariobs@gmail.com"`, subject includes the sender's name, body includes name, email, and message. `RESEND_API_KEY` read from `process.env.RESEND_API_KEY` inside the route handler (never exposed to the client).
- `.env.example` added at the repo root documenting `RESEND_API_KEY=` (no real value).
- `resend` added as a runtime dependency in `package.json`.
- Client-side UI states on the contact form, replacing the template's fake `setSent`/`setShake` simulation with real request handling:
  - **Idle:** the form as in the template.
  - **Sending:** submit button shows a disabled/loading state (e.g. "▶ ENVIANDO…") while the `fetch` to `/api/contact` is in flight.
  - **Success:** the existing terminal-style success block (`.terminal-success`) is shown, using the real submitted name, once the API call responds `200`.
  - **Error:** a new terminal-style error block (same visual language as `.terminal-success`, red/magenta accent) shown when the API call fails or returns a non-2xx status, with a message and a way to try again (re-shows the form with previously entered values intact).
  - **Client-side empty-field validation:** kept as in the template (shake animation) before any request is made.

**Not in:**

- Any change to routes/pages other than adding `/about` and updating `Nav.tsx` (Home, Games, Salón de la Fama, Auth pages untouched).
- CAPTCHA, rate-limiting, or anti-spam protection beyond basic server-side field/format validation.
- Persisting contact submissions anywhere (database, localStorage, logs beyond default server logging) — a submission either sends an email or fails; nothing is stored.
- Verifying a custom sending domain in Resend — uses the built-in `onboarding@resend.dev` test sender.
- Creating the Resend account or generating the API key — the user will do this themselves; the spec only wires the integration and documents the env var.
- Any change to `app/globals.css` selectors unrelated to the About/Contact page.

## Data model

No persisted data structures. New request/response shapes local to the API route:

```ts
// app/api/contact/route.ts
type ContactRequestBody = {
  name: string;
  email: string;
  msg: string;
};

// 200 response: { ok: true }
// 400/500 response: { ok: false; error: string }
```

## Implementation plan

1. Add the `resend` package to `package.json` dependencies and install it. Add `.env.example` with `RESEND_API_KEY=` at the repo root.
2. Create `app/api/contact/route.ts`: a `POST` handler that parses the JSON body, validates `name`/`email`/`msg` (non-empty, basic email regex), returns `400` with `{ ok: false, error }` on invalid input, otherwise instantiates `Resend(process.env.RESEND_API_KEY)` and calls `resend.emails.send({ from: "onboarding@resend.dev", to: "mariobs@gmail.com", subject, html/text })`; returns `{ ok: true }` on success or `500` with `{ ok: false, error }` if the Resend call throws.
3. Port the needed selectors from `references/templates/home-about/styles.css` into `app/globals.css` (about hero, highlight row, divider, contact grid, contact form, terminal success block, shake animation), skipping anything already defined.
4. Create `app/about/page.tsx`: port `About` and `HighlightIcon` from `about.jsx` as a client component, replacing the fake `onSubmit` with a real `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })`, adding `sending`/`error` state alongside the existing `sent`/`shake` state, and rendering the new error block when the request fails.
5. Update `components/Nav.tsx`: add an "Acerca de" `Link` to `/about` in both the desktop links and the mobile panel, and extend `isActive` to treat `pathname === "/about"` as active for that link.
6. Manual pass: fill and submit the contact form in the browser with a real (or throwaway) `RESEND_API_KEY` in `.env.local`, confirm a real email arrives at `mariobs@gmail.com`; then temporarily break the key (or disconnect network) to confirm the error state renders and the form can be resubmitted.

## Acceptance criteria

- [ ] `/about` renders the ported hero (kicker, title, mission text, 3 highlight items with icons) and the divider, matching the template.
- [ ] `/about` renders the contact section (intro, tips, form) matching the template's layout and copy.
- [ ] Submitting the form with any empty field triggers the shake animation and makes no network request.
- [ ] Submitting the form with valid data shows a "sending" state, then either the success terminal block (on a `200` response) or a new error terminal block (on a non-2xx response or network failure).
- [ ] On success, a real email is delivered to `mariobs@gmail.com` via Resend, containing the submitted name, email, and message.
- [ ] Posting an invalid payload directly to `POST /api/contact` (missing field or malformed email) returns `400` and does not call Resend.
- [ ] `RESEND_API_KEY` is read only inside `app/api/contact/route.ts` (server-side) and never referenced in client-side code or bundled to the browser.
- [ ] Nav shows "Acerca de" as a link on all pages and highlights it as active on `/about` (desktop and mobile menu).
- [ ] Visual result matches `references/templates/home-about/about.jsx` (via `arcade-vault-standalone.html`) side-by-side (fonts, colors, neon effects, layout), aside from the new sending/error states which have no template equivalent.

## Decisions taken and discarded

- **Route Handler (`app/api/contact/route.ts`) instead of a Server Action** — chosen for an explicit, testable `/api` boundary consistent with how a form-to-email integration is typically wired in the App Router; discarded a Server Action to keep the Resend call and its error surface easy to `curl`/test directly.
- **Fixed recipient `mariobs@gmail.com`** — chosen per explicit user decision; no admin UI or env-configurable recipient introduced since there's only one destination for now.
- **Sender `onboarding@resend.dev`** — chosen per explicit user decision to avoid domain verification work; discarded a custom domain, which is out of scope until one is verified in Resend.
- **Basic server-side validation only (no CAPTCHA/rate-limiting)** — chosen per explicit user decision to keep this spec scoped to "does the email actually send"; anti-spam hardening deferred to a future spec if abuse becomes a real problem.
- **New visible error state instead of always showing fake success** — chosen per explicit user decision so a real Resend failure is never silently hidden from the user; implemented with the same terminal aesthetic as the existing success block to stay visually consistent.
- **`/about` (English) route** — chosen per explicit user decision for consistency with `/games` (spec 02 already moved `/juegos` to English); `/salon-fama` and `/iniciar-sesion` remain Spanish since renaming them is out of this spec's scope.
- **No persistence of contact submissions** — discarded adding a database or localStorage log, since the feature's only requirement is "send an email"; nothing else reads submission history today.
- **User provisions the Resend API key** — the spec only documents `RESEND_API_KEY` in `.env.example`; account creation and key generation happen outside this spec's scope.

## Identified risks

- **Missing or invalid `RESEND_API_KEY` at runtime** — the route handler will fail every send attempt; mitigated by the new visible error state (no silent failure) and the `.env.example` documentation reminding whoever deploys this to set the real key.
- **`onboarding@resend.dev` sender restrictions** — Resend's shared test sender may have deliverability limits (e.g. only sends to the account owner's verified email) depending on account status; if `mariobs@gmail.com` is not the Resend account's own verified address, delivery may fail even with a valid key. This will surface as the new error state during the manual test pass in step 6.
