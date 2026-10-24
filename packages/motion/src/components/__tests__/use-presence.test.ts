/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, useIsPresent, usePresence, usePresenceData } from '@/components'

const stubs = { Transition: false, TransitionGroup: false }

function mountPresence(
  Child: ReturnType<typeof defineComponent>,
  props: Record<string, any> = {},
) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    setup: () => () => h(AnimatePresence, props, () => (show.value ? h(Child, { key: 'a' }) : null)),
  }), { attachTo: document.body, global: { stubs } })
  return { show, wrapper }
}

describe('usePresence', () => {
  it('keeps the component mounted until safeToRemove is called', async () => {
    let safeToRemoveRef: (() => void) | null = null
    const unmounted = vi.fn()

    const Child = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            safeToRemoveRef = safeToRemove
        }, { immediate: true })
        onUnmounted(unmounted)
        return () => h('div', { class: 'exiting' })
      },
    })

    const { show, wrapper } = mountPresence(Child)
    await nextTick()

    show.value = false
    await nextTick()
    expect(unmounted).not.toHaveBeenCalled()
    expect(document.querySelector('.exiting')).not.toBeNull()
    expect(safeToRemoveRef).toBeTruthy()

    safeToRemoveRef!()
    await nextTick()
    expect(document.querySelector('.exiting')).toBeNull()
    expect(unmounted).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('waits for multiple usePresence subscribers before removing', async () => {
    let removeA: (() => void) | undefined
    let removeB: (() => void) | undefined

    const ChildA = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            removeA = safeToRemove
        }, { immediate: true })
        return () => h('div', { class: 'a' })
      },
    })
    const ChildB = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            removeB = safeToRemove
        }, { immediate: true })
        return () => h('div', { class: 'b' })
      },
    })

    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(AnimatePresence, null, () => (
        show.value
          ? h('div', { key: 'wrap', class: 'wrap' }, [h(ChildA), h(ChildB)])
          : null
      )),
    }), { attachTo: document.body, global: { stubs } })
    await nextTick()

    show.value = false
    await nextTick()
    expect(document.querySelector('.wrap')).not.toBeNull()

    removeA!()
    await nextTick()
    expect(document.querySelector('.wrap')).not.toBeNull()

    removeB!()
    await nextTick()
    expect(document.querySelector('.wrap')).toBeNull()
    wrapper.unmount()
  })

  it('calling safeToRemove multiple times only completes exit once', async () => {
    let safeToRemoveRef: (() => void) | undefined
    const onExitComplete = vi.fn()

    const Child = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            safeToRemoveRef = safeToRemove
        }, { immediate: true })
        return () => h('div')
      },
    })

    const { show, wrapper } = mountPresence(Child, { onExitComplete })
    await nextTick()

    show.value = false
    await nextTick()

    safeToRemoveRef!()
    safeToRemoveRef!()
    safeToRemoveRef!()
    await nextTick()

    expect(onExitComplete).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('can exit again after re-entering', async () => {
    let safeToRemoveRef: (() => void) | undefined
    const onExitComplete = vi.fn()

    const Child = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            safeToRemoveRef = safeToRemove
        }, { immediate: true })
        return () => h('div', { class: 'child' })
      },
    })

    const { show, wrapper } = mountPresence(Child, { onExitComplete })
    await nextTick()

    show.value = false
    await nextTick()
    safeToRemoveRef!()
    await nextTick()
    expect(onExitComplete).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.child')).toBeNull()

    show.value = true
    await nextTick()
    expect(document.querySelector('.child')).not.toBeNull()

    show.value = false
    await nextTick()
    safeToRemoveRef!()
    await nextTick()
    expect(onExitComplete).toHaveBeenCalledTimes(2)
    expect(document.querySelector('.child')).toBeNull()
    wrapper.unmount()
  })

  it('returns always-present outside AnimatePresence', async () => {
    const Child = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        return () => h('div', {
          'class': 'out',
          'data-present': String(isPresent.value),
          'data-remove': safeToRemove === null ? 'null' : 'fn',
        })
      },
    })

    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => (show.value ? h(Child) : null),
    }), { attachTo: document.body, global: { stubs } })
    await nextTick()

    const el = document.querySelector('.out') as HTMLElement
    expect(el.dataset.present).toBe('true')
    expect(el.dataset.remove).toBe('null')

    show.value = false
    await nextTick()
    expect(document.querySelector('.out')).toBeNull()
    wrapper.unmount()
  })

  it('subscribe:false does not block removal', async () => {
    const Child = defineComponent({
      setup() {
        usePresence(false)
        return () => h('div', { class: 'nosub' })
      },
    })

    const { show, wrapper } = mountPresence(Child)
    await nextTick()

    show.value = false
    await nextTick()
    expect(document.querySelector('.nosub')).toBeNull()
    wrapper.unmount()
  })

  it('isPresent flips true when the element comes back mid-exit', async () => {
    const presentLog: boolean[] = []

    const Child = defineComponent({
      setup() {
        const [isPresent, safeToRemove] = usePresence()
        watch(isPresent, (present) => {
          presentLog.push(present)
          // Never call safeToRemove — we re-enter mid-exit.
          void safeToRemove
        }, { immediate: true })
        return () => h('div', { class: 'mid' })
      },
    })

    const { show, wrapper } = mountPresence(Child)
    await nextTick()
    expect(presentLog.at(-1)).toBe(true)

    show.value = false
    await nextTick()
    expect(presentLog.at(-1)).toBe(false)
    expect(document.querySelector('.mid')).not.toBeNull()

    show.value = true
    await nextTick()
    expect(presentLog.at(-1)).toBe(true)
    expect(document.querySelector('.mid')).not.toBeNull()
    wrapper.unmount()
  })
})

describe('useIsPresent', () => {
  it('tracks presence and is true outside AnimatePresence', async () => {
    const values: boolean[] = []

    const Outside = defineComponent({
      setup() {
        const isPresent = useIsPresent()
        watch(isPresent, v => values.push(v), { immediate: true })
        return () => h('div')
      },
    })

    const outside = mount(Outside, { attachTo: document.body, global: { stubs } })
    await nextTick()
    expect(values.at(-1)).toBe(true)
    outside.unmount()

    values.length = 0
    let safeToRemoveRef: (() => void) | undefined
    // Pair with usePresence so the child stays mounted long enough to observe
    // isPresent flipping false (useIsPresent alone does not subscribe).
    const Child = defineComponent({
      setup() {
        const isPresent = useIsPresent()
        const [, safeToRemove] = usePresence()
        watch(isPresent, v => values.push(v), { immediate: true })
        watch(isPresent, (present) => {
          if (!present && safeToRemove)
            safeToRemoveRef = safeToRemove
        }, { immediate: true })
        return () => h('div')
      },
    })

    const { show, wrapper } = mountPresence(Child)
    await nextTick()
    expect(values.at(-1)).toBe(true)

    show.value = false
    await nextTick()
    expect(values.at(-1)).toBe(false)
    safeToRemoveRef!()
    await nextTick()
    wrapper.unmount()
  })
})

describe('usePresenceData', () => {
  it('returns custom data passed to AnimatePresence', async () => {
    const Child = defineComponent({
      setup() {
        const data = usePresenceData()
        const [isPresent] = usePresence()
        return () => h('div', {
          id: 'test-div',
          style: { opacity: String(isPresent.value ? data.value / 2 : data.value) },
        })
      },
    })

    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(AnimatePresence, { custom: 0.5 }, () => (
        show.value ? h(Child, { key: 'a' }) : null
      )),
    }), { attachTo: document.body, global: { stubs } })
    await nextTick()

    expect((document.querySelector('#test-div') as HTMLElement).style.opacity).toBe('0.25')

    show.value = false
    await nextTick()
    expect((document.querySelector('#test-div') as HTMLElement).style.opacity).toBe('0.5')
    wrapper.unmount()
  })

  it('returns undefined when not within AnimatePresence', async () => {
    const Child = defineComponent({
      setup() {
        const data = usePresenceData()
        return () => h('div', {
          'id': 'test-div',
          'data-value': data.value === undefined ? '1' : '2',
        })
      },
    })

    const wrapper = mount(Child, { attachTo: document.body, global: { stubs } })
    await nextTick()
    expect(document.querySelector('#test-div')?.getAttribute('data-value')).toBe('1')
    wrapper.unmount()
  })
})
