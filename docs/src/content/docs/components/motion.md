---
title: Motion
description: Motion components are foundational DOM primitives that provide declarative animation capabilities.
source: packages/vue/src/components/Motion.vue
---

## Import

```ts
import { Motion } from 'motion-vue'
```

## Animation
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
