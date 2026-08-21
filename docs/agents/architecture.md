# Architecture

Deep-dive reference for `motion-v` internals, reached from the pointer in `CLAUDE.md`. Read the section matching the subsystem you are touching.

## Core Components Architecture

Motion components are built on top of Framer Motion's core, with Vue-specific adaptations:

1. **Motion Component System** (`packages/motion/src/components/motion/`)
   - Creates motion-enabled HTML/SVG elements using `createMotionComponent` factory
   - Supports `asChild` prop for applying motion to child elements (template mode)
   - Uses `useMotionState` composable to initialize and manage state
   - Caches components for performance (separate caches for mini/max feature sets)
   - Main export is `motion` object with `.create()` method for any HTML/SVG tag
   - `useMotionState` lifecycle order: `onMounted` (mount), `onBeforeUpdate` (beforeUpdate + updateOptions), `onUpdated` (update), `onBeforeUnmount` (beforeUnmount), `onUnmounted` (unmount if disconnected)
   - Props are updated via `state.updateOptions()` in `onBeforeUpdate` (not `onUpdated`) so parent variant context is available to children during their update cycle
   - Props merging (layoutId namespacing, transition defaults, presence initial) is handled by `resolveMotionProps` utility (`src/utils/resolve-motion-props.ts`), shared with the `v-motion` directive
   - Rendering uses Vue's dynamic component system with render functions; self-closing tags (area, img, input) are handled specially

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
   - Gesture features: `DragGesture`, `HoverGesture`, `PressGesture`, `PanGesture`, `FocusGesture`, `InViewGesture` — each attaches its own event listeners at mount and owns its cleanup
   - Layout features: `ProjectionFeature` (FLIP animations), `LayoutFeature` (layout transitions)
   - Animation feature: `AnimationFeature` (variant-based animations)

4. **Animation Controls** (`packages/motion/src/animation/`)
   - Provides imperative animation controls via `useAnimationControls`
   - Manages animation sequencing and orchestration across components

5. **Scroll Tracking** (`packages/motion/src/value/use-scroll.ts`)
   - `useScroll(options?)` composable returns `{ scrollX, scrollY, scrollXProgress, scrollYProgress }` as motion values
   - `container` and `target` options accept `MaybeComputedElementRef` (supports Vue component instances via `getElement`)
   - `axis` and `offset` options accept `MaybeRefOrGetter` (resolved with `toValue`, supports both refs and getter functions)
   - Uses `watchEffect` with `flush: 'post'` to reactively re-subscribe when reactive options change
   - SSR-safe: skips scroll setup when `isSSR` is true
   - Delegates to Framer Motion's `scroll` function from `framer-motion/dom`

6. **Layout Animations** (`packages/motion/src/features/layout/`)
   - Handles shared layout animations between components
   - Manages projection nodes for FLIP animations
   - Supports layout groups for coordinated animations via `LayoutGroup` component

7. **AnimatePresence** (`packages/motion/src/components/animate-presence/`)
   - Manages exit animations for components being removed from the DOM
   - Wraps Vue's `Transition`/`TransitionGroup` components
   - Provides presence context to child motion components
   - Handles popLayout feature to prevent layout shift during exit animations
   - `custom` prop is synced eagerly inside the `exit()` hook (not via a Vue watcher) because Vue's `@leave` fires synchronously during patching — a `flush: 'pre'` watcher is not guaranteed to have run when `v-if` and `custom` change in the same tick
   - `presenceContext` is passed to `visualElement` both at init (`initVisualElement`) and on updates (`updateOptions`) so exit variant functions receive the correct `custom` value

8. **v-motion Directive** (`packages/motion/src/`)
   - Full-featured directive alternative to the `<motion>` component — no wrapper element required
   - Exports: `vMotion` (domMax bundle), `createMotionDirective(bundle?)`, `createPresetDirective(defaults)`, `MotionPlugin`
   - Supports all animation, gesture, layout, and exit props identical to `<motion>`
   - **Key limitation**: does not support parent-child variant propagation (no Vue provide/inject context)
   - Two syntax styles: props syntax (`v-motion :animate="..."`) and binding value syntax (`v-motion="{ animate: ... }"`) — props win on conflict
   - Preset directives created via `createPresetDirective` can be overridden per-use via binding value
   - Registered globally via `MotionPlugin` (supports `presets` option) or Nuxt module (`motionV.directives: true`)

## Context System

Uses Vue's provide/inject for passing context down the component tree:

- Motion context (parent state for variant inheritance)
- Layout group context (for shared layout animations)
- Motion config context (global configuration)
- Animate presence context (for exit animations)
- Lazy motion context (for feature tree-shaking)

## Performance

- Lazy loading via `LazyMotion` component; features can be loaded on-demand to reduce bundle size
- Component caching per feature set (mini/max) in the motion component factory

## Build Configuration

- Uses Vite for building with separate ES (`.mjs`) and CJS (`.js`) outputs
- Extensive path aliasing to Framer Motion internal modules (see `vite.config.ts`)
- Post-build step automatically triggers plugin builds via `afterBuild` hook
- Outputs preserve module structure with `preserveModules: true`
- Type declarations generated via `vite-plugin-dts` in `dist/es/` directory

## Testing Strategy

- Unit tests use Vitest with Vue Test Utils in JSDOM environment
- E2E tests use Playwright targeting Chromium and WebKit browsers
- Test files are co-located with source code in `__tests__` directories
- E2E tests run against the Vite playground on port 5173
- Coverage reports available via `pnpm --filter motion-v coverage`
