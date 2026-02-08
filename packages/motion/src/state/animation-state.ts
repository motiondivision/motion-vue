/**
 * Animation State Manager
 *
 * Ported from motion-dom/dist/es/render/utils/animation-state.mjs
 * Adaptations for Vue are marked with "// [Vue]" comments.
 */
import { resolveVariant, shallowCompare } from '@/state/utils'
import { isAnimationControls } from '@/animation/utils'
import { isVariantLabels } from '@/state/utils/is-variant-labels'
import type { MotionState } from '@/state/motion-state'
import type { VisualElement } from 'motion-dom'

// --- Aligned with motion-dom variantPriorityOrder ---
const variantPriorityOrder = [
  'animate',
  'whileInView',
  'whileFocus',
  'whileHover',
  'whilePress', // [Vue] motion-dom uses 'whileTap'
  'whileDrag',
  'exit',
] as const

export type AnimationType = (typeof variantPriorityOrder)[number]

const reversePriorityOrder = [...variantPriorityOrder].reverse()
const numAnimationTypes = variantPriorityOrder.length

export interface AnimationTypeState {
  isActive: boolean
  protectedKeys: Record<string, true>
  needsAnimating: Record<string, boolean>
  prevResolvedValues: Record<string, any>
  prevProp?: any
}

function createTypeState(isActive = false): AnimationTypeState {
  return {
    isActive,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {},
  }
}

function createState(): Record<string, AnimationTypeState> {
  return {
    animate: createTypeState(true),
    whileInView: createTypeState(),
    whileHover: createTypeState(),
    whilePress: createTypeState(), // [Vue] motion-dom: whileTap
    whileDrag: createTypeState(),
    whileFocus: createTypeState(),
    exit: createTypeState(),
  }
}

function checkVariantsDidChange(prev: any, next: any): boolean {
  if (typeof next === 'string') {
    return next !== prev
  }
  else if (Array.isArray(next)) {
    return !shallowCompare(next, prev)
  }
  return false
}

function isKeyframesTarget(v: any): v is any[] {
  return Array.isArray(v)
}

export interface AnimationStateAPI {
  animateChanges: (changedActiveType?: AnimationType) => Promise<any>
  setActive: (type: AnimationType, isActive: boolean) => Promise<any>
  setAnimateFunction: (fn: (visualElement: VisualElement<Element>) => (animations: any[]) => Promise<any>) => void
  getState: () => Record<string, AnimationTypeState>
  reset: () => void
}

/**
 * Create animation state manager.
 *
 * Ported from motion-dom's createAnimationState.
 * The resolution logic mirrors motion-dom so upstream diffs are easy to apply.
 * Execution is Vue-specific (injected via setAnimateFunction).
 *
 * @param visualElement - The visual element instance (aligned with motion-dom signature)
 */
export function createAnimationState(visualElement: VisualElement<Element>): AnimationStateAPI {
  // [Vue] motion-dom: createAnimateFunction(visualElement)
  // We use a no-op default; AnimationFeature injects the real one via setAnimateFunction
  let animate: (animations: any[]) => Promise<any> = () => Promise.resolve()
  let state = createState()
  let isInitialRender = true

  /**
   * [Vue] Helper to access the MotionState attached to the visual element.
   * In motion-dom, props/context/baseTarget are on the visualElement directly.
   * In motion-vue, they live on the MotionState instance.
   */
  const getMotionState = (): MotionState => (visualElement as any).state

  /**
   * This function will be used to reduce the animation definitions for
   * each active animation type into an object of resolved values for it.
   */
  const buildResolvedTypeValues = (type: AnimationType) => (acc: Record<string, any>, definition: any) => {
    // [Vue] motion-dom uses: resolveVariant(visualElement, definition, custom)
    // motion-vue's resolveVariant signature: resolveVariant(definition, variants, custom)
    const props = getMotionState().options
    const resolved = resolveVariant(
      definition,
      props.variants,
      type === 'exit'
        ? props.animatePresenceContext?.custom ?? props.custom
        : props.custom,
    )
    if (resolved) {
      const { transition: _transition, ...target } = resolved
      acc = { ...acc, ...target }
    }
    return acc
  }

  /**
   * This just allows us to inject mocked animation functions
   * @internal
   */
  function setAnimateFunction(makeAnimator: (visualElement: VisualElement<Element>) => (animations: any[]) => Promise<any>) {
    animate = makeAnimator(visualElement)
  }

  /**
   * When we receive new props, we need to:
   * 1. Create a list of protected keys for each type. This is a directory of
   *    value keys that are currently being "handled" by types of a higher priority
   *    so that whenever an animation is played of a given type, these values are
   *    protected from being animated.
   * 2. Determine if an animation type needs animating.
   * 3. Determine if any values have been removed from a type and figure out
   *    what to animate those to.
   */
  function animateChanges(changedActiveType?: AnimationType) {
    const motionState = getMotionState()
    const props = motionState.options
    // [Vue] motion-dom: getVariantContext(visualElement.parent) || {}
    const context = motionState.context || {}

    /**
     * A list of animations that we'll build into as we iterate through the animation
     * types. This will get executed at the end of the function.
     */
    const animations: Array<{ animation: any, options: Record<string, any> }> = []

    /**
     * Keep track of which values have been removed. Then, as we hit lower priority
     * animation types, we can check if they contain removed values and animate to that.
     */
    const removedKeys = new Set<string>()

    /**
     * A dictionary of all encountered keys. This is an object to let us build into and
     * copy it without iteration. Each time we hit an animation type we set its protected
     * keys - the keys its not allowed to animate - to the latest version of this object.
     */
    let encounteredKeys: Record<string, true> = {}

    /**
     * If a variant has been removed at a given index, and this component is controlling
     * variant animations, we want to ensure lower-priority variants are forced to animate.
     */
    let removedVariantIndex = Infinity

    /**
     * Iterate through all animation types in reverse priority order. For each, we want to
     * detect which values it's handling and whether or not they've changed (and therefore
     * need to be animated). If any values have been removed, we want to detect those in
     * lower priority props and flag for animation.
     */
    for (let i = 0; i < numAnimationTypes; i++) {
      const type = reversePriorityOrder[i]
      const typeState = state[type]
      const prop = props[type] !== undefined
        ? props[type]
        : context[type]
      const propIsVariant = isVariantLabels(prop)

      /**
       * If this type has *just* changed isActive status, set activeDelta
       * to that status. Otherwise set to null.
       */
      const activeDelta = type === changedActiveType ? typeState.isActive : null
      if (activeDelta === false)
        removedVariantIndex = i

      /**
       * If this prop is an inherited variant, rather than been set directly on the
       * component itself, we want to make sure we allow the parent to trigger animations.
       *
       * TODO: Can probably change this to a !isControllingVariants check
       */
      let isInherited = prop === context[type]
        && prop !== props[type]
        && propIsVariant

      if (
        isInherited
        && isInitialRender
        && visualElement.manuallyAnimateOnMount
      ) {
        isInherited = false
      }

      /**
       * Set all encountered keys so far as the protected keys for this type. This will
       * be any key that has been animated or otherwise handled by active, higher-priority types.
       */
      typeState.protectedKeys = { ...encounteredKeys }

      // Check if we can skip analysing this prop early
      if (
        // If it isn't active and hasn't *just* been set as inactive
        (!typeState.isActive && activeDelta === null)
        // If we didn't and don't have any defined prop for this animation type
        || (!prop && !typeState.prevProp)
        // Or if the prop doesn't define an animation
        || isAnimationControls(prop)
        || typeof prop === 'boolean'
      ) {
        continue
      }

      /**
       * As we go look through the values defined on this type, if we detect
       * a changed value or a value that was removed in a higher priority, we set
       * this to true and add this prop to the animation list.
       */
      const variantDidChange = checkVariantsDidChange(typeState.prevProp, prop)
      let shouldAnimateType = variantDidChange
        // If we're making this variant active, we want to always make it active
        || (type === changedActiveType
        && typeState.isActive
        && !isInherited
        && propIsVariant)
        // If we removed a higher-priority variant (i is in reverse order)
        || (i > removedVariantIndex && propIsVariant)

      let handledRemovedValues = false

      /**
       * As animations can be set as variant lists, variants or target objects, we
       * coerce everything to an array if it isn't one already
       */
      const definitionList = Array.isArray(prop) ? prop : [prop]

      /**
       * Build an object of all the resolved values. We'll use this in the subsequent
       * animateChanges calls to determine whether a value has changed.
       */
      let resolvedValues = definitionList.reduce(buildResolvedTypeValues(type), {})
      if (activeDelta === false)
        resolvedValues = {}

      /**
       * Now we need to loop through all the keys in the prev prop and this prop,
       * and decide:
       * 1. If the value has changed, and needs animating
       * 2. If it has been removed, and needs adding to the removedKeys set
       * 3. If it has been removed in a higher priority type and needs animating
       * 4. If it hasn't been removed in a higher priority but hasn't changed, and
       *    needs adding to the type's protectedKeys list.
       */
      const { prevResolvedValues = {} } = typeState
      const allKeys = {
        ...prevResolvedValues,
        ...resolvedValues,
      }

      const markToAnimate = (key: string) => {
        shouldAnimateType = true
        if (removedKeys.has(key)) {
          handledRemovedValues = true
          removedKeys.delete(key)
        }
        typeState.needsAnimating[key] = true
        // [Vue] motion-dom also does: visualElement.getValue(key)?.liveStyle = false
      }

      for (const key in allKeys) {
        const next = resolvedValues[key]
        const prev = prevResolvedValues[key]

        // If we've already handled this we can just skip ahead
        if (Object.prototype.hasOwnProperty.call(encounteredKeys, key))
          continue

        /**
         * If the value has changed, we probably want to animate it.
         */
        let valueHasChanged = false
        if (isKeyframesTarget(next) && isKeyframesTarget(prev)) {
          valueHasChanged = !shallowCompare(next, prev)
        }
        else {
          valueHasChanged = next !== prev
        }

        if (valueHasChanged) {
          if (next !== undefined && next !== null) {
            // If next is defined and doesn't equal prev, it needs animating
            markToAnimate(key)
          }
          else {
            // If it's undefined, it's been removed.
            removedKeys.add(key)
          }
        }
        else if (next !== undefined && removedKeys.has(key)) {
          /**
           * If next hasn't changed and it isn't undefined, we want to check if it's
           * been removed by a higher priority
           */
          markToAnimate(key)
        }
        else {
          /**
           * If it hasn't changed, we add it to the list of protected values
           * to ensure it doesn't get animated.
           */
          typeState.protectedKeys[key] = true
        }
      }

      /**
       * Update the typeState so next time animateChanges is called we can compare the
       * latest prop and resolvedValues to these.
       */
      typeState.prevProp = prop
      typeState.prevResolvedValues = resolvedValues

      if (typeState.isActive) {
        encounteredKeys = { ...encounteredKeys, ...resolvedValues }
      }

      if (isInitialRender && visualElement.blockInitialAnimation) {
        shouldAnimateType = false
      }

      /**
       * If this is an inherited prop we want to skip this animation
       * unless the inherited variants haven't changed on this render.
       */
      const willAnimateViaParent = isInherited && variantDidChange
      const needsAnimating = !willAnimateViaParent || handledRemovedValues

      if (shouldAnimateType && needsAnimating) {
        animations.push(
          ...definitionList.map((animation: any) => ({
            animation,
            options: { type },
          })),
        )
      }
    }

    /**
     * If there are some removed values that haven't been dealt with,
     * we need to create a new animation that falls back either to the value
     * defined in the style prop, or the last read value.
     */
    if (removedKeys.size) {
      const fallbackAnimation: Record<string, any> = {}
      removedKeys.forEach((key) => {
        // [Vue] Use motionState.baseTarget for fallback instead of visualElement.getBaseTarget
        fallbackAnimation[key] = motionState.baseTarget[key] ?? null
      })
      animations.push({ animation: fallbackAnimation, options: {} })
    }

    let shouldAnimate = Boolean(animations.length)

    if (
      isInitialRender
      && (props.initial === false || props.initial === props.animate)
      && !visualElement.manuallyAnimateOnMount
    ) {
      shouldAnimate = false
    }

    isInitialRender = false

    return shouldAnimate ? animate(animations) : Promise.resolve()
  }

  /**
   * Change whether a certain animation type is active.
   */
  function setActive(type: AnimationType, isActive: boolean) {
    // If the active state hasn't changed, we can safely do nothing here
    if (state[type].isActive === isActive)
      return Promise.resolve()

    // Propagate active change to children
    // Aligned with motion-dom: visualElement.variantChildren?.forEach(child => child.animationState?.setActive(...))
    visualElement.variantChildren?.forEach((child: any) => {
      child.animationState?.setActive(type, isActive)
    })

    state[type].isActive = isActive
    const animations = animateChanges(type)

    for (const key in state) {
      state[key].protectedKeys = {}
    }

    return animations
  }

  return {
    animateChanges,
    setActive,
    setAnimateFunction,
    getState: () => state,
    reset: () => {
      state = createState()
      // Temporarily disabling resetting isInitialRender flag
      // (aligned with motion-dom comment)
      // isInitialRender = true
    },
  }
}

export { checkVariantsDidChange }
