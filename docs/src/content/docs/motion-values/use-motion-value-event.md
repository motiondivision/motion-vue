---
title: useMotionValueEvent
---

`useMotionValueEvent` manages a motion value event handler throughout the lifecycle of a Vue component.

```
<script setup lang="ts">
import { motionValue, useMotionValueEvent } from 'motion-v'

const x = motionValue(0)

useMotionValueEvent(x, "animationStart", () => {
  console.log("animation started on x")
})

useMotionValueEvent(x, "change", (latest) => {
  console.log("x changed to", latest)
})
</script>

<template>
  <Motion :style="{ x }" />
</template>
```

When the component is unmounted, event handlers will be safely cleaned up.

## Usage

```
import { useMotionValueEvent } from "motion-v"

```

To add an event listener to a motion value, provide the value, event name and callback:

```vue
<script setup lang="ts">
const color = useMotionValue('#00f')

useMotionValueEvent(color, 'change', (latest) => {
  console.log(latest)
})
</script>
```
> Available events are:

- change
- animationStart
- animationComplete
- animationCancel

`change` events are provided the latest value of the motion value.
