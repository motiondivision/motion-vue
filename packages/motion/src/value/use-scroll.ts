import type { Ref } from 'vue'
import { onMounted, watch } from 'vue'
import { motionValue, scroll } from 'framer-motion/dom'
import type { ScrollInfoOptions } from '@/types'
import { warning } from 'hey-listen'

export interface UseScrollOptions
  extends Omit<ScrollInfoOptions, 'container' | 'target'> {
  container?: Ref<HTMLElement | null>
  target?: Ref<HTMLElement | null>
}

function refWarning(name: string, ref?: Ref<HTMLElement | null>) {
  warning(
    Boolean(!ref || ref.value),
    `You have defined a ${name} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref.`,
  )
}

function createScrollMotionValues() {
  return {
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
  }
}

export function useScroll({
  container,
  target,
  ...options
}: UseScrollOptions = {}) {
  const values = createScrollMotionValues()

  onMounted(() => {
    refWarning('target', target)
    refWarning('container', container)
  })

  watch(
    [container, target, () => options.offset],
    (n, o, onCleanup) => {
      const cleanup = scroll(
        (_progress, { x, y }) => {
          values.scrollX.set(x.current)
          values.scrollXProgress.set(x.progress)
          values.scrollY.set(y.current)
          values.scrollYProgress.set(y.progress)
        },
        {
          ...options,
          container: container?.value ?? undefined,
          target: target?.value ?? undefined,
        },
      )
      onCleanup(() => {
        cleanup()
      })
    },
  )

  return values
}
