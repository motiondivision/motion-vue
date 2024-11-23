---
title: useMotionTemplate
---

`useMotionTemplate` creates a new motion value from a string template containing other motion values.

```
const x =  motionValue(100)
const transform = useMotionTemplate`transform(${x}px)`
```

Whenever a motion value within the string template updates, the returned motion value will update with the latest value.

## Usage

```
import { useMotionTemplate } from "motion-v"

```

`useMotionTemplate` is a "tagged template", so rather than being called like a normal function, it's called as a string template:

```vue
useMotionValue``
```
This string template can accept both text and other motion values:

```
const blur = motionValue(10)
const saturate = motionValue(50)
const filter = useMotionTemplate`blur(${blur}px) saturate(${saturate}%)`

// template
 <Motion :style="{ filter }" />
```

The latest value of the returned motion value will be the string template with each provided motion value replaced with its latest value.

```
const shadowX = useSpring(0)
const shadowY = motionValue(0)

const filter = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`

// template
 <Motion :style="{ filter }" />

```
