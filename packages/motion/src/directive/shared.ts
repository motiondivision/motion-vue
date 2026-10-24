import type { ComputedRef } from 'vue'
import type { Options } from '@/types'
import { layoutGroupInjectionKey, motionInjectionKey } from '@/components/context'
import { animatePresenceInjectionKey } from '@/components/animate-presence/presence'
import { defaultConfig, motionConfigInjectionKey } from '@/components/motion-config/context'
import type { MotionConfigState } from '@/components/motion-config/types'
import { resolveMotionProps } from '@/utils/resolve-motion-props'
import { createSVGStyles, createStyles } from '@/state/style'
import { isSVGElement } from '@/state/utils'
import type { MotionState } from '@/state'

export function resolveTag(el: Element): string {
  return el.tagName.toLowerCase()
}

/**
 * Compute CSS styles (and SVG attrs) from motion values.
 * Shared by SSR and client-side initial style application.
 */
export function computeStyles(
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

export function applyInitialStyles(el: HTMLElement | SVGElement, state: MotionState) {
  const { styles, attrs } = computeStyles(state.latestValues, resolveTag(el), state.options.style)
  if (attrs) {
    for (const key in attrs) el.setAttribute(key, String(attrs[key]))
  }
  if (styles) {
    for (const key in styles) el.style[key as any] = styles[key]
  }
}

/**
 * Extract context values from the provides chain and build
 * a full options object matching useMotionState behavior.
 */
export function buildMotionOptions(
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
