<h1 align="center">Motion for Vue</h1>

A animation library designed for Vue 3, Powered by [Motion](https://www.framer.com/motion/).

I love framer-motion - it makes creating animations super easy! While it doesn't support Vue 3, but recently framer-motion has separated some of its animation code from React. So I thought I'd try building a Vue animation library that matches framer-motion's API as a fun practice project.

## Features

- 🎨 Declarative Animation API
- 🔄 Gesture Animation Support
- 🎯 Full TypeScript Support
- ⚡️ High Performance Animation
- 🎭 Variants Animation System
- 👀 Viewport Animation Trigger
- 🚪 Enter/Exit Animation Support

## 🏎️ Quick start
Install `motion-v`:
```bash
npm install motion-v
```
## Basic Usage
```vue
<script setup>
import { Motion } from 'motion-v'
</script>

<template>
  <Motion :animate="{ x: 100 }" />
</template>
```

Read the full [docs](https://motion.seacoly.me/).
