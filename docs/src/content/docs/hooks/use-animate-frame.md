---
title: useAnimationFrame
description: useAnimationFrame
---

`useAnimateFrame` runs a callback once every animation frame.

```vue
<script setup>
import { useAnimationFrame } from 'motion-v'

useAnimationFrame((time) => {
  dom.value.style.transform = `rotateY(${time}deg)`
})
</script>
```

<ComponentPreview name="AnimateFrame" />

The callback is provided two arguments:

- `time`: The total time in milliseconds since the callback was first called.
- `delta`: The time in milliseconds since the last animation frame.
