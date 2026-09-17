import type { AnimationPlaybackControls, TargetAndTransition, Transition } from 'motion-dom'

export type ViewAnimationType = 'enter' | 'exit' | 'share' | 'update'

export type ViewAnimationStartCallback = (
  animation: AnimationPlaybackControls,
  type: ViewAnimationType
) => void

export type ViewAnimationCompleteCallback = (type: ViewAnimationType) => void

export type ViewAnimationDefinition =
  | TargetAndTransition
  | ((types: string[]) => TargetAndTransition)

export interface ViewAnimationOptions {
  /**
   * Default transition for all animation types. Supports springs and
   * per-value overrides, with `layout` timing applied to the
   * size/position morph layer.
   */
  transition?: Transition
  /** Animation when the element enters the DOM. Defaults to the browser fade-in. */
  enter?: ViewAnimationDefinition
  /** Animation when the element leaves the DOM. Defaults to the browser fade-out. */
  exit?: ViewAnimationDefinition
  /** Animation for shared element transitions. Set on the entering component. */
  share?: ViewAnimationDefinition
  /**
   * Animation when content, style, size or position changes.
   * Custom values replace the crossfade but keep the size/position animation.
   */
  update?: ViewAnimationDefinition
  onAnimationStart?: ViewAnimationStartCallback
  onAnimationComplete?: ViewAnimationCompleteCallback
}

export interface AnimateViewProps extends ViewAnimationOptions {
  /**
   * Identifier for matching elements in shared element animations.
   * Must be unique per view.
   */
  name?: string
}

export interface StartViewTransitionOptions {
  /**
   * Contextual labels (e.g. navigation direction) forwarded to functional
   * `enter`/`exit`/`share`/`update` props.
   */
  types?: string[]
  /**
   * Keep the root layer in the transition, giving a full-page crossfade of
   * any unnamed content that changed (e.g. button text). Defaults to
   * `false`: the root is suppressed, matching React `<ViewTransition>`'s
   * `cancelRootViewTransitionName` behavior.
   */
  root?: boolean
}
