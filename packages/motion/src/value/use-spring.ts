import type { Ref } from 'vue'
import { isRef, watch } from 'vue'
import { animateValue, frame, isMotionValue, motionValue } from 'framer-motion/dom'
import type { JSAnimation, MotionValue } from 'framer-motion/dom'
import type { SpringOptions } from 'motion-dom'

function toNumber(v: string | number) {
  if (typeof v === 'number')
    return v
  return parseFloat(v)
}

export function useSpring(
  source: MotionValue<string> | MotionValue<number> | number,
  config: SpringOptions | Ref<SpringOptions> = {},
) {
  let activeSpringAnimation: JSAnimation<number> | null = null
  const value = motionValue(
    isMotionValue(source) ? toNumber(source.get()) : source,
  )
  let latestValue = value.get()
  let latestSetter: (v: number) => void = () => {}

  const stopAnimation = () => {
    if (activeSpringAnimation) {
      activeSpringAnimation.stop()
      activeSpringAnimation = null
    }
    value.animation = undefined
  }

  const startAnimation = () => {
    const currentValue = toNumber(value.get())
    const targetValue = toNumber(latestValue)

    if (currentValue === targetValue) {
      stopAnimation()
      return
    }

    const velocity = activeSpringAnimation
      ? activeSpringAnimation.getGeneratorVelocity()
      : value.getVelocity()

    stopAnimation()

    const springConfig = isRef(config) ? (config as Ref<SpringOptions>).value : config
    activeSpringAnimation = animateValue({
      keyframes: [currentValue, targetValue],
      velocity,
      type: 'spring',
      restDelta: 0.001,
      restSpeed: 0.01,
      ...springConfig,
      onUpdate: latestSetter,
    })
  }

  const scheduleAnimation = () => {
    startAnimation()
    value.animation = activeSpringAnimation ?? undefined
    ;(value as any).events.animationStart?.notify()
    activeSpringAnimation?.then(() => {
      value.animation = undefined
      ;(value as any).events.animationComplete?.notify()
    })
  }

  watch(() => {
    if (isRef(config)) {
      return (config as Ref<SpringOptions>).value
    }
    return config
  }, () => {
    (value as any).attach((v: number, set: (v: number) => void) => {
      latestValue = v
      latestSetter = set
      frame.postRender(scheduleAnimation)
    }, stopAnimation)
  }, { immediate: true })

  if (isMotionValue(source)) {
    source.on('change', (v) => {
      value.set(toNumber(v))
    })
  }

  return value
}
