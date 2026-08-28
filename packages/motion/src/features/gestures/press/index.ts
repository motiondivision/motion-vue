import { Feature } from '@/features/feature'
import type { Options } from '@/types'
import { frame, press } from 'motion-dom'
import type { EventInfo } from 'motion-dom'

function extractEventInfo(event: PointerEvent): EventInfo {
  return {
    point: {
      x: event.pageX,
      y: event.pageY,
    },
  }
}

export class PressGesture extends Feature {
  static key = 'press' as const

  private removePress: VoidFunction | undefined

  constructor(state) {
    super(state)
  }

  private isActive() {
    const { whilePress, onPress, onPressCancel, onPressStart } = this.state.options as any
    return Boolean(whilePress || onPress || onPressCancel || onPressStart)
  }

  private register() {
    const element = this.state.element as HTMLElement
    if (!element || !this.isActive())
      return

    this.removePress?.()
    this.removePress = press(
      element,
      (_el, startEvent) => {
        const props = this.state.options as Options
        // Upstream naming: `whileTap` is the public `whilePress` prop
        this.state.setActive('whileTap', true)
        if (props.onPressStart) {
          frame.postRender(() => props.onPressStart(startEvent, extractEventInfo(startEvent)))
        }

        return (endEvent, { success }) => {
          this.state.setActive('whileTap', false)
          const callbackName = success ? 'onPress' : 'onPressCancel'
          const callback = (this.state.options as any)[callbackName]
          if (callback) {
            frame.postRender(() => callback(endEvent, extractEventInfo(endEvent)))
          }
        }
      },
      { useGlobalTarget: (this.state.options as any).globalPressTarget },
    )
  }

  mount() {
    this.register()
  }

  update() {
    const prev = this.state.visualElement.prevProps as any
    // Visual element props carry upstream naming (whileTap) after the boundary
    const wasActive = Boolean(prev?.whileTap || prev?.onPress || prev?.onPressCancel || prev?.onPressStart)
    if (!wasActive && this.isActive()) {
      this.register()
    }
  }

  unmount() {
    this.removePress?.()
    this.removePress = undefined
  }
}
