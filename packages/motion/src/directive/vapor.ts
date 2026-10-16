import type { Options } from '@/types'
import type { FeatureBundle } from '@/features/dom-animation'
import { domMax } from '@/features/dom-max'
import { MotionState, mountedStates } from '@/state'
import { createVisualElement as defaultRenderer } from '@/state/create-visual-element'
import { watchEffect, watchPostEffect } from 'vue'
import { applyInitialStyles, buildMotionOptions, resolveTag } from './shared'

/**
 * Vapor-mode motion directive, structurally compatible with Vue's
 * VaporDirective signature: (el, value?) => cleanup.
 *
 * Vapor directives receive no vnode and cannot call lifecycle hooks, so:
 * - options come only from the binding value (no vnode props syntax)
 * - mount runs in a post-flush effect, once the element is inserted
 * - updates mirror the vdom directive's beforeUpdate/updated split via
 *   pre/post watchers on the reactive value getter
 * - cleanup replaces the unmounted hook
 *
 * Limitations vs the vdom directive: no parent-child variant propagation,
 * no presence/exit animations, no MotionConfig/LayoutGroup context, no SSR
 * styles — Vapor exposes no component instance tree to bridge contexts.
 */
export type VaporMotionDirective = (
  el: HTMLElement | SVGElement,
  value?: () => Options,
) => () => void

/**
 * Create a vapor-mode v-motion directive with the given feature bundle.
 * If no bundle is provided, defaults to domMax (all features).
 */
export function createVaporMotionDirective(
  featureBundle?: FeatureBundle,
  defaultOptions?: Options,
): VaporMotionDirective {
  const renderer = featureBundle?.renderer ?? defaultRenderer
  const features = featureBundle?.features ?? domMax.features

  return (el, value) => {
    const resolveOptions = () => {
      const userProps = value?.() ?? {}
      const motionProps = defaultOptions ? { ...defaultOptions, ...userProps } : userProps
      return buildMotionOptions(motionProps, {}, resolveTag(el)).options
    }

    const state = new MotionState(resolveOptions(), undefined, { renderer, features })
    mountedStates.set(el, state)

    let mounted = false
    const stopPre = watchEffect(() => {
      // Always read the value getter so its reactive deps are tracked,
      // even on the synchronous first run before mount.
      const options = resolveOptions()
      if (!mounted)
        return
      state.updateOptions(options)
      state.getSnapshot(true)
    })
    const stopPost = watchPostEffect(() => {
      // Track the same reactive deps as the pre watcher so updates re-run post-flush.
      value?.()
      if (!mounted) {
        mounted = true
        applyInitialStyles(el, state)
        state.mount(el)
        return
      }
      state.update()
    })

    return () => {
      stopPre()
      stopPost()
      state.unmount()
    }
  }
}

export const vMotionVapor = createVaporMotionDirective(domMax)
