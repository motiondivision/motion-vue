import type { AnimationType } from 'motion-dom'
import { frame } from 'motion-dom'
import { Feature } from '@/features/feature'
import type { PresenceContext } from '@/components/animate-presence/presence'
import { createPresenceId } from '@/components/animate-presence/presence'

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

  /**
   * Epoch token for the exit protocol, bumped by both exit() and reenter().
   * Every async callback captures the generation it was issued in and no-ops
   * when stale — this is what keeps an exit → reenter → exit-again sequence
   * consistent: without it, the first exit's late animation resolution would
   * clobber isExiting (which the second exit just set) and settle the second
   * exit's pendingExit prematurely, removing the DOM mid-animation.
   */
  private exitGeneration = 0
  private pendingExit?: { resolve: () => void }
  /** This state's presence id, so completion reports reach the right entry. */
  private presenceId?: string | number
  /**
   * The context this state registered with, captured at mount. Completion must
   * be reported to this exact object: `options.presenceContext` is re-resolved
   * from the vnode tree on every update, and for the v-motion directive that
   * lookup can fail mid-exit (the exiting vnode is replayed by reference and
   * no longer sits where the tree walk expects it), silently degrading to `{}`
   * — reporting through current options would then drop the completion and the
   * element would stay in the DOM forever.
   */
  private presenceContext?: PresenceContext

  private unregister?: () => void
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
        // layoutId: defer the check to frame.postRender. The projection
        // handoff animation is created asynchronously (getSnapshot →
        // willUpdate → root.didUpdate → microtask/frame pipeline →
        // startAnimation), so currentAnimation may not exist yet when this
        // promise settles — checking synchronously would read `undefined`,
        // pass the gate, and remove the DOM before the shared layout
        // animation even starts. postRender is the earliest point in the
        // frame where the projection pipeline is guaranteed to have run.
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
    // A shared layout animation is still in flight — wait for it. The exit
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
    this.reportExitComplete()
    // The exit animation was what kept this state mounted while Vue skipped
    // the unmount: v-show hides in place and KeepAlive moves a deactivated
    // subtree into a detached container. Once the animation is over, a state
    // whose element left the document is no longer mounted, and a later
    // reactivation has to replay the mount path.
    this.state.unmountIfDetached()
  }

  private settleExit() {
    this.pendingExit?.resolve()
    this.pendingExit = undefined
  }

  /**
   * Report completion to the PresenceChild this state registered with. This is
   * the only exit completion path: a state with no presence id either sits
   * outside an AnimatePresence or has already unregistered, and neither should
   * hold the render set open.
   */
  private reportExitComplete() {
    if (this.presenceId === undefined)
      return
    this.presenceContext?.onExitComplete?.(this.presenceId)
  }

  mount() {
    const presenceContext = this.state.options.presenceContext
    if (!presenceContext?.register)
      return
    this.presenceContext = presenceContext
    this.presenceId = createPresenceId()
    this.unregister = presenceContext.register(this.presenceId, this.state)
  }

  unmount() {
    this.unregister?.()
    this.unregister = undefined
    this.presenceId = undefined
    this.presenceContext = undefined
    this.settleExit()
  }
}
