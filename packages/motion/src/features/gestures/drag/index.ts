import { Feature } from '@/features/feature'
import { VisualElementDragControls } from '@/features/gestures/drag/VisualElementDragControls'
import type { DragControls } from '@/features/gestures/drag/use-drag-controls'
import { noop } from 'motion-utils'
import type { Options } from '@/types'

export class DragGesture extends Feature {
  static key = 'drag' as const

  controls: VisualElementDragControls

  removeGroupControls: Function = noop
  removeListeners: Function = noop

  private prevDragControls?: DragControls
  private prevDrag: Options['drag']

  constructor(state) {
    super(state)
    this.controls = new VisualElementDragControls(state)
  }

  mount() {
    // If we've been provided a DragControls for manual control over the drag gesture,
    // subscribe this component to it on mount.
    const { dragControls, drag } = this.state.options

    if (dragControls) {
      this.removeGroupControls = dragControls.subscribe(this.controls)
    }
    this.prevDragControls = dragControls
    this.prevDrag = drag
    this.removeListeners = this.controls.addListeners() || noop
  }

  update() {
    const { dragControls, drag } = this.state.options

    if (dragControls !== this.prevDragControls) {
      this.removeGroupControls()
      this.removeGroupControls = dragControls
        ? dragControls.subscribe(this.controls)
        : noop
      this.prevDragControls = dragControls
    }

    if (this.prevDrag && !drag)
      this.controls.stop(undefined, undefined, this.prevDrag)
    this.prevDrag = drag
  }

  unmount() {
    this.removeGroupControls()
    this.removeListeners()
    // A component may briefly unmount and remount while the drag is still
    // active (KeepAlive, list reorder). If we're actively dragging, keep the
    // pan session — it continues tracking via its window-level listeners and
    // cleans up on pointerup. Otherwise end it so listeners don't leak.
    if (!this.controls.isDragging) {
      this.controls.endPanSession()
    }
  }
}
