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
   - Manages exit animations and child removal itself, not through Vue's `Transition`
   - `core/presence-core.ts` diffs slot keys and keeps vanished children rendered as the same frozen VNode object, so Vue's `n1 === n2` patch bailout leaves the subtree untouched until every exit settles; only then are they dropped and the component instance unmounts
   - `presence-child.ts` wraps each child in Vue's `Transition` (`:css="false"`). The wrapper exists so `vnode.transition` is set, which is what lets `v-show` defer `display: none` and lets KeepAlive defer its storage move. Both paths feed the same `ExitFeature` protocol as `v-if` removal
   - `v-if` removal is core-driven: the leave Vue fires when the core finally drops the vnode is released immediately by a settled guard
   - `usePresence` / `useIsPresent` / `usePresenceData` follow React's tuple API; inside AnimatePresence `safeToRemove` is always exposed
   - `presenceContext.custom` reaches exit variant functions through `MotionState` (init and `updateOptions`)
   - popLayout pulls the exiting element out of flow with an injected stylesheet keyed by `data-motion-pop-id`

8. **v-motion Directive** (`packages/motion/src/directive/`)
   - Full-featured directive alternative to the `<motion>` component — no wrapper element required
   - Public API: `vMotion`, `createMotionDirective(bundle?)`, `createPresetDirective(defaults)`, `MotionPlugin` — one surface for vdom and vapor
   - Vue’s vapor directive shape is a function `(el, value?) => cleanup`, while vdom uses an object with lifecycle hooks. Those shapes are mutually exclusive at the call site (`withDirectives` rewrites functions; vapor rejects objects), so a single export value cannot be both. `MotionPlugin` dispatches internally: on `createVaporApp` (`app.vapor`) it registers the private vapor function; on `createApp` it registers the vdom object (`vMotion`)
   - Supports all animation, gesture, layout, and exit props identical to `<motion>` (vdom). Vapor binding-value syntax only (no vnode props / provide-inject walk)
   - **Key limitation (vdom directive)**: does not support parent-child variant propagation via Vue provide/inject the same way `<Motion>` does through its component tree walk caveats
   - Two syntax styles on vdom: props syntax (`v-motion :animate="..."`) and binding value syntax (`v-motion="{ animate: ... }"`) — props win on conflict
   - **Vapor limitations** (honest, directive path): no parent-child variants, no presence/exit, no MotionConfig/LayoutGroup context, no SSR styles — vapor exposes no component instance tree to bridge provides for directives. For richer context, use `<Motion>` inside a vapor app with Vue’s `vaporInteropPlugin` (Motion remains a vdom `defineComponent`; interop mounts it — covered by `motion-vapor.test.ts`)
   - Preset directives via `createPresetDirective` (vdom) or `MotionPlugin` presets (vapor-aware)
   - Registered globally via `MotionPlugin` or Nuxt module (`motionV.directives: true` → `vueApp.use(MotionPlugin)`)

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
