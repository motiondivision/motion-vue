/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onUnmounted, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { mountedStates } from '@/state/motion-state'
import { delay } from '@/shared/test'

function mountPresence(
  children: (show: any) => any,
  props: Record<string, any> = {},
) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    setup: () => () => h(AnimatePresence, props, () => children(show)),
  }), {
    attachTo: document.body,
    // PresenceChild wraps its child in Vue's Transition; the test utils stub
    // it by default, which would hide the transition hooks under test.
    global: { stubs: { Transition: false } },
  })
  return { show, wrapper }
}

describe('animate-presence integration', () => {
  it('keeps the exiting component instance alive until its exit animation completes', async () => {
    const unmounted = vi.fn()
    const Child = defineComponent({
      setup() {
        onUnmounted(unmounted)
        return () => h(Motion, {
          exit: { opacity: 0 },
          transition: { duration: 0.05 },
        })
      },
    })
    const { show, wrapper } = mountPresence(show => (show.value ? h(Child, { key: 'c' }) : null))
    await nextTick()

    show.value = false
    await nextTick()
    // The headline contract: v-if flipping must not unmount the child —
    // it unmounts when the exit animation commits.
    expect(unmounted).not.toHaveBeenCalled()

    await delay(150)
    await nextTick()
    expect(unmounted).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('wait mode holds the incoming child until the exit completes', async () => {
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? h(Motion, { key: 'a', exit: { opacity: 0 }, transition: { duration: 0.05 } }, () => 'out')
        : h(Motion, { key: 'b' }, () => 'in')),
      { mode: 'wait' },
    )
    await nextTick()

    show.value = false
    await nextTick()
    expect(document.body.textContent).toContain('out')
    expect(document.body.textContent).not.toContain('in')

    await delay(150)
    await nextTick()
    expect(document.body.textContent).not.toContain('out')
    expect(document.body.textContent).toContain('in')
    wrapper.unmount()
  })

  it('runs two sibling exits concurrently and fires onExitComplete once both settle', async () => {
    const onExitComplete = vi.fn()
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? [
            h(Motion, { 'key': 'a', 'exit': { opacity: 0 }, 'data-testid': 'a' }),
            h(Motion, { 'key': 'b', 'exit': { opacity: 0 }, 'data-testid': 'b' }),
          ]
        : null),
      { onExitComplete },
    )
    await nextTick()

    // Hold each exit open by hand — jsdom would settle animations instantly.
    const resolvers: Array<() => void> = []
    for (const id of ['a', 'b']) {
      const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement
      const state = mountedStates.get(el)! as any
      vi.spyOn(state.visualElement.animationState, 'setActive')
        .mockReturnValue(new Promise<void>(resolve => resolvers.push(resolve)))
    }

    show.value = false
    await nextTick()
    await delay(20)
    resolvers[0]()
    await delay(20)
    expect(onExitComplete).not.toHaveBeenCalled()

    resolvers[1]()
    await delay(20)
    await nextTick()
    expect(onExitComplete).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('re-entering a key mid-exit keeps the same element mounted', async () => {
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? h(Motion, { 'key': 'a', 'exit': { opacity: 0 }, 'transition': { duration: 0.2 }, 'data-testid': 'box' })
        : null),
    )
    await nextTick()
    const el = document.querySelector('[data-testid="box"]') as HTMLElement

    show.value = false
    await nextTick()
    show.value = true
    await nextTick()
    await delay(300)
    await nextTick()

    const elAfter = document.querySelector('[data-testid="box"]') as HTMLElement
    expect(elAfter).toBe(el)
    wrapper.unmount()
  })

  it('popLayout injects an absolute-position style for the exiting element and cleans it up', async () => {
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? h(Motion, { 'key': 'a', 'exit': { opacity: 0 }, 'transition': { duration: 0.05 }, 'data-testid': 'box' })
        : null),
      { mode: 'popLayout' },
    )
    await nextTick()

    show.value = false
    await nextTick()
    const el = document.querySelector('[data-testid="box"]') as HTMLElement
    expect(el.dataset.motionPopId).toBeTruthy()
    expect(document.querySelector('style')?.sheet?.cssRules.length).toBeGreaterThan(0)

    await delay(150)
    await nextTick()
    expect(document.querySelector('[data-motion-pop-id]')).toBeNull()
    wrapper.unmount()
  })

  it('warns when wait mode renders multiple children', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { wrapper } = mountPresence(
      () => [
        h(Motion, { key: 'a' }),
        h(Motion, { key: 'b' }),
      ],
      { mode: 'wait' },
    )
    await nextTick()
    expect(
      spy.mock.calls.flat().some(
        message => typeof message === 'string' && message.includes('mode is set to "wait"'),
      ),
    ).toBe(true)
    spy.mockRestore()
    wrapper.unmount()
  })
})
