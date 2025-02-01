<p align="center">
<img src="https://github.com/user-attachments/assets/eb32e353-13c2-4c84-9992-3548a42c92a4"></img>
</p>
<h1 align="center">Motion for Vue</h1>

An animation library designed for Vue 3, powered by [Motion](https://www.framer.com/motion/).

## Features
- ✨ Declarative animation API for intuitive control
- 👋 Gesture-driven animations for interactive experiences
- ⚙ Motion values for dynamic animations
- 🔲 Layout animations and transitions
- 🚪 Polished enter/exit animations
- 📜 Smooth scroll-based animations and effects

## 🏎️ Quick Start
To install `motion-v`, run the following command:
```bash
npm install motion-v
```

## Basic Usage
Here is a basic example of how to use `motion-v` in your Vue 3 project:

```vue
<script setup>
import { Motion } from 'motion-v'
</script>

<template>
  <Motion :animate="{ x: 100 }" />
</template>
```

### Advanced Usage
For more advanced usage, you can combine multiple animations and gestures:

```vue
<script setup>
import { Motion } from 'motion-v'
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <Motion
    v-if="isVisible"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1, x: 100 }"
    :exit="{ opacity: 0, x: -100 }"
    @click="isVisible = !isVisible"
  />
</template>
```

In this example, the `Motion` component will fade in and move to the right when it appears, and fade out and move to the left when it disappears. Clicking the component will toggle its visibility.

For detailed documentation, please refer to the [full documentation](https://motion.seacoly.me/).

## Contributing
We welcome contributions from the community. Please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to this project. Your contributions are invaluable in helping us improve and grow.
