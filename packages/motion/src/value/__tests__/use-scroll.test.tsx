import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { useScroll } from '@/value/use-scroll'
import { delay } from '@/shared/test'

// Mock the scroll function from framer-motion/dom
const mockCleanup = vi.fn()
const mockScroll = vi.fn(() => mockCleanup)

vi.mock('framer-motion/dom', () => ({
  scroll: (...args: any[]) => mockScroll(...args),
}))

describe('useScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return four motion values', () => {
    const Component = defineComponent({
      setup() {
        const values = useScroll()
        return () => (
          <div
            data-scroll-x={values.scrollX.get()}
            data-scroll-y={values.scrollY.get()}
            data-scroll-x-progress={values.scrollXProgress.get()}
            data-scroll-y-progress={values.scrollYProgress.get()}
          />
        )
      },
    })

    const wrapper = mount(Component)
    const el = wrapper.element as HTMLElement
    expect(el.dataset.scrollX).toBe('0')
    expect(el.dataset.scrollY).toBe('0')
    expect(el.dataset.scrollXProgress).toBe('0')
    expect(el.dataset.scrollYProgress).toBe('0')
  })

  it('should call scroll with default options when no options provided', async () => {
    const Component = defineComponent({
      setup() {
        useScroll()
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    const [, options] = mockScroll.mock.calls[0]
    expect(options).toEqual({
      offset: undefined,
      axis: undefined,
      container: undefined,
      target: undefined,
    })
  })

  it('should pass axis option', async () => {
    const Component = defineComponent({
      setup() {
        useScroll({ axis: 'x' })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.axis).toBe('x')
  })

  it('should pass offset option', async () => {
    const offset = ['start end', 'end start'] as any
    const Component = defineComponent({
      setup() {
        useScroll({ offset })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.offset).toEqual(offset)
  })

  it('should accept ref as axis option', async () => {
    const Component = defineComponent({
      setup() {
        const axis = ref<'x' | 'y'>('x')
        useScroll({ axis })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.axis).toBe('x')
  })

  it('should accept computed as axis option', async () => {
    const Component = defineComponent({
      setup() {
        const isHorizontal = ref(true)
        const axis = computed<'x' | 'y'>(() => isHorizontal.value ? 'x' : 'y')
        useScroll({ axis })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.axis).toBe('x')
  })

  it('should accept getter as axis option', async () => {
    const Component = defineComponent({
      setup() {
        useScroll({ axis: () => 'y' })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.axis).toBe('y')
  })

  it('should accept ref as offset option', async () => {
    const offset = ref(['start end', 'end start'] as any)
    const Component = defineComponent({
      setup() {
        useScroll({ offset })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.offset).toEqual(['start end', 'end start'])
  })

  it('should resolve container element ref', async () => {
    const Component = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        useScroll({ container: containerRef })
        return () => <div ref={containerRef} class="container" />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    const [, options] = mockScroll.mock.calls[0]
    expect(options.container).toBeInstanceOf(HTMLDivElement)
  })

  it('should resolve target element ref', async () => {
    const Component = defineComponent({
      setup() {
        const targetRef = ref<HTMLElement>()
        useScroll({ target: targetRef })
        return () => <div ref={targetRef} class="target" />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    const [, options] = mockScroll.mock.calls[0]
    expect(options.target).toBeInstanceOf(HTMLDivElement)
  })

  it('should pass both container and target', async () => {
    const Component = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useScroll({ container: containerRef, target: targetRef })
        return () => (
          <div ref={containerRef}>
            <div ref={targetRef} />
          </div>
        )
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.container).toBeInstanceOf(HTMLDivElement)
    expect(options.target).toBeInstanceOf(HTMLDivElement)
  })

  it('should update motion values from scroll callback', async () => {
    let values: ReturnType<typeof useScroll>

    const Component = defineComponent({
      setup() {
        values = useScroll()
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    // Simulate scroll callback
    const callback = mockScroll.mock.calls[0][0]
    callback(0.5, {
      x: { current: 100, progress: 0.25 },
      y: { current: 200, progress: 0.5 },
    })

    expect(values!.scrollX.get()).toBe(100)
    expect(values!.scrollXProgress.get()).toBe(0.25)
    expect(values!.scrollY.get()).toBe(200)
    expect(values!.scrollYProgress.get()).toBe(0.5)
  })

  it('should cleanup scroll listener on unmount', async () => {
    const Component = defineComponent({
      setup() {
        useScroll()
        return () => <div />
      },
    })

    const wrapper = mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    expect(mockCleanup).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalledTimes(1)
  })

  it('should re-subscribe when reactive axis changes', async () => {
    const axis = ref<'x' | 'y'>('x')

    const Component = defineComponent({
      setup() {
        useScroll({ axis })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    expect(mockScroll.mock.calls[0][1].axis).toBe('x')

    // Change axis
    axis.value = 'y'
    await delay(10)

    expect(mockCleanup).toHaveBeenCalled()
    expect(mockScroll).toHaveBeenCalledTimes(2)
    expect(mockScroll.mock.calls[1][1].axis).toBe('y')
  })

  it('should re-subscribe when reactive offset changes', async () => {
    const offset = ref(['start end', 'end start'] as any)

    const Component = defineComponent({
      setup() {
        useScroll({ offset })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)

    // Change offset
    offset.value = ['start start', 'end end'] as any
    await delay(10)

    expect(mockCleanup).toHaveBeenCalled()
    expect(mockScroll).toHaveBeenCalledTimes(2)
    expect(mockScroll.mock.calls[1][1].offset).toEqual(['start start', 'end end'])
  })

  it('should handle undefined container gracefully', async () => {
    const Component = defineComponent({
      setup() {
        useScroll({ container: ref(undefined) })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    const [, options] = mockScroll.mock.calls[0]
    expect(options.container).toBeUndefined()
  })

  it('should work with all options combined', async () => {
    const Component = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useScroll({
          container: containerRef,
          target: targetRef,
          axis: 'y',
          offset: ['start end', 'end start'] as any,
        })
        return () => (
          <div ref={containerRef}>
            <div ref={targetRef} />
          </div>
        )
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.axis).toBe('y')
    expect(options.offset).toEqual(['start end', 'end start'])
    expect(options.container).toBeInstanceOf(HTMLDivElement)
    expect(options.target).toBeInstanceOf(HTMLDivElement)
  })
})
