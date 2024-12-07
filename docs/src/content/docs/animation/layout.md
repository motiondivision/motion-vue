---
title: Layout Animations
---

now `Motion-v` supports layout animations, which means you can animate the position, size, and other layout properties of elements.

like [framer-motion](https://motion.dev/docs/react-layout-animations), you can use `layout` prop to enable layout animations.
```vue
<Motion layout />
```

## Basic Usage

<ComponentPreview name="LayoutFlex" />

## Animate width

<ComponentPreview name="Layout" />

## Shared layout
use `layout-id` to share layout animations between components.
<ComponentPreview name="MotionLayoutShared" />

## Scale correction

<ComponentPreview name="LayoutScale" />

## Resources

- [FLIP animation technique](https://aerotwist.com/blog/flip-your-animations/)
- [Framer Motion layout animations](https://motion.dev/docs/react-layout-animations#shared-layout-animations)
