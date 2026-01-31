import type { EventInfo } from 'motion-dom'
import type { Point, TransformPoint } from 'motion-utils'
import { addPointerEvent, isPrimaryPointer } from '@/events'
import { extractEventInfo } from '@/events/event-info'
import { cancelFrame, distance2D, frame, frameData } from 'framer-motion/dom'
import { millisecondsToSeconds, pipe, secondsToMilliseconds } from 'motion-utils'
/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
 *
 * ```jsx
 * <motion.div onPan={(event, info) => {
 *   console.log(info.point.x, info.point.y)
 * }} />
 * ```
 *
 * @public
 */
export interface PanInfo {
  /**
   * Contains `x` and `y` values for the current pan position relative
   * to the device or page.
   *
   * ```jsx
   * function onPan(event, info) {
   *   console.log(info.point.x, info.point.y)
   * }
   *
   * <motion.div onPan={onPan} />
   * ```
   *
   * @public
   */
  point: Point
  /**
   * Contains `x` and `y` values for the distance moved since
   * the last event.
   *
   * ```jsx
   * function onPan(event, info) {
   *   console.log(info.delta.x, info.delta.y)
   * }
   *
   * <motion.div onPan={onPan} />
   * ```
   *
   * @public
   */
  delta: Point
  /**
   * Contains `x` and `y` values for the distance moved from
   * the first pan event.
   *
   * ```jsx
   * function onPan(event, info) {
   *   console.log(info.offset.x, info.offset.y)
   * }
   *
   * <motion.div onPan={onPan} />
   * ```
   *
   * @public
   */
  offset: Point
  /**
   * Contains `x` and `y` values for the current velocity of the pointer, in px/ms.
   *
   * ```jsx
   * function onPan(event, info) {
   *   console.log(info.velocity.x, info.velocity.y)
   * }
   *
   * <motion.div onPan={onPan} />
   * ```
   *
   * @public
   */
  velocity: Point
}

export type PanHandler = (event: Event, info: PanInfo) => void
interface PanSessionHandlers {
  onSessionStart: PanHandler
  onStart: PanHandler
  onMove: PanHandler
  onEnd: PanHandler
  onSessionEnd: PanHandler
  resumeAnimation: () => void
}

interface PanSessionOptions {
  transformPagePoint?: TransformPoint
  contextWindow?: (Window & typeof globalThis) | null
  dragSnapToOrigin?: boolean
  element?: HTMLElement | null
}

interface TimestampedPoint extends Point {
  timestamp: number
}

const overflowStyles = /* #__PURE__ */ new Set(['auto', 'scroll'])

/**
 * @internal
 */
export class PanSession {
  /**
   * @internal
   */
  private history: TimestampedPoint[]

  /**
   * @internal
   */
  private startEvent: PointerEvent | null = null

  /**
   * @internal
   */
  private lastMoveEvent: PointerEvent | null = null

  /**
   * @internal
   */
  private lastMoveEventInfo: EventInfo | null = null

  /**
   * @internal
   */
  private transformPagePoint?: TransformPoint

  /**
   * @internal
   */
  private handlers: Partial<PanSessionHandlers> = {}

  /**
   * @internal
   */
  private removeListeners: Function

  /**
   * For determining if an animation should resume after it is interupted
   *
   * @internal
   */
  private dragSnapToOrigin: boolean

  /**
   * @internal
   */
  private contextWindow: PanSessionOptions['contextWindow'] = window

  /**
   * Element being dragged. When provided, scroll events on its
   * ancestors and window are compensated so the gesture continues
   * smoothly during scroll.
   */
  element?: HTMLElement | null
  /**
   * Track scroll positions of all ancestors when drag starts
   *
   * @internal
   */
  private scrollPositions = new Map<Element | Window, Point>()

  /**
   * Store cleanup function for scroll listeners
   *
   * @internal
   */
  private removeScrollListeners?: () => void

  constructor(
    event: PointerEvent,
    handlers: Partial<PanSessionHandlers>,
        { transformPagePoint, contextWindow, dragSnapToOrigin = false, element }: PanSessionOptions = {},
  ) {
    // If we have more than one touch, don't start detecting this gesture
    if (!isPrimaryPointer(event))
      return

    this.dragSnapToOrigin = dragSnapToOrigin
    this.handlers = handlers
    this.transformPagePoint = transformPagePoint
    this.contextWindow = contextWindow || window

    const info = extractEventInfo(event)
    const initialInfo = transformPoint(info, this.transformPagePoint)
    const { point } = initialInfo

    const { timestamp } = frameData

    this.history = [{ ...point, timestamp }]

    const { onSessionStart } = handlers
    onSessionStart
    && onSessionStart(event, getPanInfo(initialInfo, this.history))

    this.removeListeners = pipe(
      addPointerEvent(
        this.contextWindow,
        'pointermove',
        this.handlePointerMove,
      ),
      addPointerEvent(
        this.contextWindow,
        'pointerup',
        this.handlePointerUp,
      ),
      addPointerEvent(
        this.contextWindow,
        'pointercancel',
        this.handlePointerUp,
      ),
    )

    // Start tracking scroll positions if element is provided
    if (element) {
      this.startScrollTracking(element)
    }
  }

  /**
   * Check if element has scrollable overflow
   */
  private isScrollable(node: Element): boolean {
    const style = window.getComputedStyle(node)
    return (
      style.overflow === 'auto'
      || style.overflow === 'scroll'
      || style.overflowX === 'auto'
      || style.overflowX === 'scroll'
      || style.overflowY === 'auto'
      || style.overflowY === 'scroll'
    )
  }

  /**
   * Start tracking scroll on ancestors and window.
   */
  /**
   * Start tracking scroll on ancestors and window.
   */
  private startScrollTracking(element: HTMLElement): void {
    // Store initial scroll positions for scrollable ancestors
    let current = element.parentElement
    while (current) {
      const style = getComputedStyle(current)
      if (
        overflowStyles.has(style.overflowX)
        || overflowStyles.has(style.overflowY)
      ) {
        this.scrollPositions.set(current, {
          x: current.scrollLeft,
          y: current.scrollTop,
        })
      }
      current = current.parentElement
    }

    // Track window scroll
    this.scrollPositions.set(window, {
      x: window.scrollX,
      y: window.scrollY,
    })

    // Capture listener catches element scroll events as they bubble
    window.addEventListener('scroll', this.onElementScroll, {
      capture: true,
      passive: true,
    })

    // Direct window scroll listener (window scroll doesn't bubble)
    window.addEventListener('scroll', this.onWindowScroll, {
      passive: true,
    })

    this.removeScrollListeners = () => {
      window.removeEventListener('scroll', this.onElementScroll, {
        capture: true,
      })
      window.removeEventListener('scroll', this.onWindowScroll)
    }
  }

  /**
   * Handle scroll events on elements
   */
  private onElementScroll = (event: Event): void => {
    this.handleScroll(event.target as Element)
  }

  /**
   * Handle window scroll
   */
  private onWindowScroll = (): void => {
    this.handleScroll(window)
  }

  /**
   * Handle scroll compensation during drag.
   *
   * For element scroll: adjusts history origin since pageX/pageY doesn't change.
   * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
   */
  private handleScroll(target: Element | Window): void {
    const initial = this.scrollPositions.get(target)
    if (!initial)
      return

    const isWindow = target === window
    const current = isWindow
      ? { x: window.scrollX, y: window.scrollY }
      : {
          x: (target as Element).scrollLeft,
          y: (target as Element).scrollTop,
        }

    const delta = { x: current.x - initial.x, y: current.y - initial.y }
    if (delta.x === 0 && delta.y === 0)
      return

    if (isWindow) {
      // Window scroll: pageX/pageY changes, so update lastMoveEventInfo
      if (this.lastMoveEventInfo) {
        this.lastMoveEventInfo.point.x += delta.x
        this.lastMoveEventInfo.point.y += delta.y
      }
    }
    else {
      // Element scroll: pageX/pageY unchanged, so adjust history origin
      if (this.history.length > 0) {
        this.history[0].x -= delta.x
        this.history[0].y -= delta.y
      }
    }

    this.scrollPositions.set(target, current)
    frame.update(this.updatePoint, true)
  }

  private updatePoint = () => {
    if (!(this.lastMoveEvent && this.lastMoveEventInfo))
      return

    const info = getPanInfo(this.lastMoveEventInfo, this.history)
    const isPanStarted = this.startEvent !== null

    // Only start panning if the offset is larger than 3 pixels. If we make it
    // any larger than this we'll want to reset the pointer history
    // on the first update to avoid visual snapping to the cursoe.
    const isDistancePastThreshold
            = distance2D(info.offset, { x: 0, y: 0 }) >= 3

    if (!isPanStarted && !isDistancePastThreshold)
      return

    const { point } = info
    const { timestamp } = frameData
    this.history.push({ ...point, timestamp })

    const { onStart, onMove } = this.handlers

    if (!isPanStarted) {
      onStart && onStart(this.lastMoveEvent, info)
      this.startEvent = this.lastMoveEvent
    }
    onMove && onMove(this.lastMoveEvent, info)
  }

  private handlePointerMove = (event: PointerEvent, info: EventInfo) => {
    this.lastMoveEvent = event
    this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint)
    // Throttle mouse move event to once per frame
    frame.update(this.updatePoint, true)
  }

  private handlePointerUp = (event: PointerEvent, info: EventInfo) => {
    this.end()

    const { onEnd, onSessionEnd, resumeAnimation } = this.handlers

    // Resume animation if dragSnapToOrigin is set OR if no drag started (user just clicked)
    // This ensures constraint animations continue when interrupted by a click
    if (this.dragSnapToOrigin || !this.startEvent) {
      resumeAnimation && resumeAnimation()
    }
    if (!(this.lastMoveEvent && this.lastMoveEventInfo))
      return

    const panInfo = getPanInfo(
      event.type === 'pointercancel'
        ? this.lastMoveEventInfo
        : transformPoint(info, this.transformPagePoint),
      this.history,
    )

    if (this.startEvent && onEnd) {
      onEnd(event, panInfo)
    }

    onSessionEnd && onSessionEnd(event, panInfo)
  }

  updateHandlers(handlers: Partial<PanSessionHandlers>) {
    this.handlers = handlers
  }

  end() {
    this.removeListeners && this.removeListeners()
    this.removeScrollListeners?.()
    this.scrollPositions.clear()
    cancelFrame(this.updatePoint)
  }
}

function transformPoint(
  info: EventInfo,
  transformPagePoint?: (point: Point) => Point,
) {
  return transformPagePoint ? { point: transformPagePoint(info.point) } : info
}

function subtractPoint(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y }
}

function getPanInfo({ point }: EventInfo, history: TimestampedPoint[]) {
  return {
    point,
    delta: subtractPoint(point, lastDevicePoint(history)),
    offset: subtractPoint(point, startDevicePoint(history)),
    velocity: getVelocity(history, 0.1),
  }
}

function startDevicePoint(history: TimestampedPoint[]): TimestampedPoint {
  return history[0]
}

function lastDevicePoint(history: TimestampedPoint[]): TimestampedPoint {
  return history[history.length - 1]
}

function getVelocity(history: TimestampedPoint[], timeDelta: number): Point {
  if (history.length < 2) {
    return { x: 0, y: 0 }
  }

  let i = history.length - 1
  let timestampedPoint: TimestampedPoint | null = null
  const lastPoint = lastDevicePoint(history)
  while (i >= 0) {
    timestampedPoint = history[i]
    if (
      lastPoint.timestamp - timestampedPoint.timestamp
      > secondsToMilliseconds(timeDelta)
    ) {
      break
    }
    i--
  }

  if (!timestampedPoint) {
    return { x: 0, y: 0 }
  }

  const time = millisecondsToSeconds(
    lastPoint.timestamp - timestampedPoint.timestamp,
  )
  if (time === 0) {
    return { x: 0, y: 0 }
  }

  const currentVelocity = {
    x: (lastPoint.x - timestampedPoint.x) / time,
    y: (lastPoint.y - timestampedPoint.y) / time,
  }

  if (currentVelocity.x === Infinity) {
    currentVelocity.x = 0
  }
  if (currentVelocity.y === Infinity) {
    currentVelocity.y = 0
  }

  return currentVelocity
}
