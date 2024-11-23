---
title: Motion values overview
description: Motion values track the state and velocity of animated values.They are composable, signal-like values that are performant because Motion can render them with its optimised DOM renderer.Usually, these are created automatically by motion components. But for advanced use cases, it's possible to create them manually.
---

## Import

```vue
<script setup lang="ts">
import { Motion, motionValue } from 'motion-v'

const x = motionValue(0)
</script>

<template>
  <Motion :style="{ x }" />
</template>
```

By manually creating motion values you can:

- Set and get their state.

- Pass to multiple components to synchronise motion across them.

- Chain MotionValues via the useTransform hook.

- Update visual properties without triggering Vue's render cycle.

- Subscribe to updates.

```vue
<script setup lang="ts">
import { motionValue, useTransform } from 'motion-v'

const x = motionValue(0)
const opacity = useTransform(
  x,
  [-200, 0, 200],
  [0, 1, 0]
)
</script>

// Will change opacity when x is changed
<template>
  <Motion :style="{ x, opacity }" />
</template>
```

## Usage

 Motion values can be created with the `motionValue` function. The string or number passed to `motionValue` will act as its initial state.

```
import { motionValue } from "motion-v"

const x = motionValue(0)
```

Motion values can be passed to a motion component via style:

```vue
<script setup lang="ts">
import { motionValue } from 'motion-v'

const x = motionValue(0)
</script>

<template>
  <Motion :style="{ x }" />
</template>
```

Or for SVG attributes, via the attribute prop itself:

```vue
<script setup lang="ts">
import { motionValue } from 'motion-v'

const cx = motionValue(0)
</script>

<template>
  <Motion
    as="circle"
    :cx="cx"
  />
</template>
```

It's possible to pass the same motion value to multiple components.

Motion values can be updated with the `set` method:

```ts
x.set(100)
```

Changes to the motion value will update the DOM without triggering a Vue re-render. Motion values can be updated multiple times but renders will be batched to the next animation frame.

A motion value can hold any string or number. We can read it with the `get` method:

```ts
x.get() // 100
```

Motion values containing a number can return a velocity via the `getVelocity` method. This returns the velocity as calculated per second to account for variations in frame rate across devices.

```ts
const xVelocity = x.getVelocity()
```
## Events

Listeners can be added to motion values via the `on` method or the `useMotionValueEvent` hook.

```ts
useMotionValueEvent(x, 'change', latest => console.log(latest))
```

Available events are "change", "animationStart", "animationComplete" "animationCancel".

## Composition

Beyond `motionValue`, Motion provides a number of hooks for creating and composing motion values, like `useSpring` and `useTransform`.

For example, with `useTransform` we can take the latest state of one or more motion values and create a new motion value with the result.

```ts
const y = useTransform(() => x.get() * 2)
```

useSpring can make a motion value that's attached to another via a spring.

```ts
const dragX = motionValue(0)
const dragY = motionValue(0)
const x = useSpring(dragX)
const y = useSpring(dragY)
```
<iframe src="https://stackblitz.com/edit/vitejs-vite-v8ot1e?ctl=1&embed=1&file=src%2FApp.vue&hideExplorer=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="motion-use-spring"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
   ></iframe>

## API

https://motion.dev/docs/react-motion-value#api
