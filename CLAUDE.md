# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Motion for Vue is a Vue.js port of Framer Motion, providing declarative animations with a hybrid engine combining JavaScript animations and native browser APIs. The library exports components like `motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, and `Reorder` for creating animations, gestures, and layout transitions.

## Key Commands

### Development
- `pnpm dev` - Start development watch mode for motion package
- `pnpm build` - Build the motion package and plugins
- `pnpm test` - Run unit tests for motion package
- `pnpm test:e2e` - Run Playwright end-to-end tests
- `pnpm play` - Start the Nuxt playground for interactive testing

### Documentation
- `pnpm docs:dev` - Start documentation development server
- `pnpm docs:build` - Build documentation site

### Testing
- Single test: `pnpm --filter motion-v test [test-file-name]`
- Coverage: `pnpm --filter motion-v coverage`
- E2E tests: `pnpm test:e2e`
- E2E UI mode: `pnpm test:e2e:ui`
- E2E debug: `pnpm test:e2e:debug`
- E2E report: `pnpm test:e2e:report`

### Linting & Formatting
- ESLint is configured to run automatically on pre-commit via git hooks
- Manual lint: Files are automatically fixed on commit
- Git hooks: Commitlint enforces conventional commit format

## Architecture

### Package Structure
The monorepo contains three main packages:
- `packages/motion/` - Core motion library (published as `motion-v`)
- `packages/plugins/` - Nuxt module and resolver for unplugin-vue-components
- `playground/nuxt/` - Nuxt playground (run with `pnpm play`)
- `playground/vite/` - Vite playground for E2E tests (runs on port 5173)
- `docs/` - Documentation site

### Core Components Architecture
Motion components are built on top of Framer Motion's core, with Vue-specific adaptations:

1. **Motion Component System** (`packages/motion/src/components/motion/`)
   - Creates motion-enabled HTML/SVG elements using `createMotionComponent` factory
   - Supports `asChild` prop for applying motion to child elements (template mode)
   - Uses `useMotionState` composable to initialize and manage state
   - Caches components for performance (separate caches for mini/max feature sets)
   - Main export is `motion` object with `.create()` method for any HTML/SVG tag

2. **Visual Element State** (`packages/motion/src/state/`)
   - Core `MotionState` class manages animation state and lifecycle
   - Tracks parent-child relationships for proper lifecycle ordering
   - Creates visual elements through Framer Motion's HTML/SVG visual element system
   - Manages active animation states (initial, animate, exit, etc.)
   - Integrates with Framer Motion's store system via `mountedStates` WeakMap

3. **Feature System** (`packages/motion/src/features/`)
   - Modular feature loading via `FeatureManager`
   - Two feature bundles: `domAnimation` (minimal) and `domMax` (full)
   - Each feature extends `Feature` base class with lifecycle hooks (beforeMount, mount, update, unmount)
   - Gesture features: `DragGesture`, `HoverGesture`, `PressGesture`, `PanGesture`, `FocusGesture`, `InViewGesture`
   - Layout features: `ProjectionFeature` (FLIP animations), `LayoutFeature` (layout transitions)
   - Animation feature: `AnimationFeature` (variant-based animations)

4. **Animation Controls** (`packages/motion/src/animation/`)
   - Provides imperative animation controls via `useAnimationControls`
   - Manages animation sequencing and orchestration across components

5. **Layout Animations** (`packages/motion/src/features/layout/`)
   - Handles shared layout animations between components
   - Manages projection nodes for FLIP animations
   - Supports layout groups for coordinated animations via `LayoutGroup` component

6. **AnimatePresence** (`packages/motion/src/components/animate-presence/`)
   - Manages exit animations for components being removed from the DOM
   - Wraps Vue's `Transition`/`TransitionGroup` components
   - Provides presence context to child motion components
   - Handles popLayout feature to prevent layout shift during exit animations

### Build Configuration
- Uses Vite for building with separate ES (`.mjs`) and CJS (`.js`) outputs
- Includes extensive path aliasing for Framer Motion internal modules (see `vite.config.ts`)
- Post-build step automatically triggers plugin builds via `afterBuild` hook
- Outputs preserve module structure with `preserveModules: true`
- Type declarations generated via `vite-plugin-dts` in `dist/es/` directory

### Testing Strategy
- Unit tests use Vitest with Vue Test Utils in JSDOM environment
- E2E tests use Playwright targeting Chromium and WebKit browsers
- Test files are co-located with source code in `__tests__` directories
- E2E tests run against the Vite playground on port 5173
- Coverage reports available via `pnpm --filter motion-v coverage`

## Important Implementation Notes

1. **Framer Motion Integration**: The library wraps Framer Motion's core functionality (v12.23.26), requiring careful path aliasing to specific internal modules in `vite.config.ts`. Changes to Framer Motion internals may require updating these aliases.

2. **Component Rendering**: Motion components use Vue's dynamic component system with render functions. The `asChild` prop enables applying motion to child elements without wrapper divs. Self-closing tags (area, img, input) are handled specially.

3. **State Management**: Visual element state is managed through `MotionState` class which bridges Vue reactivity with Framer Motion's store system. The `mountedStates` WeakMap tracks which elements have motion state.

4. **Context System**: Uses Vue's provide/inject for passing context down the component tree:
   - Motion context (parent state for variant inheritance)
   - Layout group context (for shared layout animations)
   - Motion config context (global configuration)
   - Animate presence context (for exit animations)
   - Lazy motion context (for feature tree-shaking)

5. **Gesture Handling**: Gesture features extend the `Feature` base class and attach event listeners during mount. Each gesture manages its own state and cleanup.

6. **Performance**: The library uses lazy loading via `LazyMotion` component, component caching, and careful lifecycle management to optimize performance. Features can be loaded on-demand to reduce bundle size.

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
