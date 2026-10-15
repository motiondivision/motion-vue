/**
 * Framework-agnostic port of framer-motion's AnimatePresence state machine
 * (motion/packages/framer-motion/src/components/AnimatePresence/index.tsx).
 *
 * The core tracks keys only: `C` is an opaque child handle (VNode for the
 * vdom adapter, a block factory for vapor). Renderers receive the merged
 * render set via `onRenderSetChange` and own everything DOM.
 *
 * State: `rendered` is what's on screen (present children plus vanished
 * keys spliced back at their original index, flagged isPresent=false).
 * `exitComplete` fans in per-key completion; when every exiting key is
 * done, `pendingPresent` replaces the render set in one commit — only then
 * does the framework actually unmount the exiting subtree.
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
  isPresent: (key: PresenceKey) => boolean
  /** Keys currently exiting — adapters size their per-key wrappers from this. */
  getExitingKeys: () => ReadonlySet<PresenceKey>
  getRendered: () => ReadonlyArray<PresenceEntry<C>>
}

export function createPresenceCore<C>(config: PresenceCoreConfig<C>): PresenceCore<C> {
  let rendered: PresenceEntry<C>[] = []
  let pendingPresent: PresenceEntry<C>[] = []
  const exitComplete = new Map<PresenceKey, boolean>()
  // Dedup guard: a key already exiting must not re-trigger exit bookkeeping
  // when a mid-exit sync still omits it (framer's exitingComponents).
  const exiting = new Set<PresenceKey>()

  function syncChildren(next: Array<PresenceChildInput<C>>) {
    const presentKeys = next.map(e => e.key)
    pendingPresent = next.map(({ key, child }) => ({ key, child, isPresent: true }))

    // Keys present again stop exiting — their wrappers observe the
    // isPresent flip and reenter.
    for (const key of presentKeys) {
      exiting.delete(key)
      exitComplete.delete(key)
    }

    const merged: PresenceEntry<C>[] = [...pendingPresent]
    const exitingEntries: PresenceEntry<C>[] = []
    rendered.forEach((entry, index) => {
      if (presentKeys.includes(entry.key))
        return
      if (!exiting.has(entry.key)) {
        exiting.add(entry.key)
        exitComplete.set(entry.key, false)
      }
      const exitingEntry = { key: entry.key, child: entry.child, isPresent: false }
      // Splice back at the original index so siblings don't reflow.
      merged.splice(index, 0, exitingEntry)
      exitingEntries.push(exitingEntry)
    })

    // wait: hold the incoming children until every exit completes.
    rendered = config.getMode() === 'wait' && exitingEntries.length > 0
      ? exitingEntries
      : merged

    config.onRenderSetChange(rendered)
  }

  function completeExit(key: PresenceKey) {
    if (!exiting.has(key))
      return
    exitComplete.set(key, true)
    for (const done of exitComplete.values()) {
      if (!done)
        return
    }
    rendered = pendingPresent
    exiting.clear()
    exitComplete.clear()
    config.onRenderSetChange(rendered)
    config.onExitComplete?.()
  }

  return {
    syncChildren,
    completeExit,
    isPresent: key => !exiting.has(key),
    getExitingKeys: () => exiting,
    getRendered: () => rendered,
  }
}
