---
title: Motion
description: Motion components are foundational DOM primitives that provide declarative animation capabilities.
source: packages/motion/src/components/Motion.vue
---

<Description>

The `motion` component is the primary building block for animations in Motion for Vue. It can be rendered as any HTML or SVG element by using the `as` prop, such as `<Motion as="div"/>` or `<Motion as="circle"/>`. Alternatively, you can pass `asChild` to render a child component directly.

</Description>

## Import

```ts
import { Motion } from 'motion-v'
```

Now You can write declarative animations through the Motion component. Simply pass the desired animation values to the `animate` prop

Here are some examples

## Basic Animation
<ComponentPreview name="MotionBasic" />

## Keyframes

Set a value as an array and Motion will animate through each of these values in turn.

By default, each keyframe will be spaced evenly throughout the animation, but the exact timing and easing can be configured via the transition property.

<ComponentPreview name="MotionKeyframes" />

## Variants

Variants are pre-defined visual states that a component can be in. By giving a component and its children `variants` with matching names, whole Vue trees can be animated by changing a single prop.

<ComponentPreview
 name="MotionVariants"
/>

## Gesture animations

Motion provides`hover`, `press` helper props, that will temporarily animate a component to a visual state while a gesture is active.

Like animate, these can either be set as an object of properties (each with their own transition prop), or the name of a variant.

<ComponentPreview name="MotionGesture"/>

## InView

The `inView` prop will animate a component in or out of view when it enters  the viewport.

<ComponentPreview name="MotionInView"/>

## Props

## animation

### `initial`

The `initial` visual state of the `Motion` component.

This can be set as an animation target:

```vue
<Motion :initial="{ x: 0, opacity: 0 }" />
```
variants:
```vue
<Motion initial="closed" :variants="{ open: { x: 100 }, closed: { x: 0 } }" />
```
or you can pass `false` to disable the initial animation:
```vue
<Motion :initial="false" />
```

### `animate`

The `animate` prop is used to set the animation target. When the component is mounted or the `animate` prop is updated, it will animate to the `animate` target.

```vue
<Motion :initial="{ x: 0, opacity: 0 }" :animate="{ x: 100, opacity: 1 }" />
```
`variants`:
```vue
<Motion
  initial="closed"
  animate="open"
  :variants="{ open: { x: 100 }, closed: { x: 0 } }"
/>
```

### `transition`

The `transition` prop is used to set the transition of the animation.
```vue
<Motion
  :initial="{ x: 0, opacity: 0 }"
  :animate="{ x: 100, opacity: 1 }"
  :transition="{
    duration: 1,
    x: { type: 'spring', stiffness: 260, damping: 20 },
  }"
/>
```

### `inView`

The `inView` prop is used to animate a component in or out of view when it enters  the viewport.

```vue
<Motion :initial="{ y: 10, opacity: 0 }" :inView="{ y: 0, opacity: 1 }" />
```

## Layout Animation

Layout animations allow components to animate between different layouts. When the layout prop is set to true, the component will automatically animate to its new position when its layout changes.

### Basic Layout Animation

```vue
<Motion
  :layout="true"
  class="box"
  :animate="{ width: isExpanded ? '300px' : '100px' }"
/>
```

### Layout ID

The `layoutId` prop allows multiple components to be linked together. When components share the same `layoutId`, they will animate between each other's positions when they are added or removed.

```vue
<Motion
  :layout="true"
  layoutId="shared-box"
  class="box"
  v-if="showFirst"
/>

<Motion
  :layout="true"
  layoutId="shared-box"
  class="box"
  v-else
/>
```

### Layout Options

- `layout`: Enable layout animations. Can be `true`, `'position'`, `'size'`, or `'preserve-aspect'`
- `layoutId`: String to link components for shared layout animations
- `layoutScroll`: Whether to include scroll offset in layout calculations
- `layoutRoot`: Whether this component is the root of a layout group

<ComponentPreview name="MotionLayout" />
