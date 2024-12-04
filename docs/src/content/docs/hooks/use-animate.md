---
title: useAnimate
description: useAnimate provides a way of using the animate function that is scoped to the elements within the provided domRef.
---

`useAnimate` provides a way of using the animate function that is scoped to the elements within the provided domRef.

This allows you to use manual animation controls, timelines, selectors scoped to your component, and automatic cleanup.

It provides a scope ref, and an animate function where every DOM selector is scoped to this ref.

```vue
<script setup lang="ts">
import { useAnimate } from 'motion-vue'

const [scope, animate] = useAnimate()

onMounted(() => {
  // This "li" selector is scoped to the ul element
  animate('li', { x: 100 })
})
</script>

<template>
  <ul ref="scope">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</template>
```

Additionally, when the component calling useAnimate is removed, all animations started with its animate function will be cleaned up automatically.

## Usage

```vue
<script setup lang="ts">
import { useAnimate } from 'motion-vue'
</script>
```

## Scope ref

<ComponentPreview name="ScopeMotion" />

## Scroll-triggered animations

<ComponentPreview name="ScrollTrigger" />
