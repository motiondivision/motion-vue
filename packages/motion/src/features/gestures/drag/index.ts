import { dispatchPointerEvent } from '@/utils/events'
import type { MotionState } from '@/state/motion-state'
import { BaseGesture } from '@/features/gestures'
import { animate } from 'framer-motion/dom'
import type { DragOptions } from '@/state/types'

export class DragGesture extends BaseGesture {
  private isDragging = false
  private currentPosition = { x: 0, y: 0 }
  private startPosition = { x: 0, y: 0 }
  private constraints?: DragOptions['constraints']

  isActive() {
    return Boolean(this.state.getOptions())
  }

  constructor(state: MotionState) {
    super(state)
    this.subscribeEvents = () => {
      const element = this.state.getElement()
      const options = (this.state.getOptions() as any).dragOptions || {}
      this.constraints = options.constraints

      const onPointerMove = (event: PointerEvent) => {
        if (!this.isDragging)
          return

        const deltaX = event.clientX - this.startPosition.x
        const deltaY = event.clientY - this.startPosition.y

        let newX = this.currentPosition.x + deltaX
        let newY = this.currentPosition.y + deltaY

        // 应用约束
        if (this.constraints) {
          if (this.constraints.left !== undefined)
            newX = Math.max(this.constraints.left, newX)
          if (this.constraints.right !== undefined)
            newX = Math.min(this.constraints.right, newX)
          if (this.constraints.top !== undefined)
            newY = Math.max(this.constraints.top, newY)
          if (this.constraints.bottom !== undefined)
            newY = Math.min(this.constraints.bottom, newY)
        }

        // 更新元素位置
        element.style.transform = `translate(${newX}px, ${newY}px)`

        dispatchPointerEvent(element, 'drag', {
          ...event,
          point: { x: newX, y: newY },
        })
      }

      const onPointerUp = (event: PointerEvent) => {
        if (!this.isDragging)
          return

        this.isDragging = false
        this.currentPosition.x += event.clientX - this.startPosition.x
        this.currentPosition.y += event.clientY - this.startPosition.y

        this.state.setActive('drag', false)
        dispatchPointerEvent(element, 'dragend', event)

        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)

        // 处理拖拽结束后的动画
        if (options.dragSnapToOrigin) {
          animate(element, {
            // eslint-disable-next-line ts/ban-ts-comment
            // @ts-expect-error
            x: 0,
            y: 0,
            transition: { type: 'spring', stiffness: 400, damping: 40 },
          })
          this.currentPosition = { x: 0, y: 0 }
        }
      }

      const onPointerDown = (event: PointerEvent) => {
        this.isDragging = true
        this.startPosition = { x: event.clientX, y: event.clientY }

        this.state.setActive('drag', true)
        dispatchPointerEvent(element, 'dragstart', event)

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
      }

      // 设置初始样式
      element.style.touchAction = 'none'
      element.style.userSelect = 'none'
      element.style.cursor = 'grab'

      element.addEventListener('pointerdown', onPointerDown as EventListener)

      return () => {
        element.removeEventListener('pointerdown', onPointerDown as EventListener)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }
    }
  }

  mount() {
    this.updateGestureSubscriptions()
  }

  update() {
    this.updateGestureSubscriptions()
  }
}
