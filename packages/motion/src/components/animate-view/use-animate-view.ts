import type { ComponentInternalInstance } from 'vue'
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue'
import type { AnimateViewHandle } from './context'
import {
  cancelViewTransitionAnimation,
  getActiveViewTransition,
  recordParticipant,
  registerAnimateView,
  unregisterAnimateView,
} from './context'
import { injectViewTransitionResetStyles } from './reset-styles'
import type { AnimateViewProps } from './types'

let uidCounter = 0

/** charCode of 'a' — suffix base for multi-root layer names (`uid-a`, `uid-b`, …) */
const SUFFIX_A = 97

/**
 * Collect the nearest host DOM nodes of a component instance.
 *
 * How the traversal stays inside this component's DOM range:
 *
 * Vue maintains two pointers on every vnode that delimit its DOM output:
 *
 * - `subTree.el`     — the first DOM node this component rendered
 * - `subTree.anchor` — the last DOM node (only set on Fragment vnodes,
 *                      i.e. multi-root components)
 *
 * Vue guarantees a fragment's children are one contiguous run of siblings
 * between `el` and `anchor` (its own patch/move logic relies on this), so
 * walking `nextSibling` from `el` to `anchor` covers exactly this
 * component's top-level DOM — never nodes before or after it.
 *
 * Shapes this produces:
 *
 * - Single root (`<div/>`): `anchor` is absent, falls back to `el`, the
 *   loop stops after one node.
 * - Multi-root fragment (`<div/><div/>`): every top-level sibling in the
 *   `el → anchor` range is collected (they get suffixed names later,
 *   mirroring React's `name-a`/`name-b` behavior).
 * - Root is a child component: the child vnode's `el` is its own root DOM
 *   node, so we land on the "nearest host node" without recursing into the
 *   child's internals (we follow `nextSibling`, never `childNodes`).
 * - `<Teleport>` content renders elsewhere in the document, so it is
 *   structurally outside the `el → anchor` range and never collected.
 * - Text and comment nodes (Vue uses comments as `v-if` placeholders) are
 *   filtered out by the `nodeType === 1` check.
 */
function getRootElements(instance: ComponentInternalInstance): Element[] {
  const subTree = instance.subTree
  if (!subTree || !subTree.el)
    return []

  const elements: Element[] = []
  let node: Node | null = subTree.el as Node
  const anchor: Node = ((subTree as unknown as { anchor?: Node }).anchor ?? subTree.el) as Node
  const parent = (subTree.el as Node).parentNode

  while (node) {
    if (node.nodeType === 1)
      elements.push(node as Element)
    if (node === anchor)
      break
    node = node.nextSibling

    /**
     * Defensive bound: `el` and `anchor` must live in the same parent.
     * If `anchor` were ever unreachable as a following sibling (a broken
     * fragment invariant or a mid-patch intermediate state), stop instead
     * of walking past the component's range into unrelated siblings.
     */
    if (node && node.parentNode !== parent)
      break
  }

  return elements
}

/**
 * Register the current `<AnimateView>` instance with the view transition
 * registry and wire up lifecycle-based participation detection.
 *
 * Names are applied lazily: `startTransition` arms every mounted
 * instance right before the DOM update, and entering instances arm
 * themselves on mount. Outside a transition no `view-transition-name` is
 * written, so idle instances never interfere with other transitions.
 */
export function useAnimateView(props: AnimateViewProps): void {
  const instance = getCurrentInstance()!
  const uid = `motion-view-${++uidCounter}`

  let layerNames: string[] = []
  let armedElements: Element[] = []

  function computeLayerNames(count: number): string[] {
    const name = props.name ?? uid
    if (count <= 1)
      return [name]

    // Mirror React's suffixed auto-names for multi-root boundaries
    return Array.from({ length: count }, (_, i) => `${name}-${String.fromCharCode(SUFFIX_A + i)}`)
  }

  function arm(): void {
    disarm()

    armedElements = getRootElements(instance)
    layerNames = computeLayerNames(armedElements.length)

    armedElements.forEach((el, i) => {
      (el as HTMLElement).style.setProperty('view-transition-name', layerNames[i])
    })
  }

  function disarm(): void {
    for (const el of armedElements) {
      (el as HTMLElement).style.removeProperty('view-transition-name')
    }
    armedElements = []
    layerNames = []
  }

  /**
   * Spread, don't enumerate: any prop added to `AnimateViewProps` later is
   * captured automatically, so exit-time snapshots can't silently drop it.
   */
  function getPropsSnapshot(): AnimateViewProps {
    return { ...props }
  }

  const handle: AnimateViewHandle = {
    uid,
    get layerNames() {
      return layerNames
    },
    arm,
    disarm,
    getProps: getPropsSnapshot,
    getShareName: () => props.name,
  }

  onMounted(() => {
    injectViewTransitionResetStyles()
    registerAnimateView(handle)

    // Mounted inside an active transition's update: this instance is entering
    if (getActiveViewTransition()) {
      arm()
      recordParticipant('enter', handle)
    }
  })

  onUpdated(() => {
    if (!getActiveViewTransition())
      return

    // Roots may have changed in this re-render; re-arm before the new snapshot
    arm()
    recordParticipant('update', handle)
  })

  onBeforeUnmount(() => {
    // The element still carries its armed name, so the browser has captured
    // it in the old snapshot and will generate an exit pair
    if (getActiveViewTransition()) {
      recordParticipant('exit', handle)
    }
  })

  onUnmounted(() => {
    unregisterAnimateView(handle)
    // Cancel any layer animation still playing for this instance (no-op for
    // exits — their cleanup is only stored at `ready`, after unmount)
    cancelViewTransitionAnimation(handle)
    disarm()
  })
}
