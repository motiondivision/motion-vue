import { Feature } from '@/features/feature'
import { VisualElementDragControls } from '@/features/gestures/drag/VisualElementDragControls'
import { noop } from 'framer-motion/dom'

export class DragGesture extends Feature {
  controls: VisualElementDragControls

  removeGroupControls: Function = noop
  removeListeners: Function = noop

  constructor(state) {
    super(state)
    this.controls = new VisualElementDragControls(state.visualElement)
  }

  mount() {
    // If we've been provided a DragControls for manual control over the drag gesture,
    // subscribe this component to it on mount.
    const { dragControls } = this.state.options

    if (dragControls) {
      this.removeGroupControls = dragControls.subscribe(this.controls)
    }
    this.removeListeners = this.controls.addListeners() || noop
  }

  unmount() {
    this.removeGroupControls()
    this.removeListeners()
  }
}
