import type { App, ComponentInternalInstance, ComputedRef, Directive, VNode } from 'vue'
import type { Options } from '@/types'
import type { FeatureBundle } from '@/features/dom-animation'
import { domMax } from '@/features/dom-max'
import { MotionState, mountedStates } from '@/state'
import { createVisualElement as defaultRenderer } from '@/state/create-visual-element'
import { createSVGStyles, createStyles } from '@/state/style'
import { updateLazyFeatures } from '@/features/lazy-features'
import { isSVGElement, resolveInitialValues } from '@/state/utils'
import { warning } from 'hey-listen'
import { layoutGroupInjectionKey, motionInjectionKey } from '@/components/context'
import { animatePresenceInjectionKey } from '@/components/animate-presence/presence'
import { defaultConfig, motionConfigInjectionKey } from '@/components/motion-config/context'
import type { MotionConfigState } from '@/components/motion-config/types'
import { resolveMotionProps } from '@/utils/resolve-motion-props'

/**
 * Extract props from VNode and merge with binding value.
 * VNode props take priority over binding value for the same key.
 *
 * Supports both syntaxes:
 * - `<div v-motion :initial="{...}" :animate="{...}" />`  (props on element)
 * - `<div v-motion="{ initial: {...}, animate: {...} }" />`  (binding value)
 * - Mix of both (VNode props override binding value)
 */
function extractMotionProps(vnode: VNode | null, bindingValue: Options | undefined): Options {
  const vnodeProps = vnode?.props
  if (!vnodeProps)
    return bindingValue || {}
  return { ...(bindingValue || {}), ...vnodeProps }
}

/**
 * Clean up DOM side-effects from Vue's VNode prop patching on native elements.
 *
 * Vue checks `key in el` before patching — if true, sets as property (`el[key] = value`),
 * which creates an own property shadowing the prototype method (e.g. Element.prototype.animate).
 * `delete el[key]` removes the own property, restoring the prototype chain.
 */
function cleanVNodeProps(el: Element, vnodeProps: Record<string, any> | null) {
  if (!vnodeProps)
    return
  for (const key in vnodeProps) {
    const value = vnodeProps[key]
    if (typeof value !== 'function' && key in Element.prototype) {
      delete (el as any)[key]
    }
    if (value != null && typeof value === 'object' && key !== 'style') {
      el.removeAttribute(key)
    }
  }
}

function resolveTag(el: Element): string
function resolveTag(vnode: VNode): string
function resolveTag(source: Element | VNode): string {
  if (source instanceof Element)
    return source.tagName.toLowerCase()
  return typeof source.type === 'string' ? source.type : 'div'
}

/**
 * Compute CSS styles (and SVG attrs) from motion values.
 * Shared by SSR and client-side initial style application.
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

function resolveSSRStyles(options: Options): Record<string, string> | null {
  if (!options)
    return null
  const latestValues = resolveInitialValues(options)
  if (Object.keys(latestValues).length === 0)
    return null
  return computeStyles(latestValues, options.as as string || 'div', options.style).styles
}

function applyInitialStyles(el: HTMLElement | SVGElement, state: MotionState) {
  const { styles, attrs } = computeStyles(state.latestValues, resolveTag(el), state.options.style)
  if (attrs) {
    for (const key in attrs) el.setAttribute(key, String(attrs[key]))
  }
  if (styles) {
    for (const key in styles) el.style[key] = styles[key]
  }
}

function findComponentParent(vnode: VNode, root: ComponentInternalInstance): ComponentInternalInstance | null {
  // Walk the tree from root until we find the child vnode
  const stack = new Set<VNode>()
  const walk = (children: VNode[]): boolean => {
    for (const child of children) {
      if (!child)
        continue

      if (child === vnode || (child.el && vnode.el && child.el === vnode.el)) {
        return true
      }

      stack.add(child)
      let result
      if (child.suspense) {
        // @ts-expect-error ssContent is not typed
        result = walk([child.ssContent!])
      }
      else if (Array.isArray(child.children)) {
        result = walk(child.children as VNode[])
      }
      else if (child.component?.vnode) {
        result = walk([child.component?.subTree])
      }
      if (result) {
        return result
      }
      stack.delete(child)
    }

    return false
  }
  if (!walk([root.subTree])) {
    warning(false, 'Could not find original vnode, component will not inherit provides')
    return root
  }

  // Return the first component parent
  const result = Array.from(stack).reverse()
  for (const child of result) {
    if (child.component) {
      return child.component
    }
  }
  return root
}

/**
 * Resolve the provides object from the vnode's component tree.
 */
function resolveProvides(vnode: VNode, binding: any): Record<symbol, any> {
  // @ts-expect-error vnode.ctx is not typed
  return (vnode.ctx === binding.instance!.$
  // @ts-expect-error binding.instance!.$.provides is not typed
    ? findComponentParent(vnode, binding.instance!.$)?.provides
    // @ts-expect-error vnode.ctx.provides is not typed
    : vnode.ctx?.provides) ?? binding.instance!.$.provides
}

/**
 * Extract context values from the provides chain and build
 * a full options object matching useMotionState behavior.
 */
function buildMotionOptions(
  motionProps: Options,
  provides: Record<symbol, any>,
  tag: string,
): { options: Options, parentState: MotionState | null } {
  const parentState: MotionState | null = provides[motionInjectionKey as any] ?? null
  const layoutGroup = provides[layoutGroupInjectionKey as any] ?? {}
  const presenceContext = provides[animatePresenceInjectionKey as any] ?? {}
  const configRef: ComputedRef<MotionConfigState> | null = provides[motionConfigInjectionKey as any] ?? null
  const config = configRef?.value ?? defaultConfig
  return {
    parentState,
    options: resolveMotionProps(
      { ...motionProps, as: tag },
      { layoutGroup, presenceContext, config },
    ),
  }
}

/**
 * Create a v-motion directive with the given feature bundle.
 * If no bundle is provided, defaults to domMax (all features).
 *
 * @param featureBundle - Optional feature bundle (domAnimation or domMax)
 * @param defaultOptions - Optional default motion props merged under user props
 */
export function createMotionDirective(
  featureBundle?: FeatureBundle,
  defaultOptions?: Options,
): Directive<HTMLElement | SVGElement, Options> {
  const renderer = featureBundle?.renderer ?? defaultRenderer
  if (featureBundle?.features) {
    updateLazyFeatures(featureBundle.features)
  }

  function mergeMotionProps(vnode: VNode, bindingValue: Options | undefined): Options {
    const userProps = extractMotionProps(vnode, bindingValue)
    return defaultOptions ? { ...defaultOptions, ...userProps } : userProps
  }

  return {
    created(el, binding, vnode) {
      const provides = resolveProvides(vnode, binding)
      const motionProps = mergeMotionProps(vnode, binding.value)
      const { options, parentState } = buildMotionOptions(motionProps, provides, resolveTag(el))
      console.log('options', options)
      const state = new MotionState(options, parentState!)
      state.initVisualElement(renderer)
      mountedStates.set(el, state)
    },
    mounted(el, binding, vnode) {
      const state = mountedStates.get(el)
      if (!state)
        return
      cleanVNodeProps(el, vnode.props)
      applyInitialStyles(el, state)
      state.mount(el)
      state.updateFeatures()
    },

    beforeUpdate(el) {
      const state = mountedStates.get(el)
      if (!state)
        return
      state.beforeUpdate()
    },

    updated(el, binding, vnode) {
      const state = mountedStates.get(el)
      if (!state)
        return
      cleanVNodeProps(el, vnode.props)
      const provides = resolveProvides(vnode, binding)
      const motionProps = mergeMotionProps(vnode, binding.value)
      const { options } = buildMotionOptions(motionProps, provides, resolveTag(el))
      state.update(options)
    },

    beforeUnmount(el) {
      const state = mountedStates.get(el)
      if (!state)
        return
      state.beforeUnmount()
    },

    unmounted(el) {
      const state = mountedStates.get(el)
      if (!state)
        return
      if (!el.isConnected)
        state.unmount()
    },

    getSSRProps(binding, vnode) {
      const motionProps = mergeMotionProps(vnode, binding.value)
      const tag = vnode ? resolveTag(vnode) : 'div'
      const ssrStyles = resolveSSRStyles({ ...motionProps, as: tag })
      if (!ssrStyles)
        return {}
      return { style: ssrStyles }
    },
  }
}

/**
 * Create a preset directive with default motion options baked in.
 * Users can still override any option via binding value or VNode props.
 *
 * @example
 * ```ts
 * const vFadeIn = createPresetDirective({
 *   initial: { opacity: 0 },
 *   animate: { opacity: 1 },
 * })
 * app.directive('fade-in', vFadeIn)
 * ```
 */
export function createPresetDirective(
  preset: Options,
  featureBundle?: FeatureBundle,
): Directive<HTMLElement | SVGElement, Options> {
  return createMotionDirective(featureBundle ?? domMax, preset)
}

export const vMotion = createMotionDirective(domMax)

export interface MotionPluginOptions {
  /** Custom preset directives (e.g. { 'fade-in': { initial: { opacity: 0 }, animate: { opacity: 1 } } }) */
  presets?: Record<string, Options>
}

/** Structural type for app.use(MotionPlugin, options) — avoids Vue version mismatch on Plugin<> */
export interface MotionPluginType {
  install: (app: App, options?: MotionPluginOptions) => void
}

/**
 * Vue plugin for global v-motion directive registration.
 *
 * @example
 * ```ts
 * import { MotionPlugin } from 'motion-v'
 * app.use(MotionPlugin)
 *
 * // With custom presets
 * app.use(MotionPlugin, {
 *   presets: {
 *     'fade-in': { initial: { opacity: 0 }, animate: { opacity: 1 } },
 *   },
 * })
 * ```
 */
export const MotionPlugin: MotionPluginType = {
  install(app: App, options) {
    app.directive('motion', vMotion)
    if (options?.presets) {
      for (const [name, preset] of Object.entries(options.presets)) {
        app.directive(name, createPresetDirective(preset))
      }
    }
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vMotion: typeof vMotion
  }
}
