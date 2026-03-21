import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { useScroll } from '@/value/use-scroll'
import { delay } from '@/shared/test'

const mockCleanup = vi.fn<() => void>()
const mockScroll = vi.fn<(callback: (...args: any[]) => any, options?: any) => () => void>(() => mockCleanup)

vi.mock('framer-motion/dom', () => ({
  scroll: (...args: any[]) => mockScroll(...(args as [callback: (...args: any[]) => any, options?: any])),
}))

// Mock motion-dom for acceleration tests (Task 4 will extend this)
vi.mock('motion-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion-dom')>()
  return {
    ...actual,
    supportsScrollTimeline: vi.fn(() => false),
    supportsViewTimeline: vi.fn(() => false),
  }
})

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
    expect(options.axis).toBeUndefined()
    expect(options.offset).toBeUndefined()
    expect(options.container).toBeUndefined()
    expect(options.target).toBeUndefined()
  })

  it('should pass static axis option', async () => {
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

  it('should pass static offset option', async () => {
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

  it('should support whole-options getter for reactivity', async () => {
    const axis = ref<'x' | 'y'>('x')

    const Component = defineComponent({
      setup() {
        useScroll(() => ({ axis: axis.value }))
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)
    expect(mockScroll.mock.calls[0][1].axis).toBe('x')

    axis.value = 'y'
    await delay(10)

    expect(mockCleanup).toHaveBeenCalled()
    expect(mockScroll).toHaveBeenCalledTimes(2)
    expect(mockScroll.mock.calls[1][1].axis).toBe('y')
  })

  it('should support whole-options computed for reactivity', async () => {
    const isHorizontal = ref(true)
    const Component = defineComponent({
      setup() {
        useScroll(computed(() => ({ axis: isHorizontal.value ? 'x' as const : 'y' as const })))
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll.mock.calls[0][1].axis).toBe('x')

    isHorizontal.value = false
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(2)
    expect(mockScroll.mock.calls[1][1].axis).toBe('y')
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

    const [, options] = mockScroll.mock.calls[0]
    expect(options.target).toBeInstanceOf(HTMLDivElement)
  })

  it('should support container/target inside getter', async () => {
    const Component = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useScroll(() => ({ container: containerRef, target: targetRef }))
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

  it('should pass trackContentSize through to scroll', async () => {
    const Component = defineComponent({
      setup() {
        useScroll({ trackContentSize: true })
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    const [, options] = mockScroll.mock.calls[0]
    expect(options.trackContentSize).toBe(true)
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

    expect(mockCleanup).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalledTimes(1)
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

    const [, options] = mockScroll.mock.calls[0]
    expect(options.container).toBeUndefined()
  })

  it('should re-subscribe when reactive getter changes offset', async () => {
    const offset = ref(['start end', 'end start'] as any)

    const Component = defineComponent({
      setup() {
        useScroll(() => ({ offset: offset.value }))
        return () => <div />
      },
    })

    mount(Component)
    await delay(10)

    expect(mockScroll).toHaveBeenCalledTimes(1)

    offset.value = ['start start', 'end end'] as any
    await delay(10)

    expect(mockCleanup).toHaveBeenCalled()
    expect(mockScroll).toHaveBeenCalledTimes(2)
    expect(mockScroll.mock.calls[1][1].offset).toEqual(['start start', 'end end'])
  })

  describe('scroll timeline acceleration', () => {
    it('sets accelerate on progress values when ScrollTimeline is supported (no target)', async () => {
      const { supportsScrollTimeline } = await import('motion-dom')
      vi.mocked(supportsScrollTimeline).mockReturnValue(true)

      let values: ReturnType<typeof useScroll>
      const Component = defineComponent({
        setup() {
          values = useScroll()
          return () => <div />
        },
      })

      mount(Component)

      expect(values!.scrollXProgress.accelerate).toBeDefined()
      expect(values!.scrollYProgress.accelerate).toBeDefined()
      expect(values!.scrollX.accelerate).toBeUndefined()
      expect(values!.scrollY.accelerate).toBeUndefined()
    })

    it('does not set accelerate when ScrollTimeline is not supported', async () => {
      const { supportsScrollTimeline } = await import('motion-dom')
      vi.mocked(supportsScrollTimeline).mockReturnValue(false)

      let values: ReturnType<typeof useScroll>
      const Component = defineComponent({
        setup() {
          values = useScroll()
          return () => <div />
        },
      })

      mount(Component)

      expect(values!.scrollXProgress.accelerate).toBeUndefined()
      expect(values!.scrollYProgress.accelerate).toBeUndefined()
    })

    it('sets accelerate when ViewTimeline is supported and target uses recognised offset', async () => {
      const { supportsViewTimeline } = await import('motion-dom')
      vi.mocked(supportsViewTimeline).mockReturnValue(true)

      let values: ReturnType<typeof useScroll>
      const Component = defineComponent({
        setup() {
          const targetRef = ref<HTMLElement>()
          values = useScroll({ target: targetRef, offset: [[0, 1], [1, 1]] as any })
          return () => <div ref={targetRef} />
        },
      })

      mount(Component)

      expect(values!.scrollXProgress.accelerate).toBeDefined()
      expect(values!.scrollYProgress.accelerate).toBeDefined()
    })

    it('does not set accelerate when target uses unrecognised offset', async () => {
      const { supportsViewTimeline } = await import('motion-dom')
      vi.mocked(supportsViewTimeline).mockReturnValue(true)

      let values: ReturnType<typeof useScroll>
      const Component = defineComponent({
        setup() {
          const targetRef = ref<HTMLElement>()
          values = useScroll({ target: targetRef, offset: ['start center', 'end start'] as any })
          return () => <div ref={targetRef} />
        },
      })

      mount(Component)

      expect(values!.scrollXProgress.accelerate).toBeUndefined()
      expect(values!.scrollYProgress.accelerate).toBeUndefined()
    })

    it('accelerate factory calls scroll with resolved options', async () => {
      const { supportsScrollTimeline } = await import('motion-dom')
      vi.mocked(supportsScrollTimeline).mockReturnValue(true)

      let values: ReturnType<typeof useScroll>
      const Component = defineComponent({
        setup() {
          values = useScroll({ axis: 'x' })
          return () => <div />
        },
      })

      mount(Component)

      const mockAnimation = {} as any
      values!.scrollXProgress.accelerate!.factory(mockAnimation)

      expect(mockScroll).toHaveBeenCalledWith(
        mockAnimation,
        expect.objectContaining({ axis: 'x' }),
      )
    })
  })
})
