# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0] - 2026-10-28

### Added

-   `Reorder.Item`: make items focusable by default and support keyboard reordering. Press Space to grab or drop, arrow keys to move, and Escape to restore the order from before the grab. Set `tabindex="-1"` to disable the default focus behavior.
-   `Reorder.Group`: pass the moved value as the second argument to `onUpdate:values` listeners.
-   Add `useScopeMotion(domRef, setup, options?)` for scoped animations with reactive options and automatic cleanup.
-   `useScroll`: return `scrollXLength` and `scrollYLength` MotionValues for the maximum scroll offset of each axis.

### Fixed

-   `Reorder`: make edge auto-scroll speed consistent across refresh rates.
-   Resolve initial `x` and `y` values expressed as pixel strings or CSS variables when dragging.
-   Preserve drag direction locking and apply layout-shift compensation only to the dragged axes.
-   End drag gestures correctly when `drag` is disabled mid-gesture, preserving snap and inertia on the original drag axis.
-   Include `layoutScroll` ancestor offsets in ref-based `dragConstraints` and remeasure constraints after those ancestors scroll.
-   Avoid double-counting pending window scroll in drag pointer positions.
-   Fix `layoutId` handoffs to skip the incoming element's initial enter animation and preserve correct snapshots and default styles.
-   Keep `LayoutGroup` membership synchronized when `layout` or `layoutId` changes at runtime.
-   `useInView`: reset to not visible when the observed element is removed or replaced, while preserving the existing `once: true` behavior.

### Dependencies

-   Update `framer-motion` and `motion-dom` to `~14.7.1`, and `motion-utils` to `~14.7.0`.

## [2.2.0] - 2026-03-22

### Added

-   `useTransform`: accelerate propagation on value changes

## [2.1.0] - 2026-03-21

### Added

-   `useScroll`: `ScrollOffset` presets, scroll timeline acceleration, rest pass-through, `MaybeRefOrGetter` options typing.

### Changed

-   `useSpring`: rewrite with `motion-dom` `attachFollow`.
