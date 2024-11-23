---
title: useSpring
---

`useSpring` creates a motion value that will animate to its latest target with a spring animation.

The target can either be set manually via .set, or automatically by passing in another motion value.

## Usage

Import `useSpring` from `motion-v`:

```ts
import { useSpring } from 'motion-v'
```

## Direct control

`useSpring` can be created with a number:

```ts
const x = useSpring(0)
```

Now, whenever this motion value is updated via `.set()`, the value will animate to its new target with the defined spring.

```ts
x.set(100)
```

It's also possible to update this value immediately, without a spring, with the `.jump()` method.

```ts
x.jump(100)
```

## Track another motion value

It's also possible to automatically spring towards the latest value of another motion value:

```ts
const x = motionValue(0)
const y = useSpring(x)
```

## For more details, check out the Motion docs
[motion-dev docs](https://motion.dev/docs/react-use-spring)
