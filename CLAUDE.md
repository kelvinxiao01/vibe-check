# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent subprojects, no root-level tooling or workspace config:

- [vc-fe/](vc-fe/) — Next.js 16 / React 19 / Tailwind v4 frontend
- [vc-be/](vc-be/) — Python 3.13 backend (scaffold only)

Run commands from within each subproject's directory.

## Frontend — [vc-fe/](vc-fe/)

Commands:

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve built app
- `npm run lint` — ESLint (flat config, extends `eslint-config-next`)

Notes:

- App Router under [vc-fe/app/](vc-fe/app/). `@/*` path alias maps to the `vc-fe/` root (see [vc-fe/tsconfig.json](vc-fe/tsconfig.json)).
- **Important**: [vc-fe/AGENTS.md](vc-fe/AGENTS.md) states this Next.js version contains breaking changes relative to model training data and instructs reading `node_modules/next/dist/docs/` before writing frontend code. Follow this convention when editing anything in `vc-fe/`.

## Backend — [vc-be/](vc-be/)

Commands (from `vc-be/`):

- `python main.py` — run the entry point (or `uv run main.py` if using uv)

Notes:

- Python 3.13 required (pinned in [vc-be/.python-version](vc-be/.python-version)).
- [vc-be/pyproject.toml](vc-be/pyproject.toml) has no dependencies yet; no test runner, framework, or lint config chosen. The project is a scaffold.
