---
title: useVelocity
---

`useVelocity` accepts a motion value and returns a new one that updates with the provided motion value's velocity.

## Usage

```ts
import { useVelocity } from 'motion-v'
```

> Pass any numerical motion value to useVelocity. It'll return a new motion value that updates with the velocity of the original value

```vue
<script setup lang="ts">
import { motionValue, useMotionValueEvent, useVelocity } from 'motion-v'

const x = motionValue(0)
const xVelocity = useVelocity(x)

useMotionValueEvent(xVelocity, 'change', (latest) => {
  console.log('Velocity', latest)
})
</script>

<template>
  <Motion :style="{ x }" />
</template>
```

## For more details, see the [useVelocity](https://motion.dev/docs/react-use-velocity) docs.
