import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import AnimateView from '@/components/animate-view/AnimateView.vue'
import { startTransition } from '@/components/animate-view/start-transition'
import { animateViewLayers } from '@/components/animate-view/animate-view-layers'

vi.mock('@/components/animate-view/animate-view-layers', () => ({
  animateViewLayers: vi.fn(() => () => {}),
}))

const mockAnimateViewLayers = animateViewLayers as Mock

interface FakeViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

function installFakeViewTransition() {
  const transitions: FakeViewTransition[] = [];

  (document as any).startViewTransition = (callback?: () => Promise<void>) => {
    const updateCallbackDone = Promise.resolve().then(() => callback?.())
    const transition: FakeViewTransition = {
      updateCallbackDone,
      ready: updateCallbackDone.then(() => {}),
      finished: updateCallbackDone.then(() => {}),
      skipTransition: () => {},
    }
    transitions.push(transition)
    return transition
  }

  return transitions
}

async function settle(transition: FakeViewTransition | undefined) {
  if (!transition)
    return
  await transition.ready
  await transition.finished
  await nextTick()
}

describe('animateView', () => {
  const originalStartViewTransition = (document as any).startViewTransition

  beforeEach(() => {
    mockAnimateViewLayers.mockClear()
    // jsdom has no WAAPI; suppressRootLayer calls Element.animate
    if (typeof document.documentElement.animate !== 'function') {
      (document.documentElement as any).animate = vi.fn()
    }
  })

  afterEach(() => {
    (document as any).startViewTransition = originalStartViewTransition
  })

  it('runs the update without animation when the View Transitions API is unavailable', async () => {
    (document as any).startViewTransition = undefined
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    let ran = false
    const result = startTransition(() => {
      ran = true
    })

    expect(ran).toBe(true)
    expect(result).toBeUndefined()
    expect(mockAnimateViewLayers).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('animates an entering component with its uid layer name', async () => {
    installFakeViewTransition()
    const show = ref(false)

    mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, { enter: { opacity: 1 } }, () => h('div', { class: 'box' }))
          : null
      },
    }))

    const transition = startTransition(() => {
      show.value = true
    }, { types: ['toggle'] })

    await settle(transition)

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect(mockAnimateViewLayers).toHaveBeenCalledWith(
      expect.stringMatching(/^motion-view-/),
      'enter',
      expect.objectContaining({ enter: { opacity: 1 } }),
      ['toggle'],
    )
  })

  it('animates an exiting component with a snapshot of its props', async () => {
    installFakeViewTransition()
    const show = ref(true)

    mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, { exit: { opacity: 0 } }, () => h('div', { class: 'box' }))
          : null
      },
    }))

    const transition = startTransition(() => {
      show.value = false
    })

    await settle(transition)

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect(mockAnimateViewLayers).toHaveBeenCalledWith(
      expect.stringMatching(/^motion-view-/),
      'exit',
      expect.objectContaining({ exit: { opacity: 0 } }),
      [],
    )
  })

  it('animates a re-rendered component as an update and disarms it afterwards', async () => {
    installFakeViewTransition()
    const message = ref('a')

    const wrapper = mount(defineComponent({
      setup() {
        return () => h(AnimateView, { update: { opacity: 1 } }, () => h('div', { class: 'box' }, message.value))
      },
    }))

    const element = wrapper.find('.box').element as HTMLElement

    const transition = startTransition(() => {
      message.value = 'b'
    })

    await settle(transition)

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect(mockAnimateViewLayers).toHaveBeenCalledWith(
      expect.stringMatching(/^motion-view-/),
      'update',
      expect.objectContaining({ update: { opacity: 1 } }),
      [],
    )
    expect(element.style.getPropertyValue('view-transition-name')).toBe('')
  })

  it('does not detect layout-only changes without a re-render (no rect measurement)', async () => {
    installFakeViewTransition()

    const wrapper = mount(defineComponent({
      setup() {
        return () => h(AnimateView, null, () => h('div', { class: 'box' }))
      },
    }))

    const element = wrapper.find('.box').element as HTMLElement
    let rect = { x: 0, y: 0, width: 100, height: 100 }
    vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => rect as DOMRect)

    const transition = startTransition(() => {
      rect = { ...rect, x: 50 }
    })

    await settle(transition)

    // The browser still morphs the element's position with default timing,
    // but without a re-render there is no participant and no Motion timing
    expect(mockAnimateViewLayers).not.toHaveBeenCalled()
  })

  it('pairs an exit and an enter with the same name as a single share animation', async () => {
    installFakeViewTransition()
    const show = ref(true)

    mount(defineComponent({
      setup() {
        // The two boundaries live at different positions with different
        // keys so toggling unmounts one and mounts the other (same-position
        // same-key conditional rendering would be patched as an update)
        return () => h('div', [
          show.value
            ? h(AnimateView, { key: 'list-item', name: 'item', exit: { opacity: 0 } }, () => h('div', { class: 'item' }))
            : null,
          !show.value
            ? h(AnimateView, { key: 'modal', name: 'item', share: { opacity: 1 }, transition: { duration: 1 } }, () => h('div', { class: 'modal' }))
            : null,
        ])
      },
    }))

    const transition = startTransition(() => {
      show.value = false
    })

    await settle(transition)

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect(mockAnimateViewLayers).toHaveBeenCalledWith(
      'item',
      'share',
      // the entering side's props drive the shared animation
      expect.objectContaining({ share: { opacity: 1 }, transition: { duration: 1 } }),
      [],
    )
  })

  it('forwards transition types to animateViewLayers', async () => {
    installFakeViewTransition()
    const show = ref(false)

    mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, {
            enter: (types: string[]) => ({ opacity: types.includes('next') ? 1 : 0 }),
          }, () => h('div'))
          : null
      },
    }))

    const transition = startTransition(() => {
      show.value = true
    }, { types: ['next'] })

    await settle(transition)

    expect(mockAnimateViewLayers).toHaveBeenCalledWith(
      expect.stringMatching(/^motion-view-/),
      'enter',
      expect.objectContaining({ enter: expect.any(Function) }),
      ['next'],
    )
  })

  it('closes the registration window once the update has flushed', async () => {
    let resolveFinished!: () => void
    ;(document as any).startViewTransition = (callback?: () => Promise<void>) => {
      const updateCallbackDone = Promise.resolve().then(() => callback?.())
      return {
        updateCallbackDone,
        ready: updateCallbackDone.then(() => {}),
        finished: new Promise<void>((resolve) => {
          resolveFinished = resolve
        }),
        skipTransition: () => {},
      }
    }

    const show = ref(false)
    const wrapper = mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, null, () => h('div', { class: 'box' }))
          : null
      },
    }))

    const transition = startTransition(() => {
      show.value = true
    }) as unknown as FakeViewTransition
    await transition.updateCallbackDone

    // A component mounting after the flush but while the animation is still
    // playing must NOT be registered as an "enter" participant
    const lateWrapper = mount(defineComponent({
      setup() {
        return () => h(AnimateView, null, () => h('div', { class: 'late' }))
      },
    }))
    await nextTick()

    resolveFinished()
    await transition.ready
    await transition.finished
    await nextTick()

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect((lateWrapper.find('.late').element as HTMLElement).style.getPropertyValue('view-transition-name')).toBe('')

    wrapper.unmount()
    lateWrapper.unmount()
  })

  it('cancels the layer animation when a participant unmounts mid-playback', async () => {
    const cleanup = vi.fn()
    mockAnimateViewLayers.mockReturnValueOnce(cleanup)

    let resolveFinished!: () => void
    ;(document as any).startViewTransition = (callback?: () => Promise<void>) => {
      const updateCallbackDone = Promise.resolve().then(() => callback?.())
      return {
        updateCallbackDone,
        ready: updateCallbackDone.then(() => {}),
        finished: new Promise<void>((resolve) => {
          resolveFinished = resolve
        }),
        skipTransition: () => {},
      }
    }

    const message = ref('a')
    const wrapper = mount(defineComponent({
      setup() {
        return () => h(AnimateView, { update: { opacity: 1 } }, () => h('div', { class: 'box' }, message.value))
      },
    }))

    const transition = startTransition(() => {
      message.value = 'b'
    }) as unknown as FakeViewTransition
    await transition.ready

    expect(mockAnimateViewLayers).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    // Unmount while the (still unresolved) transition is playing
    wrapper.unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)

    resolveFinished()
    await transition.finished
  })

  it('suppresses the root layer by default and restores it after finished', async () => {
    let resolveFinished!: () => void
    ;(document as any).startViewTransition = (callback?: () => Promise<void>) => {
      const updateCallbackDone = Promise.resolve().then(() => callback?.())
      return {
        updateCallbackDone,
        ready: updateCallbackDone.then(() => {}),
        finished: new Promise<void>((resolve) => {
          resolveFinished = resolve
        }),
        skipTransition: () => {},
      }
    }

    const transition = startTransition(() => {}) as unknown as FakeViewTransition
    await transition.updateCallbackDone

    const root = document.documentElement
    expect(root.style.getPropertyValue('view-transition-name')).toBe('none')
    // name-only suppression: no WAAPI animations on pseudo-elements
    // (they lingered and crashed the Chrome renderer — see repo history)
    expect(root.animate).not.toHaveBeenCalled()

    resolveFinished()
    await transition.finished
    await nextTick()

    expect(root.style.getPropertyValue('view-transition-name')).toBe('')
  })

  it('keeps the root layer when the root option is set', async () => {
    installFakeViewTransition()

    const transition = startTransition(() => {}, { root: true })
    await settle(transition)

    expect(document.documentElement.style.getPropertyValue('view-transition-name')).toBe('')
  })

  it('cancels layer animations when the transition ends so they cannot revive under a reused name', async () => {
    const cleanup = vi.fn()
    mockAnimateViewLayers.mockReturnValueOnce(cleanup)
    installFakeViewTransition()

    const show = ref(false)
    mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, { enter: { opacity: 1 } }, () => h('div', { class: 'box' }))
          : null
      },
    }))

    const transition = startTransition(() => {
      show.value = true
    })
    await settle(transition)

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('queues updates during playback and flushes them as one batched transition', async () => {
    const calls: string[] = []
    const startedTransitions: Array<FakeViewTransition & { resolveFinished: () => void }> = []

    ;(document as any).startViewTransition = vi.fn((callback?: () => Promise<void>) => {
      let resolveFinished!: () => void
      const updateCallbackDone = Promise.resolve().then(() => callback?.())
      const t = {
        updateCallbackDone,
        ready: updateCallbackDone.then(() => {}),
        finished: new Promise<void>((resolve) => {
          resolveFinished = resolve
        }),
        skipTransition: () => {},
        resolveFinished,
      }
      startedTransitions.push(t)
      return t
    })

    const show = ref(true)
    mount(defineComponent({
      setup() {
        return () => show.value
          ? h(AnimateView, null, () => h('div', { class: 'box' }))
          : null
      },
    }))

    // First transition starts immediately
    const first = startTransition(() => {
      calls.push('first')
      show.value = false
    }, { types: ['a'] })
    expect(first).toBeDefined()
    expect(startedTransitions).toHaveLength(1)
    await (first as unknown as FakeViewTransition).updateCallbackDone

    // Two more calls during playback: queued, updates NOT run yet
    const second = startTransition(() => {
      calls.push('second')
      show.value = true
    }, { types: ['b'] })
    const third = startTransition(() => {
      calls.push('third')
    }, { types: ['c'] })
    expect(second).toBeUndefined()
    expect(third).toBeUndefined()
    expect(startedTransitions).toHaveLength(1)
    expect(calls).toEqual(['first'])

    // Finish the first transition → the queue flushes as ONE batched transition
    startedTransitions[0].resolveFinished()
    await startedTransitions[0].finished
    await vi.waitFor(() => {
      expect(startedTransitions).toHaveLength(2)
    })
    expect(calls).toEqual(['first', 'second', 'third'])

    // The batched transition runs its participant with the merged types
    await vi.waitFor(() => {
      expect(mockAnimateViewLayers).toHaveBeenCalledTimes(2)
    })
    expect(mockAnimateViewLayers.mock.calls[0][3]).toEqual(['a'])
    expect(mockAnimateViewLayers.mock.calls[1][3]).toEqual(['b', 'c'])
    expect(mockAnimateViewLayers.mock.calls[1][1]).toBe('enter')

    startedTransitions[1].resolveFinished()
    await startedTransitions[1].finished
  })
})
