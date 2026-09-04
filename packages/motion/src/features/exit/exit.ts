import type { AnimationType } from 'motion-dom'
import { frame } from 'motion-dom'
import { Feature } from '@/features/feature'

/**
 * Owns the AnimatePresence exit protocol for a motion state: run the exit
 * animation, defer completion across the layoutId projection handoff, and
 * resolve the session's promise exactly once. The `isExiting` flag itself
 * lives on MotionState; this feature owns the sequence around it.
 *
 * The generation counter is bumped by exit() and reenter() — a completion
 * carrying a stale generation is a silent no-op, which is how mid-exit
 * reentry and re-entry-then-exit-again sequences stay consistent.
 */
export class ExitFeature extends Feature {
  static key = 'exit' as const

  private exitGeneration = 0
  private pendingExit?: { resolve: () => void }

  /**
   * Run the full exit sequence for AnimatePresence and resolve when this
   * state's exit completes — including the layoutId projection handoff,
   * which is signalled back via completeExitFromProjection().
   */
  exit(): Promise<void> {
    const generation = ++this.exitGeneration
    const state = this.state
    state.isExiting = true

    const completion = new Promise<void>((resolve) => {
      this.pendingExit = { resolve }
    })

    const exitAnimation = state.visualElement?.animationState?.setActive('exit' as AnimationType, true)
    if (exitAnimation) {
      exitAnimation.then(() => {
        if (generation !== this.exitGeneration)
          return
        state.isExiting = false
        state.options?.layoutId
          ? frame.postRender(() => this.tryCompleteExit(generation))
          : this.tryCompleteExit(generation)
      })
    }
    else {
      state.isExiting = false
      this.tryCompleteExit(generation)
    }

    state.getSnapshot(false)
    return completion
  }

  /** Re-enter while an exit is in flight; the stale exit resolves silently. */
  reenter() {
    this.exitGeneration++
    this.settleExit()
    this.state.isExiting = false
    this.state.setActive('exit', false)
    this.state.getSnapshot(true)
  }

  /** ProjectionFeature notifies here when a layoutId exit handoff completes. */
  completeExitFromProjection() {
    this.tryCompleteExit(this.exitGeneration)
  }

  private tryCompleteExit(generation: number) {
    if (generation !== this.exitGeneration || this.state.isExiting)
      return
    if (this.state.options?.layoutId
      && this.state.visualElement.projection?.currentAnimation?.state === 'running') {
      return
    }
    this.settleExit()
  }

  private settleExit() {
    this.pendingExit?.resolve()
    this.pendingExit = undefined
  }

  /**
   * Register with the nearest AnimatePresence for exit discovery — only
   * states carrying the exit feature are discoverable, and mount/unmount
   * pairing keeps the registry exact (KeepAlive remounts re-register).
   */
  mount() {
    this.state.options.presenceContext?.register?.(this.state)
  }

  unmount() {
    this.state.options.presenceContext?.unregister?.(this.state)
    this.settleExit()
  }
}
