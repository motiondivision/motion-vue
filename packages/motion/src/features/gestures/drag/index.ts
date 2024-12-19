import { Feature } from '@/features/feature'
import { noop } from '@/utils'

export class DragGesture extends Feature {
  controls: VisualElementDragControls

  removeGroupControls: Function = noop
  removeListeners: Function = noop

  constructor() {
    this.controls = new VisualElementDragControls(node)
  }

  mount() {
    // If we've been provided a DragControls for manual control over the drag gesture,
    // subscribe this component to it on mount.
    const { dragControls } = this.node.getProps()

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
