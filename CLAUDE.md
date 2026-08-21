# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Motion for Vue is a Vue.js port of Framer Motion, providing declarative animations with a hybrid engine combining JavaScript animations and native browser APIs. The library exports components like `motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, and `Reorder` for creating animations, gestures, and layout transitions.

### Linting & Formatting
- ESLint is configured to run automatically on pre-commit via git hooks
- Manual lint: Files are automatically fixed on commit
- Git hooks: Commitlint enforces conventional commit format

## Architecture

Subsystem internals live in [docs/agents/architecture.md](docs/agents/architecture.md) — read it when working on: motion component rendering, visual element state (`MotionState`), features or gestures, scroll tracking, layout animations, AnimatePresence exits, the `v-motion` directive, build configuration, or test setup.

## Important Implementation Notes

1. **Framer Motion Integration**: The library wraps Framer Motion's core functionality (v12.23.26), requiring careful path aliasing to specific internal modules in `vite.config.ts`. Changes to Framer Motion internals may require updating these aliases.

## Development Workflow

1. **Building**: Always run `pnpm build` after modifying the motion package before testing in playground. The build includes both the motion package and plugins (triggered automatically).

2. **Testing Changes**:
   - Use `pnpm play` for the Nuxt playground (port 3001)
   - Or directly run playground with `cd playground/vite && pnpm dev` (port 5173)
   - Changes to motion package require rebuild; playground changes hot-reload

3. **Writing Tests**:
   - Add unit tests in `__tests__` directories co-located with source
   - Run tests with `pnpm --filter motion-v test`
   - E2E tests go in root `/tests` directory using Playwright

4. **Git Workflow**:
   - Commits must follow conventional commit format (enforced by commitlint)
   - Pre-commit hooks run ESLint auto-fix via lint-staged
   - Use `pnpm bumpp` to version bump all packages together

5. **Common Issues**:
   - If playground doesn't reflect changes, ensure you ran `pnpm build`
   - Plugin builds happen automatically after motion build via `afterBuild` hook
   - Watch mode available with `pnpm dev` for iterative development
   - If exit variant functions do not receive the `custom` value: ensure `presenceContext` is threaded through `initVisualElement` and `updateOptions` in `MotionState`, and that `custom` is synced eagerly at the start of the `exit()` hook in `usePresenceContainer`

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `motiondivision/motion-vue`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` at the repo root plus `docs/adr/` for decisions. See `docs/agents/domain.md`.
