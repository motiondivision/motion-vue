import type { DragControls } from '@/features/gestures/drag/use-drag-controls'
import type { VariantType } from '@/types'
import type { Axis, BoundingBox, DragElastic, InertiaOptions, PanInfo } from 'framer-motion'
import type { VariantLabels } from 'motion-dom'

export interface ResolvedConstraints {
  x: Partial<Axis>
  y: Partial<Axis>
}

/**
 * @public
 */
export interface DragHandlers {
  /**
   * Callback function that fires when dragging starts.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   onDragStart={
   *     (event, info) => console.log(info.point.x, info.point.y)
   *   }
   * />
   * ```
   *
   * @public
   */
  onDragStart?: (
    event: PointerEvent,
    info: PanInfo
  ) => void

  /**
   * Callback function that fires when dragging ends.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   onDragEnd={
   *     (event, info) => console.log(info.point.x, info.point.y)
   *   }
   * />
   * ```
   *
   * @public
   */
  onDragEnd?: (
    event: PointerEvent,
    info: PanInfo
  ) => void

  /**
   * Callback function that fires when the component is dragged.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   onDrag={
   *     (event, info) => console.log(info.point.x, info.point.y)
   *   }
   * />
   * ```
   *
   * @public
   */
  onDrag?: (event: PointerEvent, info: PanInfo) => void

  /**
   * Callback function that fires a drag direction is determined.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   dragDirectionLock
   *   onDirectionLock={axis => console.log(axis)}
   * />
   * ```
   *
   * @public
   */
  onDirectionLock?: (axis: 'x' | 'y') => void

  /**
   * Callback function that fires when drag momentum/bounce transition finishes.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   onDragTransitionEnd={() => console.log('Drag transition complete')}
   * />
   * ```
   *
   * @public
   */
  onDragTransitionEnd?: () => void
  /**
   * If `dragConstraints` is set to a HTMLElement, this callback will call with the measured drag constraints.
   *
   * @public
   */
  onMeasureDragConstraints?: (constraints: BoundingBox) => BoundingBox | void
}

export interface DragProps extends DragHandlers {
  /**
   * Enable dragging for this element. Set to `false` by default.
   * Set `true` to drag in both directions.
   * Set `"x"` or `"y"` to only drag in a specific direction.
   *
   * ```jsx
   * <motion.div drag="x" />
   * ```
   */
  drag?: boolean | 'x' | 'y'
  /**
   * If true, element will snap back to its origin when dragging ends.
   *
   * Enabling this is the equivalent of setting all `dragConstraints` axes to `0`
   * with `dragElastic={1}`, but when used together `dragConstraints` can define
   * a wider draggable area and `dragSnapToOrigin` will ensure the element
   * animates back to its origin on release.
   */
  dragSnapToOrigin?: boolean

  /**
   * If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
   *
   * ```jsx
   * <motion.div drag dragDirectionLock />
   * ```
   */
  dragDirectionLock?: boolean
  /**
   * Allows drag gesture propagation to child components. Set to `false` by
   * default.
   *
   * ```jsx
   * <motion.div drag="x" dragPropagation />
   * ```
   */
  dragPropagation?: boolean
  dragConstraints?: false | Partial<BoundingBox> | HTMLElement
  /**
   * The degree of movement allowed outside constraints. 0 = no movement, 1 =
   * full movement.
   *
   * Set to `0.5` by default. Can also be set as `false` to disable movement.
   *
   * By passing an object of `top`/`right`/`bottom`/`left`, individual values can be set
   * per constraint. Any missing values will be set to `0`.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   dragConstraints={{ left: 0, right: 300 }}
   *   dragElastic={0.2}
   * />
   * ```
   */
  dragElastic?: DragElastic
  /**
   * Apply momentum from the pan gesture to the component when dragging
   * finishes. Set to `true` by default.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   dragConstraints={{ left: 0, right: 300 }}
   *   dragMomentum={false}
   * />
   * ```
   */
  dragMomentum?: boolean
  /**
   * Allows you to change dragging inertia parameters.
   * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
   * See {@link https://framer.com/api/animation/#inertia | Inertia} for all properties you can use.
   *
   * ```jsx
   * <motion.div
   *   drag
   *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
   * />
   * ```
   */
  dragTransition?: InertiaOptions
  /**
   * By default, if `drag` is defined on a component then an event listener will be attached
   * to automatically initiate dragging when a user presses down on it.
   *
   * By setting `dragListener` to `false`, this event listener will not be created.
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
   *     <motion.div
   *       drag="x"
   *       dragControls={dragControls}
   *       dragListener={false}
   *     />
   *   </>
   * )
   * ```
   */
  dragListener?: boolean

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
  dragControls?: DragControls
  whileDrag?: VariantLabels | VariantType
}
