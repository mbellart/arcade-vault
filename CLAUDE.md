# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform to play games online and compete for the highest score (per README.md, in Spanish). Currently a fresh Next.js scaffold (App Router) with no game features implemented yet.

There is no test runner configured yet.

## Architecture

- App Router lives in `app/` (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`). No routes beyond the root have been added yet.
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss` (see `postcss.config.mjs`).
- TypeScript path alias `@/*` maps to the repo root (`tsconfig.json`).
- Before writing code, read the relevant guide under `node_modules/next/dist/docs/` — this project pins a Next.js version (16.3.0) whose APIs/conventions may differ from training data; see `AGENTS.md` for details. Docs are split into `01-app` (App Router), `02-pages`, `03-architecture`, `04-community`.

## Spec-driven workflow

The README indicates this project intends to follow a spec-driven design workflow (`/spec` and `/spec-impl`) based on https://github.com/Klerith/fernando-skills, installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

These skills are not yet installed in this repo — check for a `.claude/skills` or similar directory before assuming they're available.

## Skills

Use always /frontend-design to design the user interface.
