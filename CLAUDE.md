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
- E2E UI: `pnpm test:e2e:ui`

### Linting & Formatting
- ESLint is configured to run automatically on pre-commit via git hooks
- Manual lint: Files are automatically fixed on commit

## Architecture

### Package Structure
The monorepo contains three main packages:
- `packages/motion/` - Core motion library (published as `motion-v`)
- `packages/plugins/` - Nuxt module and resolver for unplugin-vue-components
- `playground/` - Testing environments (Nuxt and Vite playgrounds)

### Core Components Architecture
Motion components are built on top of Framer Motion's core, with Vue-specific adaptations:

1. **Motion Component System** (`packages/motion/src/components/motion/`)
   - Creates motion-enabled HTML/SVG elements using dynamic component rendering
   - Manages animation state through `useMotionState` composable
   - Handles variant propagation and gesture features

2. **Visual Element State** (`packages/motion/src/state/`)
   - Creates and manages visual elements with projection nodes for layout animations
   - Handles style transformations and animation lifecycles
   - Integrates with Framer Motion's store system

3. **Feature System** (`packages/motion/src/features/`)
   - Modular feature loading (gestures, animations, layout)
   - Each feature extends the visual element with specific capabilities
   - Gesture features include drag, hover, press, pan, and in-view detection

4. **Animation Controls** (`packages/motion/src/animation/`)
   - Provides imperative animation controls via `useAnimationControls`
   - Manages animation sequencing and orchestration across components

5. **Layout Animations** (`packages/motion/src/features/layout/`)
   - Handles shared layout animations between components
   - Manages projection nodes for FLIP animations
   - Supports layout groups for coordinated animations

### Build Configuration
- Uses Vite for building with separate ES and CJS outputs
- Includes complex path aliasing for Framer Motion internals
- Post-build step triggers plugin builds automatically

### Testing Strategy
- Unit tests use Vitest with Vue Test Utils in JSDOM environment
- E2E tests use Playwright for browser-based testing
- Test files are co-located with source code in `__tests__` directories

## Important Implementation Notes

1. **Framer Motion Integration**: The library wraps Framer Motion's core functionality, requiring careful path aliasing to specific internal modules.

2. **Component Rendering**: Motion components use Vue's dynamic component system with render functions to create motion-enabled elements.

3. **State Management**: Visual element state is managed through a combination of Vue reactivity and Framer Motion's store system.

4. **Gesture Handling**: Gesture features are implemented as composables that attach event listeners and manage interaction state.

5. **Performance**: The library uses lazy loading for features and optimizes re-renders through careful state management.

## Development Workflow

1. Always run `pnpm build` after modifying the motion package before testing in playground
2. Use the playground environments to test changes interactively
3. Add tests for new features in the appropriate `__tests__` directory
4. Ensure commits follow conventional commit format (enforced by commitlint)
