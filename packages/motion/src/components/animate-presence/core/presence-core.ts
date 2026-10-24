/**
 * Framework-agnostic port of framer-motion's AnimatePresence state machine
 * (motion/packages/framer-motion/src/components/AnimatePresence/index.tsx).
 *
 * Everything below the transition-hook layer mirrors upstream: the same state
 * (`renderedChildren`, `pendingPresentChildren`, `exitComplete`,
 * `exitingComponents`), the same diff, and the same splice-at-the-old-index
 * placement. Only the rendering adapter is Vue-specific.
 *
 * Upstream keeps `exitComplete` and `exitingComponents` as separate stores
 * because `onExit` arrives from a child callback that can run before the
 * layout effect that fills `exitComplete`. The Vue core is synchronous, so the
 * two never disagree, but they are kept apart to stay comparable line by line.
 *
 * The core tracks keys only: `C` is an opaque child handle (VNode for the
 * vdom adapter, a block factory for vapor). Renderers receive the merged
 * render set via `onRenderSetChange` and own everything DOM.
 */

export type PresenceKey = string | number | symbol

export type PresenceMode = 'sync' | 'wait' | 'popLayout'

export interface PresenceChildInput<C> {
  key: PresenceKey
  child: C
}

export interface PresenceEntry<C> extends PresenceChildInput<C> {
  isPresent: boolean
}

export interface PresenceCoreConfig<C> {
  /** Read at every sync — mode is a reactive prop in both adapters. */
  getMode: () => PresenceMode
  onRenderSetChange: (entries: ReadonlyArray<PresenceEntry<C>>) => void
  /** Fires when the last exiting key completes and the render set commits. */
  onExitComplete?: () => void
}

export interface PresenceCore<C> {
  /** Diff a new children list against the render set. */
  syncChildren: (next: Array<PresenceChildInput<C>>) => void
  /**
   * One key's exit fully completed (aggregated by its PresenceChild
   * wrapper across however many motion elements that subtree holds).
   */
  completeExit: (key: PresenceKey) => void
  getRendered: () => ReadonlyArray<PresenceEntry<C>>
}

export function createPresenceCore<C>(config: PresenceCoreConfig<C>): PresenceCore<C> {
  /** Children currently on screen, exiting ones included. */
  let renderedChildren: PresenceEntry<C>[] = []
  /**
   * The latest committed children. Once every exit has settled this replaces
   * the render set, rather than whatever was last rendered.
   */
  let pendingPresentChildren: PresenceEntry<C>[] = []
  /** Which exiting keys have finished animating out. */
  const exitComplete = new Map<PresenceKey, boolean>()
  /** Which keys are currently processing exit, to prevent duplicate processing. */
  const exitingComponents = new Set<PresenceKey>()

  function syncChildren(next: Array<PresenceChildInput<C>>) {
    const presentChildren: PresenceEntry<C>[] = next.map(({ key, child }) => ({ key, child, isPresent: true }))
    const presentKeys = presentChildren.map(entry => entry.key)
    pendingPresentChildren = presentChildren

    /**
     * Update complete status of exiting children.
     */
    for (const entry of renderedChildren) {
      if (!presentKeys.includes(entry.key)) {
        if (exitComplete.get(entry.key) !== true)
          exitComplete.set(entry.key, false)
      }
      else {
        exitComplete.delete(entry.key)
        exitingComponents.delete(entry.key)
      }
    }

    const exitingChildren: PresenceEntry<C>[] = []
    const nextChildren = [...presentChildren]

    /**
     * Loop through the currently rendered components and decide which are
     * exiting.
     */
    for (let i = 0; i < renderedChildren.length; i++) {
      const entry = renderedChildren[i]

      if (!presentKeys.includes(entry.key)) {
        const exiting: PresenceEntry<C> = { key: entry.key, child: entry.child, isPresent: false }
        nextChildren.splice(i, 0, exiting)
        exitingChildren.push(exiting)
      }
    }

    /**
     * If we're in "wait" mode, and we have exiting children, we want to only
     * render these until they've all exited.
     */
    renderedChildren = config.getMode() === 'wait' && exitingChildren.length
      ? exitingChildren
      : nextChildren

    config.onRenderSetChange(renderedChildren)
  }

  function completeExit(key: PresenceKey) {
    if (exitingComponents.has(key))
      return
    exitingComponents.add(key)

    if (exitComplete.has(key))
      exitComplete.set(key, true)
    else
      return

    let isEveryExitComplete = true
    exitComplete.forEach((isExitComplete) => {
      if (!isExitComplete)
        isEveryExitComplete = false
    })

    if (isEveryExitComplete) {
      renderedChildren = pendingPresentChildren
      exitComplete.clear()
      exitingComponents.clear()
      config.onRenderSetChange(renderedChildren)
      config.onExitComplete?.()
    }
  }

  return {
    syncChildren,
    completeExit,
    getRendered: () => renderedChildren,
  }
}
