import { watch } from 'vue'
import { type MotionValue, frame, frameData, motionValue } from 'framer-motion/dom'
import type { SpringOptions } from 'framer-motion'
import type { MainThreadAnimation } from 'framer-main-animation'
import { animateValue } from 'framer-main-animation'
import { isMotionValue } from '@/utils'

function toNumber(v: string | number) {
  if (typeof v === 'number')
    return v
  return parseFloat(v)
}

export function useSpring(
  source: MotionValue<string> | MotionValue<number> | number,
  config: SpringOptions = {},
) {
  let activeSpringAnimation: MainThreadAnimation = null
  const value = motionValue(
    isMotionValue(source) ? toNumber(source.get()) : source,
  )
  let latestValue = value.get()
  let latestSetter = () => {}

  const stopAnimation = () => {
    if (activeSpringAnimation) {
      activeSpringAnimation.stop()
      activeSpringAnimation = null
    }
  }

  const startAnimation = () => {
    const animation = activeSpringAnimation

    if (animation?.time === 0) {
      animation.sample(frameData.delta)
    }

    stopAnimation()

    activeSpringAnimation = animateValue({
      keyframes: [value.get(), latestValue],
      velocity: value.getVelocity(),
      type: 'spring',
      restDelta: 0.001,
      restSpeed: 0.01,
      ...config,
      onUpdate: latestSetter,
    })
  }

  // 监听配置变化
  watch(() => JSON.stringify(config), () => {
    (value as any).attach((v, set) => {
      latestValue = v
      latestSetter = set
      frame.update(startAnimation)
      return value.get()
    }, stopAnimation)
  }, { immediate: true })

  // 监听源值变化
  if (isMotionValue(source)) {
    source.on('change', (v) => {
      value.set(toNumber(v))
    })
  }

  return value
}
