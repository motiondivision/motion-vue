import type { VariantLabels } from '@/state/types'

export interface BoundingBox {
  top: number
  right: number
  bottom: number
  left: number
}
type DragElastic = boolean | number | Partial<BoundingBox>

export interface DragOptions {
  /**
   * Enable dragging for this element. Set to `false` by default.
   * Set `true` to drag in both directions.
   * Set `"x"` or `"y"` to only drag in a specific direction.
   *
   * ```template
   * <Motion drag="x" />
   * ```
   */
  drag?: boolean | 'x' | 'y'
  /**
   * If `true`, the drag direction will be locked to the initial drag direction.
   * Set to `false` by default.
   *
   * ```template
   * <Motion dragOptions="{ directionLock: true, drag: 'x' }" />
   * ```
   */
  directionLock?: boolean

  /**
   * Allows drag gesture propagation to child components. Set to `false` by
   * default.
   *
   * ```template
   * <Motion dragOptions="{ propagation: true, drag: 'x' }" />
   * ```
   */
  propagation?: boolean
  /**
   * Applies constraints on the permitted draggable area.
   *
   * It can accept an object of optional `top`, `left`, `right`, and `bottom` values, measured in pixels.
   * This will define a distance the named edge of the draggable component.
   *
   * Alternatively, it can accept a `ref` to another component created with React's `useRef` hook.
   * This `ref` should be passed both to the draggable component's `dragConstraints` prop, and the `ref`
   * of the component you want to use as constraints.
   *
   * ```template
   * // In pixels
   * <Motion dragOptions="{ constraints: { left: 0, right: 300 }, drag: 'x' }" />
   *
   * // As a ref to another component
   * const MyComponent = () => {
   *   const constraintsRef = ref()
   *
   *   return (
   *     <div ref={constraintsRef}>
   *       <Motion dragOptions="{ constraints: constraintsRef, drag: 'x' }" />
   *     </div>
   *   )
   * }
   * ```
   */
  constraints?: false | Partial<BoundingBox> | HTMLElement

  /**
   * The degree of movement allowed outside constraints. 0 = no movement, 1 =
   * full movement.
   *
   * Set to `0.5` by default. Can also be set as `false` to disable movement.
   *
   * By passing an object of `top`/`right`/`bottom`/`left`, individual values can be set
   * per constraint. Any missing values will be set to `0`.
   *
   * ```template
   * <Motion dragOptions="{ dragElastic: 0.2, constraints: { left: 0, right: 300 }, drag: 'x' }" />
   * ```
   */
  elastic?: DragElastic
  /**
   * Apply momentum from the pan gesture to the component when dragging
   * finishes. Set to `true` by default.
   *
   * ```template
   * <Motion dragOptions="{ dragMomentum: false, constraints: { left: 0, right: 300 }, drag: 'x' }" />
   * ```
   */
  momentum?: boolean
  /**
   * Allows you to change dragging inertia parameters.
   * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
   * />
   * ```
   */
  // dragTransition?: InertiaOptions
  /**
   * Usually, dragging is initiated by pressing down on a component and moving it. For some
   * use-cases, for instance clicking at an arbitrary point on a video scrubber, we
   * might want to initiate dragging from a different component than the draggable one.
   *
   * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
   * the draggable component's `dragControls` prop. It exposes a `start` method
   * that can start dragging from pointer events on other components.
   *
   * ```jsx
   * const dragControls = useDragControls()
   *
   * function startDrag(event) {
   *   dragControls.start(event, { snapToCursor: true })
   * }
   *
   * return (
   *   <>
   *     <div onPointerDown={startDrag} />
   *     <motion.div drag="x" dragControls={dragControls} />
   *   </>
   * )
   * ```
   */
  // dragControls?: DragControls
  /**
   * If true, element will snap back to its origin when dragging ends.
   *
   * Enabling this is the equivalent of setting all `dragConstraints` axes to `0`
   * with `dragElastic={1}`, but when used together `dragConstraints` can define
   * a wider draggable area and `dragSnapToOrigin` will ensure the element
   * animates back to its origin on release.
   */
  snapToOrigin?: boolean
}

export interface DragProps {
  /**
   * Properties or variant label to animate to while the drag gesture is recognised.
   *
   * ```jsx
   * <motion.div whileDrag={{ scale: 1.2 }} />
   * ```
   */
  drag?: VariantLabels
  dragOptions?: DragOptions
}
