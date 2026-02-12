import type { App, ObjectDirective, VNode } from 'vue'
import type { Options } from '@/types'
import type { FeatureBundle } from '@/features/dom-animation'
import { domMax } from '@/features/dom-max'
import { MotionState, mountedStates } from '@/state'
import { createVisualElement as defaultRenderer } from '@/state/create-visual-element'
import { createSVGStyles, createStyles } from '@/state/style'
import { updateLazyFeatures } from '@/features/lazy-features'
import { isSVGElement } from '@/state/utils'

/**
 * Extract props from VNode and merge with binding value.
 * VNode props take priority over binding value for the same key.
 *
 * Supports both syntaxes:
 * - `<div v-motion :initial="{...}" :animate="{...}" />`  (props on element)
 * - `<div v-motion="{ initial: {...}, animate: {...} }" />`  (binding value)
 * - Mix of both (VNode props override binding value)
 */
function extractMotionProps(vnode: VNode, bindingValue: Options | undefined): Options {
  const vnodeProps = vnode.props
  if (!vnodeProps)
    return bindingValue || {}
  return { ...(bindingValue || {}), ...vnodeProps }
}

/**
 * Clean up DOM side-effects from Vue's VNode prop patching on native elements.
 * - Restores native methods overwritten by prop patching (e.g. Element.prototype.animate)
 * - Removes object-valued attributes that become "[object Object]" on DOM
 *
 * Vue checks `key in el` before patching — if true, sets as property (`el[key] = value`),
 * which creates an own property shadowing the prototype method.
 * `delete el[key]` removes the own property, restoring the prototype chain.
 */
function cleanVNodeProps(el: Element, vnodeProps: Record<string, any> | null) {
  if (!vnodeProps)
    return
  for (const key in vnodeProps) {
    const value = vnodeProps[key]
    // Restore native DOM methods (e.g. animate, focus) overwritten by Vue prop patching
    if (typeof value !== 'function' && key in Element.prototype) {
      delete (el as any)[key]
    }
    // Remove object-valued attributes (e.g. initial="[object Object]")
    if (value != null && typeof value === 'object') {
      el.removeAttribute(key)
      el.removeAttribute(key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`))
    }
  }
}

function resolveOptions(el: Element, options: Options): Options {
  return { ...options, as: el.tagName.toLowerCase() }
}

/**
 * Compute CSS styles (and SVG attrs) from motion values.
 * Shared logic for both SSR and client-side initial style application.
 */
function computeStyles(
  values: Record<string, any>,
  tag: string,
  styleProp?: Record<string, any>,
): { styles: Record<string, any> | null, attrs?: Record<string, any> } {
  if (isSVGElement(tag as any)) {
    const { attrs, style } = createSVGStyles({ ...values }, tag, styleProp)
    return { styles: createStyles(style), attrs }
  }
  return { styles: createStyles({ ...styleProp, ...values }) }
}

/**
 * Resolve initial styles from Options for SSR rendering.
 * Uses MotionState to resolve latestValues, matching the component behavior exactly.
 */
function resolveSSRStyles(options: Options): Record<string, string> | null {
  if (!options)
    return null
  const state = new MotionState(options)
  if (Object.keys(state.latestValues).length === 0)
    return null
  return computeStyles(state.latestValues, options.as as string || 'div', options.style).styles
}

/**
 * Apply initial styles from latestValues onto the DOM element.
 */
function applyInitialStyles(el: HTMLElement | SVGElement, state: MotionState) {
  const tag = el.tagName.toLowerCase()
  const { styles, attrs } = computeStyles(state.latestValues, tag, state.options.style)
  if (attrs) {
    for (const key in attrs) el.setAttribute(key, String(attrs[key]))
  }
  if (styles) {
    for (const key in styles) el.style[key] = styles[key]
  }
}

/**
 * Create a v-motion directive with the given feature bundle.
 * If no bundle is provided, defaults to domMax (all features).
 */
export function createMotionDirective(
  featureBundle?: FeatureBundle,
): ObjectDirective<HTMLElement | SVGElement, Options> {
  const renderer = featureBundle?.renderer ?? defaultRenderer
  if (featureBundle?.features) {
    updateLazyFeatures(featureBundle.features)
  }

  return {
    created(el, { value }, vnode) {
      const motionProps = extractMotionProps(vnode, value)
      const options = resolveOptions(el, motionProps)
      const state = new MotionState(options)

      state.visualElement = renderer(options.as!, {
        presenceContext: null,
        parent: undefined,
        props: { ...options, whileTap: options.whilePress },
        visualState: {
          renderState: {
            transform: {},
            transformOrigin: {},
            style: {},
            vars: {},
            attrs: {},
          },
          latestValues: { ...state.latestValues },
        },
        reducedMotionConfig: options.motionConfig?.reducedMotion,
      })
      mountedStates.set(el, state)
    },

    mounted(el, _binding, vnode) {
      const state = mountedStates.get(el)
      if (!state)
        return
      cleanVNodeProps(el, vnode.props)
      applyInitialStyles(el, state)
      state.mount(el)
    },

    beforeUpdate(el) {
      const state = mountedStates.get(el)
      if (!state)
        return
      state.beforeUpdate()
    },

    updated(el, { value }, vnode) {
      const state = mountedStates.get(el)
      if (!state)
        return
      cleanVNodeProps(el, vnode.props)
      const motionProps = extractMotionProps(vnode, value)
      state.update(resolveOptions(el, motionProps))
    },

    beforeUnmount(el) {
      mountedStates.get(el)?.beforeUnmount()
    },

    unmounted(el) {
      const state = mountedStates.get(el)
      if (!state)
        return
      state.unmount()
    },

    getSSRProps(binding, vnode) {
      const motionProps = extractMotionProps(vnode, binding.value)
      const ssrStyles = resolveSSRStyles(motionProps)
      if (!ssrStyles)
        return {}
      return { style: ssrStyles }
    },
  }
}

// Default directive: uses domMax (all features)
export const vMotion = createMotionDirective(domMax)

/**
 * Vue plugin for global v-motion directive registration.
 *
 * @example
 * ```ts
 * import { MotionPlugin } from 'motion-v'
 * app.use(MotionPlugin)
 * ```
 */
export const MotionPlugin = {
  install(app: App, options?: { featureBundle?: FeatureBundle }) {
    const directive = options?.featureBundle
      ? createMotionDirective(options.featureBundle)
      : vMotion
    app.directive('motion', directive)
  },
}
