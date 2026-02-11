import { invariant } from 'hey-listen'
import { animateVisualElement, setTarget } from 'motion-dom'
import type { AnimationDefinition, LegacyAnimationControls, VisualElement } from 'motion-dom'

function stopAnimation(visualElement: VisualElement) {
  visualElement.values.forEach(value => value.stop())
}

/**
 * @deprecated
 */
export function animationControls(): LegacyAnimationControls {
  /**
   * Track whether the host component has mounted.
   */
  let hasMounted = false

  /**
   * A collection of linked component animation controls.
   */
  const subscribers = new Set<VisualElement>()

  const controls: LegacyAnimationControls = {
    subscribe(state) {
      subscribers.add(state)
      return () => void subscribers.delete(state)
    },

    start(definition, transitionOverride) {
      invariant(
        hasMounted,
        'controls.start() should only be called after a component has mounted. Consider calling within a useEffect hook.',
      )

      const animations: Array<Promise<any>> = []
      subscribers.forEach((visualElement) => {
        animations.push(
          animateVisualElement(visualElement, definition, {
            transitionOverride,
          }),
        )
      })

      return Promise.all(animations)
    },

    set(definition) {
      invariant(
        hasMounted,
        'controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook.',
      )

      return subscribers.forEach((visualElement) => {
        setValues(visualElement, definition)
      })
    },

    stop() {
      subscribers.forEach((visualElement) => {
        stopAnimation(visualElement)
      })
    },

    mount() {
      hasMounted = true

      return () => {
        hasMounted = false
        controls.stop()
      }
    },
  }

  return controls
}

export function setValues(
  visualElement: VisualElement,
  definition: AnimationDefinition,
) {
  if (Array.isArray(definition)) {
    return setVariants(visualElement, definition)
  }
  else if (typeof definition === 'string') {
    return setVariants(visualElement, [definition])
  }
  else {
    setTarget(visualElement, definition as any)
  }
}

function setVariants(visualElement: VisualElement, variantLabels: string[]) {
  const reversedLabels = [...variantLabels].reverse()

  reversedLabels.forEach((key) => {
    const variant = visualElement.getVariant(key)
    variant && setTarget(visualElement, variant)

    if (visualElement.variantChildren) {
      visualElement.variantChildren.forEach((child) => {
        setVariants(child, variantLabels)
      })
    }
  })
}
