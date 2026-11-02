import type { ReorderContextProps } from '../context'
import type { ReorderAxis } from '../types'
import { render } from '@testing-library/vue'
import { vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Reorder } from '@/index'
import { mountedStates } from '@/state'
import { useReorderContext } from '../context'

let currentContext: ReorderContextProps<string> | null = null

export const ContextCapture = defineComponent({
  setup() {
    currentContext = useReorderContext()
    return () => null
  },
})

export function cleanup() {
  document.body.innerHTML = ''
  currentContext = null
}

export function order(container: HTMLElement) {
  return Array.from(container.querySelectorAll('li')).map(item => item.getAttribute('data-testid'))
}

export function focused() {
  return document.activeElement?.getAttribute('data-testid')
}

export function isGrabbed(element: Element) {
  return Boolean(mountedStates.get(element)?.visualElement.animationState?.getState().whileDrag.isActive)
}

export function registerLayouts(container: HTMLElement) {
  Array.from(container.querySelectorAll('li')).forEach((item, index) => {
    currentContext!.registerItem!(item.getAttribute('data-testid')!, {
      x: { min: index * 100, max: index * 100 + 100 },
      y: { min: index * 50, max: index * 50 + 50 },
    })
  })
}

export function registerGridLayouts(container: HTMLElement, columns = 3) {
  Array.from(container.querySelectorAll('li')).forEach((item, index) => {
    const x = (index % columns) * 100
    const y = Math.floor(index / columns) * 100
    currentContext!.registerItem!(item.getAttribute('data-testid')!, {
      x: { min: x, max: x + 100 },
      y: { min: y, max: y + 100 },
    })
  })
}

export async function press(element: Element, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  const result = element.dispatchEvent(event)
  await nextTick()
  return result
}

export async function renderGroup(options: {
  initial?: string[]
  axis?: ReorderAxis
  dir?: 'rtl'
  onUpdateValues?: ReturnType<typeof vi.fn>
  itemProps?: Record<string, any>
  unrendered?: string[]
} = {}) {
  const items = ref(options.initial ?? ['a', 'b', 'c'])
  const onUpdateValues = options.onUpdateValues ?? vi.fn()
  const wrapper = render(defineComponent({
    setup() {
      return () => h(Reorder.Group as any, {
        'values': items.value,
        'onUpdate:values': (newOrder: string[], moved: string) => {
          onUpdateValues(newOrder, moved)
          items.value = newOrder
        },
        'axis': options.axis ?? 'y',
        'style': options.dir ? { direction: options.dir } : undefined,
      }, () => [
        h(ContextCapture),
        ...items.value
          .filter(item => !options.unrendered?.includes(item))
          .map(item => h(Reorder.Item as any, {
            'key': item,
            'value': item,
            'data-testid': item,
            'whileDrag': { opacity: 0.5 },
            ...options.itemProps,
          }, () => [item, h('input', { 'data-testid': `${item}-input` })])),
      ])
    },
  }))

  await nextTick()
  registerLayouts(wrapper.container)

  return { ...wrapper, items, onUpdateValues }
}
