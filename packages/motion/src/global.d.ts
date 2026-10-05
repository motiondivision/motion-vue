export {}

/**
 * Ambient declaration for `AnimationEffect.pseudoElement` (CSS
 * Pseudo-Elements L4 / View Transitions), still missing from the DOM lib
 * even in TypeScript 6. `ViewTransition`/`startViewTransition` are covered
 * by the TS 6 lib and need no declaration here.
 */
declare global {
  interface AnimationEffect {
    readonly pseudoElement: string | null
  }
}
