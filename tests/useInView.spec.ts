import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useInView } from '../packages/motion/src/utils/use-in-view'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock inView from framer-motion
vi.mock('framer-motion/dom', () => ({
  inView: (element: Element, onStart: Function, options = {}) => {
    // Simulate the callback being called
    const cleanup = onStart()
    return () => {
      if (cleanup)
        cleanup()
    }
  },
}))

describe('useInView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a ref with initial value of false and update to true when element enters viewport', async () => {
    const TestComponent = defineComponent({
      setup() {
        const elementRef = ref<HTMLDivElement | null>(null)
        const isInView = useInView(elementRef)
        return { isInView, elementRef }
      },
      render() {
        return h('div', { ref: 'elementRef' })
      },
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.isInView).toBe(false)
    await nextTick()
    expect(wrapper.vm.isInView).toBe(true)
  })
})
