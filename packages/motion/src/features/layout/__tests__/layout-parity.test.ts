import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { globalProjectionState, rootProjectionNode } from 'motion-dom'
import { Motion } from '@/components'
import { layoutGroupInjectionKey } from '@/components/context'
import { mountedStates } from '@/state/motion-state'

const wrappers: Array<ReturnType<typeof mount>> = []

function render(component: any, options: any = {}) {
  const wrapper = mount(component, options)
  wrappers.push(wrapper)
  return wrapper
}

function getProjection(element: Element) {
  return mountedStates.get(element)!.visualElement.projection as any
}

afterEach(() => {
  while (wrappers.length)
    wrappers.pop()!.unmount()
  rootProjectionNode.current = undefined
  globalProjectionState.hasEverUpdated = false
  vi.restoreAllMocks()
})

describe('layout parity', () => {
  it('skips initial only when a layoutId takeover has an initial and an existing lead', () => {
    render(Motion, {
      props: { layoutId: 'shared', initial: false, animate: { opacity: 1 } },
    })

    const takeover = render(Motion, {
      props: {
        layoutId: 'shared',
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 10 },
      },
    })
    expect((takeover.element as HTMLElement).style.opacity).toBe('1')

    const entering = render(Motion, {
      props: {
        layoutId: 'entering',
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 10 },
      },
    })
    expect((entering.element as HTMLElement).style.opacity).toBe('0')
  })

  it('restores default values after a takeover without initial', async () => {
    const step = ref(0)
    const wrapper = render(defineComponent({
      components: { Motion },
      setup: () => ({ step }),
      template: `
        <Motion
          :key="step === 0 ? 'a' : 'b'"
          layout-id="box"
          :animate="step === 1 ? { scale: 2 } : {}"
          :transition="{ type: false }"
        />
      `,
    }))

    step.value = 1
    await vi.waitFor(() => {
      expect((wrapper.element as HTMLElement).style.transform).toBe('scale(2)')
    })

    step.value = 2
    await nextTick()
    await nextTick()
    await vi.waitFor(() => {
      expect((wrapper.element as HTMLElement).style.transform).toBe('none')
    })
  })

  it('snapshots the current layoutId lead when a new projection is initialized', () => {
    const first = render(Motion, { props: { layoutId: 'shared' } })
    const lead = getProjection(first.element)
    const willUpdate = vi.spyOn(lead, 'willUpdate')
    const scheduleCheckAfterUnmount = vi.spyOn(lead, 'scheduleCheckAfterUnmount')

    render(Motion, { props: { layoutId: 'shared' } })

    expect(willUpdate).toHaveBeenCalledTimes(1)
    expect(scheduleCheckAfterUnmount).toHaveBeenCalledTimes(1)
  })

  it('syncs LayoutGroup membership and lazy layout listening when layout options change', async () => {
    const add = vi.fn()
    const remove = vi.fn()
    const group = { add, remove }
    globalProjectionState.hasEverUpdated = false
    const wrapper = render(Motion, {
      props: { layout: false },
      global: {
        provide: {
          [layoutGroupInjectionKey]: { group },
        },
      },
    })
    const projection = getProjection(wrapper.element)

    expect(add).not.toHaveBeenCalled()
    expect(projection.hasLayoutListener).toBeFalsy()
    expect(globalProjectionState.hasEverUpdated).toBe(false)

    const rootDidUpdate = vi.spyOn(projection.root, 'didUpdate').mockImplementation(() => {
      expect(globalProjectionState.hasEverUpdated).toBe(true)
      expect(add).toHaveBeenCalledTimes(1)
    })

    await wrapper.setProps({ layout: true })
    expect(rootDidUpdate).toHaveBeenCalled()
    expect(globalProjectionState.hasEverUpdated).toBe(true)
    expect(add).toHaveBeenCalledTimes(1)
    expect(add).toHaveBeenLastCalledWith(projection)
    expect(projection.options.layout).toBe(true)
    expect(projection.hasLayoutListener).toBe(true)
    rootDidUpdate.mockRestore()

    await wrapper.setProps({ animate: { opacity: 1 } })
    expect(add).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ layout: false })
    expect(remove).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenLastCalledWith(projection)

    await wrapper.setProps({ layoutId: 'shared' })
    expect(add).toHaveBeenCalledTimes(2)

    await wrapper.setProps({ layoutId: undefined })
    expect(remove).toHaveBeenCalledTimes(2)

    wrappers.pop()!.unmount()
    expect(remove).toHaveBeenCalledTimes(2)
  })
})
