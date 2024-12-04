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

### `custom`

The `custom` prop is used to pass through to dynamic variants.

<ComponentPreview name="CustomVariant" />

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

### `inViewOptions`

The `inViewOptions` prop allows you to customize the behavior of the `inView` animation with the following options:

#### `margin`
default: `0`

The `margin` option allows you to set the margin around the component that should be in view for the animation to trigger.

```vue
<Motion :inView="{ x: 0 }" :inViewOptions="{ margin: 100 }" />
```

#### `once`
default: `false`

The `once` option allows you to set the animation to trigger only once when the component enters the viewport.

```vue
<Motion :inView="{ x: 0 }" :inViewOptions="{ once: true }" />
```
#### `root`
default : `window`

The `root` option allows you to set the root element that the `inView` animation should be relative to.

```vue
<Motion :inView="{ x: 0 }" :inViewOptions="{ root: document.getElementById('my-element') }" />
```

#### `amount`

default: `some`

The `amount` option allows you to set the amount of the component that should be in view for the animation to trigger.

You can set the `amount` to `all`, which means the animation will trigger when the entire component is in view.

or you can set a number, which means the animation will trigger when the component is in view by the amount of the component that is in view.

```vue
<Motion :inView="{ x: 0 }" :inViewOptions="{ amount: 'all' }" />
```

### `exit`

The `exit` prop defines the animation target when a `Motion` component wrapped by `AnimatePresence` is removed from the DOM (when `v-show` or `v-if` evaluates to false). This enables smooth exit animations as elements are unmounted.

### `as`

default: `div`

The `as` prop allows you to set the HTML element that the `Motion` component should render as.

```vue
<Motion as="a" />
```

### `asChild`

default: `false`

The `asChild` prop allows you to pass a child component directly to the `Motion` component.
