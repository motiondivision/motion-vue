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

  private isActive() {
    const { whilePress, onPress, onPressCancel, onPressStart } = this.node.props as any
    return Boolean(whilePress || onPress || onPressCancel || onPressStart)
  }

  private register() {
    const element = this.node.current as HTMLElement
    if (!element || !this.isActive())
      return

    this.removePress?.()
    this.removePress = press(
      element,
      (_el, startEvent) => {
        const props = this.node.props as Options
        this.node.animationState?.setActive('whilePress' as any, true)
        if (props.onPressStart) {
          frame.postRender(() => props.onPressStart(startEvent, extractEventInfo(startEvent)))
        }

        return (endEvent, { success }) => {
          this.node.animationState?.setActive('whilePress' as any, false)
          const callbackName = success ? 'onPress' : 'onPressCancel'
          const callback = (this.node.props as any)[callbackName]
          if (callback) {
            frame.postRender(() => callback(endEvent, extractEventInfo(endEvent)))
          }
        }
      },
      { useGlobalTarget: (this.node.props as any).globalPressTarget },
    )
  }

  mount() {
    this.register()
  }

  update() {
    const prev = this.node.prevProps as any
    const wasActive = Boolean(prev?.whilePress || prev?.whileTap || prev?.onPress || prev?.onPressCancel || prev?.onPressStart)
    if (!wasActive && this.isActive()) {
      this.register()
    }
  }

  unmount() {
    this.removePress?.()
    this.removePress = undefined
  }
}
