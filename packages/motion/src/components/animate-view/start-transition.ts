import { nextTick } from 'vue'
import { noop, warnOnce } from 'motion-utils'
import { animateViewLayers } from './animate-view-layers'
import type { ActiveViewTransition } from './context'
import {
  beginViewTransition,
  closeViewTransitionRegistration,
  endViewTransition,
  getAnimateViews,
  setViewTransitionCleanup,
} from './context'
import type { StartViewTransitionOptions } from './types'

interface QueuedUpdate {
  update: () => void | Promise<void>
  types: string[]
  root?: boolean
}

/**
 * View transitions are non-interruptible: starting one while another is
 * playing makes the browser skip the running transition, and its mid-flight
 * pseudo-element images leak into the new transition's old snapshot (visual
 * ghost stacking). React serializes transitions instead — updates committed
 * during playback wait, then flush as a single batched transition. This
 * queue mirrors that behavior.
 */
let isTransitionRunning = false
const updateQueue: QueuedUpdate[] = []

/**
 * Run a state update inside a native View Transition. Any `<AnimateView>`
 * component that enters, exits, updates or shares an element during the
 * update will animate with its configured animations.
 *
 * ```ts
 * startTransition(() => { show.value = !show.value }, { types: ['toggle'] })
 * ```
 *
 * If a transition is already playing, the update is queued and flushed —
 * batched with any others — once it finishes. Queued calls return
 * `undefined` and their state changes apply only when the queue drains
 * (React `startTransition` semantics).
 *
 * Returns the native `ViewTransition`, or `undefined` when queued, or when
 * the View Transitions API is unavailable (SSR or unsupported browsers —
 * the update still runs, without animation).
 */
export function startTransition(
  update: () => void | Promise<void>,
  options: StartViewTransitionOptions = {},
): ViewTransition | undefined {
  const isSupported
    = typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'

  if (!isSupported) {
    if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
      warnOnce(
        true,
        'startTransition: the View Transitions API is not supported in this browser. The update ran without animation.',
      )
    }
    void update()
    return undefined
  }

  updateQueue.push({ update, types: options.types ?? [], root: options.root })
  if (isTransitionRunning)
    return undefined

  return flushUpdateQueue()
}

function flushUpdateQueue(): ViewTransition | undefined {
  const batch = updateQueue.splice(0)
  if (batch.length === 0) {
    isTransitionRunning = false
    return undefined
  }
  isTransitionRunning = true

  // Merge queued contexts: types union (order-preserving), root if any asked
  const types = [...new Set(batch.flatMap(item => item.types))]
  const root = batch.some(item => item.root)

  const transition = beginViewTransition(types)

  /**
   * Arm every mounted instance *before* the update runs, so elements that
   * are about to exit already carry their `view-transition-name` when the
   * browser captures the old snapshot.
   */
  for (const instance of getAnimateViews()) {
    instance.arm()
  }

  const viewTransition = document.startViewTransition(async () => {
    for (const item of batch) {
      await item.update()
    }
    await nextTick()

    if (!root) {
      suppressRootLayer()
    }

    /**
     * The DOM update has flushed, so every mount/update/unmount belonging
     * to this transition has happened. Close registration now — the window
     * must not stay open while the animation plays (which can take
     * seconds), or unrelated lifecycle events would be misregistered.
     */
    closeViewTransitionRegistration(transition)
  })

  viewTransition.ready.then(() => runAnimations(transition)).catch(noop)
  viewTransition.finished.catch(noop).finally(() => {
    restoreRootLayer()
    endViewTransition(transition)
    // Flush anything queued during playback as one batched transition
    flushUpdateQueue()
  })

  return viewTransition
}

/**
 * Exclude the document root from the transition, mirroring React
 * `<ViewTransition>`'s `cancelRootViewTransitionName`:
 * `view-transition-name: none` before the new snapshot skips the root, so
 * unnamed content changes (e.g. button text) hard-cut instead of
 * crossfading the whole page.
 *
 * Deliberately name-only: React's original also hides/zero-sizes the root
 * pseudo layers via WAAPI `fill: 'forwards'` animations, but those
 * animation objects linger pointing at destroyed pseudo-elements and crash
 * the Chrome renderer when later transitions rebuild the pseudo tree.
 */
function suppressRootLayer(): void {
  const root = document.documentElement
  if (root.style.getPropertyValue('view-transition-name') !== '')
    return

  root.style.setProperty('view-transition-name', 'none')
}

function restoreRootLayer(): void {
  const root = document.documentElement
  if (root.style.getPropertyValue('view-transition-name') === 'none') {
    root.style.removeProperty('view-transition-name')
  }
}

function runAnimations(transition: ActiveViewTransition): void {
  pairSharedParticipants(transition)

  const seen = new Set<string>()
  for (const participant of transition.participants) {
    if (participant.consumed)
      continue

    for (const layerName of participant.layerNames) {
      if (seen.has(layerName))
        continue
      seen.add(layerName)

      /**
       * Keep the cancel function so an instance unmounted mid-playback can
       * cancel its layer animation (and suppress `onAnimationComplete`),
       * mirroring the cleanup React's `<ViewTransition>` performs.
       */
      const cleanup = animateViewLayers(layerName, participant.type, participant.props, transition.types)
      setViewTransitionCleanup(participant.handle, cleanup)
    }
  }
}

/**
 * Share pairing: an exiting and an entering instance with the same `name`
 * within this transition animate as a shared element, configured by the
 * entering side's props. The exiting participant is marked `consumed` so
 * the run loop skips it — the browser has already paired both sides under
 * one layer name.
 *
 * Note: components that neither enter, exit nor re-render are not detected
 * as participants even if the browser still morphs their position (e.g.
 * list reorder without a re-render) — their group layer plays with the
 * browser's default timing. Unlike React's `<ViewTransition>`, Vue has no
 * reconciler-level signal for this.
 */
function pairSharedParticipants(transition: ActiveViewTransition): void {
  const exits = transition.participants.filter(p => p.type === 'exit' && p.shareName)

  for (const participant of transition.participants) {
    if (participant.type !== 'enter' || !participant.shareName)
      continue

    const exit = exits.find(p => p.shareName === participant.shareName)
    if (exit) {
      participant.type = 'share'
      exit.consumed = true
    }
  }
}
