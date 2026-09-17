import type { AnimateViewProps, ViewAnimationType } from './types'

/**
 * A live `<AnimateView>` component instance. Implemented by the component
 * composable; consumed by the `startTransition` helper.
 */
export interface AnimateViewHandle {
  uid: string
  /**
   * The `view-transition-name`s currently written to the instance's root
   * element(s). Empty when not participating in a transition.
   */
  layerNames: string[]
  /** Write `view-transition-name` to the root element(s). */
  arm: () => void
  /** Remove previously written `view-transition-name`s. */
  disarm: () => void
  /** Plain snapshot of the current props (safe to use after unmount). */
  getProps: () => AnimateViewProps
  /** Current shared-element pairing name (`name` prop), if any. */
  getShareName: () => string | undefined
}

export interface ViewTransitionParticipant {
  handle: AnimateViewHandle
  layerNames: string[]
  type: ViewAnimationType
  props: AnimateViewProps
  shareName?: string
  /** Set when paired into a share animation driven by another participant. */
  consumed?: boolean
}

export interface ActiveViewTransition {
  types: string[]
  participants: ViewTransitionParticipant[]
}

const instances = new Set<AnimateViewHandle>()

/**
 * The transition currently collecting participants. Registration closes as
 * soon as the update has flushed — NOT when the animation finishes playing
 * (which can take seconds), so unrelated mounts/updates during playback are
 * never misregistered.
 */
let activeTransition: ActiveViewTransition | null = null

/**
 * The most recently started transition. The browser skips an interrupted
 * transition when a new one begins, and the skipped one's `finished` settles
 * too — this guard stops a stale transition from disarming names the newer
 * transition has armed.
 */
let latestTransition: ActiveViewTransition | null = null

/** Cancel functions returned by `animateViewLayers`, keyed by instance. */
const animationCleanups = new Map<AnimateViewHandle, () => void>()

export function registerAnimateView(handle: AnimateViewHandle): void {
  instances.add(handle)
}

export function unregisterAnimateView(handle: AnimateViewHandle): void {
  instances.delete(handle)
}

export function getAnimateViews(): Set<AnimateViewHandle> {
  return instances
}

export function getActiveViewTransition(): ActiveViewTransition | null {
  return activeTransition
}

export function beginViewTransition(types: string[]): ActiveViewTransition {
  activeTransition = { types, participants: [] }
  latestTransition = activeTransition
  return activeTransition
}

/**
 * Close participant registration once the transition's DOM update has
 * flushed. The transition's pseudo-element snapshot is taken after this
 * point, so no further lifecycle events can belong to it.
 */
export function closeViewTransitionRegistration(transition: ActiveViewTransition): void {
  if (activeTransition === transition) {
    activeTransition = null
  }
}

export function endViewTransition(transition: ActiveViewTransition): void {
  if (latestTransition !== transition)
    return
  latestTransition = null

  for (const instance of instances) {
    instance.disarm()
  }
  if (activeTransition === transition) {
    activeTransition = null
  }

  /**
   * Destroy every layer animation, not just forget them. Custom-value
   * animations are WAAPI animations attached to pseudo-elements BY NAME —
   * left lingering, they re-attach and replay when the same name reappears
   * in a later transition (wrap-around carousels, repeated shared-element
   * opens), and their accumulation crashes the Chrome renderer on rapid
   * navigation.
   */
  for (const cleanup of animationCleanups.values()) {
    cleanup()
  }
  animationCleanups.clear()
}

/**
 * Store the cancel function for a participant's layer animation(s).
 * Multi-root participants produce one call per layer name — compose them.
 */
export function setViewTransitionCleanup(handle: AnimateViewHandle, cleanup: () => void): void {
  const existing = animationCleanups.get(handle)
  animationCleanups.set(
    handle,
    existing
      ? () => {
          existing()
          cleanup()
        }
      : cleanup,
  )
}

/**
 * Cancel a layer animation still playing for an unmounted instance. Also
 * suppresses its `onAnimationComplete` via the cleanup's `active` guard.
 */
export function cancelViewTransitionAnimation(handle: AnimateViewHandle): void {
  const cleanup = animationCleanups.get(handle)
  if (cleanup) {
    animationCleanups.delete(handle)
    cleanup()
  }
}

/**
 * Record that an instance is participating in the active transition.
 * The first recorded type wins within a single transition — an entering
 * element that also re-renders stays an "enter", not an "update".
 */
export function recordParticipant(
  type: ViewAnimationType,
  handle: AnimateViewHandle,
  transition: ActiveViewTransition | null = activeTransition,
): void {
  if (!transition)
    return
  if (transition.participants.some(p => p.handle === handle))
    return

  transition.participants.push({
    handle,
    layerNames: [...handle.layerNames],
    type,
    props: handle.getProps(),
    shareName: handle.getShareName(),
  })
}
