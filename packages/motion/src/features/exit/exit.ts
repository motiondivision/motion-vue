import type { AnimationType } from 'motion-dom'
import { frame } from 'motion-dom'
import { Feature } from '@/features/feature'

/**
 * Owns the AnimatePresence exit protocol for a motion state: run the exit
 * animation, defer completion across the layoutId projection handoff, and
 * resolve the session's promise exactly once. This feature is the only
 * writer of the exit-in-flight flag exposed as MotionState.isExiting.
 *
 * exit() is idempotent while an exit is in flight. A duplicate leave joins
 * the pending completion instead of starting a second animation, which would
 * make motion-dom's no-op setActive resolve immediately and remove the DOM
 * mid-animation.
 *
 * The generation counter is bumped by exit(), reenter(), and unmount(). A
 * completion carrying a stale generation is a silent no-op, which is how
 * mid-exit reentry, unmount during exit, and re-entry-then-exit-again
 * sequences stay consistent.
 */
export class ExitFeature extends Feature {
  static key = 'exit' as const

  private exitGeneration = 0
  private pendingExit?: { promise: Promise<void>, resolve: () => void }

  /**
   * The only source of truth for MotionState.isExiting. Only this feature
   * writes it, so a stale external setActive promise cannot clear a live exit.
   */
  private activeExit = false

  get isExiting() {
    return this.activeExit
  }

  /**
   * Run the full exit sequence for AnimatePresence and resolve when this
   * state's exit completes, including the layoutId projection handoff,
   * which is signalled back via completeExitFromProjection().
   */
  exit(): Promise<void> {
    if (this.pendingExit)
      return this.pendingExit.promise

    const generation = ++this.exitGeneration
    const state = this.state
    this.activeExit = true

    let resolveExit!: () => void
    const promise = new Promise<void>((resolve) => {
      resolveExit = resolve
    })
    this.pendingExit = { promise, resolve: resolveExit }

    const exitAnimation = state.visualElement?.animationState?.setActive('exit' as AnimationType, true)
    if (exitAnimation) {
      exitAnimation.then(() => {
        if (generation !== this.exitGeneration)
          return
        this.activeExit = false
        // layoutId: defer the check to frame.postRender. The projection
        // handoff animation is created asynchronously (getSnapshot →
        // willUpdate → root.didUpdate → microtask/frame pipeline →
        // startAnimation), so currentAnimation may not exist yet when this
        // promise settles. Checking synchronously would read `undefined`,
        // pass the gate, and remove the DOM before the shared layout
        // animation even starts. postRender is the earliest point in the
        // frame where the projection pipeline is guaranteed to have run.
        state.options?.layoutId
          ? frame.postRender(() => this.tryCompleteExit(generation))
          : this.tryCompleteExit(generation)
      })
    }
    else {
      this.activeExit = false
      this.tryCompleteExit(generation)
    }

    state.getSnapshot(false)
    return promise
  }

  /** Re-enter while an exit is in flight; the stale exit resolves silently. */
  reenter() {
    this.exitGeneration++
    this.activeExit = false
    this.settleExit()
    this.state.setActive('exit', false)
    this.state.getSnapshot(true)
  }

  /** ProjectionFeature notifies here when a layoutId exit handoff completes. */
  completeExitFromProjection() {
    this.tryCompleteExit(this.exitGeneration)
  }

  private tryCompleteExit(generation: number) {
    if (generation !== this.exitGeneration || this.activeExit)
      return
    // A shared layout animation is still in flight. Wait for it. The exit
    // is only complete once the layoutId handoff finishes: removing the DOM
    // mid-handoff would cut the old element's crossfade and destroy the new
    // lead's render context. Note currentAnimation is not only this node's
    // own animation: motion-dom mirrors the lead's handoff animation onto
    // the exiting node via resumingFrom (startAnimation in
    // create-projection-node.ts), so this single check observes both.
    // Completion arrives via ProjectionFeature → completeExitFromProjection.
    if (this.state.options?.layoutId
      && this.state.visualElement.projection?.currentAnimation?.state === 'running') {
      return
    }
    this.settleExit()
  }

  private settleExit() {
    // Clear before resolving so a synchronous re-entry starts a fresh exit.
    const pending = this.pendingExit
    this.pendingExit = undefined
    pending?.resolve()
  }

  /**
   * Register with the nearest AnimatePresence for exit discovery. Only
   * states carrying the exit feature are discoverable, and mount/unmount
   * pairing keeps the registry exact (KeepAlive remounts re-register).
   */
  mount() {
    this.state.options.presenceContext?.register?.(this.state)
  }

  unmount() {
    this.exitGeneration++
    this.activeExit = false
    this.settleExit()
    this.state.options.presenceContext?.unregister?.(this.state)
  }
}
