import {
  GroupAnimation,
  NativeAnimation,
  NativeAnimationWrapper,
  applyGeneratorOptions,
  getValueTransition,
  getViewAnimationLayerInfo,
  getViewAnimations,
  mapEasingToNativeEasing,
} from 'motion-dom'
import type {
  AnimationPlaybackControls,
  TargetAndTransition,
  Transition,
  ValueTransition,
} from 'motion-dom'
import { secondsToMilliseconds } from 'motion-utils'
import type { ViewAnimationOptions, ViewAnimationType } from './types'

/**
 * Animate the pseudo-element layers the browser has generated for a named
 * view transition boundary, either retiming the browser's animations or
 * replacing its crossfade with custom keyframes.
 *
 * Ported from framer-motion's AnimateView (`animate-view-layers.mjs`).
 */
export function animateViewLayers(
  name: string,
  animationType: ViewAnimationType,
  { transition, onAnimationStart, onAnimationComplete, ...props }: ViewAnimationOptions,
  types: string[],
): () => void {
  const layerAnimations: AnimationPlaybackControls[] = []
  const definition = props[animationType]
  const { transition: typeTransition, ...values }
    = (typeof definition === 'function' ? definition(types) : definition) || {}
  const hasValues = Object.keys(values).length > 0
  let hasMatchingAnimation = false

  for (const viewAnimation of getViewAnimations()) {
    if (viewAnimation.playState === 'finished')
      continue

    const { effect } = viewAnimation
    if (
      typeof KeyframeEffect === 'undefined'
      || !(effect instanceof KeyframeEffect)
      || !effect.pseudoElement
    ) {
      continue
    }

    const info = getViewAnimationLayerInfo(effect.pseudoElement)
    if (!info || info.layer !== name)
      continue

    hasMatchingAnimation = true

    /**
     * Custom values replace the browser's crossfade (old/new layers).
     * The group layer carries the position/size morph, so keep it running
     * with Motion's timing.
     */
    if (hasValues && info.type !== 'group') {
      viewAnimation.cancel()
    }
    else {
      const transitionName = info.type === 'group' ? 'layout' : ''
      let options = {
        ...getValueTransition(transition, transitionName),
        ...getValueTransition(typeTransition, transitionName),
      }
      options.duration = secondsToMilliseconds(options.duration ?? 0.3)
      options = applyGeneratorOptions(options)

      effect.updateTiming({
        delay: secondsToMilliseconds(options.delay ?? 0),
        duration: options.duration,
        easing: mapEasingToNativeEasing(options.ease, options.duration) as string,
      })

      layerAnimations.push(new NativeAnimationWrapper(viewAnimation))
    }
  }

  if (hasValues && hasMatchingAnimation) {
    layerAnimations.push(
      ...createLayerAnimations(name, animationType, values, transition, typeTransition),
    )
  }

  const animation = new GroupAnimation(layerAnimations)
  let active = true

  onAnimationStart?.(animation as unknown as AnimationPlaybackControls, animationType)

  if (onAnimationComplete) {
    animation.finished.then(() => {
      if (active)
        onAnimationComplete(animationType)
    })
  }

  return () => {
    active = false
    animation.cancel()
  }
}

function createLayerAnimations(
  layerName: string,
  animationType: ViewAnimationType,
  values: TargetAndTransition,
  defaultTransition?: Transition,
  transition?: Transition,
): AnimationPlaybackControls[] {
  const animations: AnimationPlaybackControls[] = []

  for (const [name, value] of Object.entries(values)) {
    let keyframes = value
    const options: ValueTransition = {
      ...getValueTransition(defaultTransition, name),
      ...getValueTransition(transition, name),
    }

    options.duration && (options.duration = secondsToMilliseconds(options.duration))
    options.delay && (options.delay = secondsToMilliseconds(options.delay))

    if (name === 'opacity' && !Array.isArray(keyframes)) {
      const initialValue = animationType === 'enter' ? 0 : 1
      keyframes = [initialValue, keyframes] as typeof keyframes
    }

    animations.push(new NativeAnimation({
      ...options,
      element: document.documentElement,
      name,
      pseudoElement: `::view-transition-${animationType === 'enter' ? 'new' : 'old'}(${layerName})`,
      keyframes,
    } as any))
  }

  return animations
}
