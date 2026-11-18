// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { Suspense, createSSRApp, defineComponent, h, nextTick, onMounted } from 'vue'
import type { VNode } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LazyMotion } from '@/components/lazy-motion'
import { m } from '@/components/motion/m'
import { domAnimation } from '@/features/dom-animation'
import type { FeatureBundle } from '@/features/dom-animation'

function gate<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('lazyMotion hydration', () => {
  it('loads features for an existing m consumer while an independent Suspense sibling is pending', async () => {
    const serverGate = gate<void>()
    const clientGate = gate<void>()
    const features = gate<FeatureBundle>()
    let client = false
    let consumers = 0
    let mounts = 0
    let boundary!: VNode
    const complete = vi.fn()
    const Consumer = defineComponent({
      setup() {
        if (client)
          consumers++
        onMounted(() => { mounts++ })
        return () => h(m.div, {
          id: 'hydrated-fx',
          fx: true,
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.01 },
          onAnimationComplete: complete,
        })
      },
    })
    const Sibling = defineComponent({
      async setup() {
        await (client ? clientGate.promise : serverGate.promise)
        return () => h('span', { id: 'ready' }, 'ready')
      },
    })
    const Root = defineComponent({
      setup: () => () => h(LazyMotion, { features: () => features.promise }, {
        default: () => {
          boundary = h(Suspense, null, {
            default: () => h('section', [h(Consumer), h(Sibling)]),
            fallback: () => h('p', 'pending'),
          })
          return boundary
        },
      }),
    })
    const rendering = renderToString(createSSRApp(Root))
    serverGate.resolve()
    const host = document.createElement('div')
    host.innerHTML = await rendering
    document.body.append(host)
    const serverNode = host.querySelector('#hydrated-fx')!
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    client = true
    const app = createSSRApp(Root)
    try {
      app.mount(host)
      await nextTick()
      expect(consumers).toBe(1)
      expect(mounts).toBe(0)
      expect(host.querySelector('#ready')).not.toBeNull()
      expect(boundary.suspense!.pendingBranch).not.toBeNull()
      features.resolve(domAnimation)
      await features.promise
      await nextTick()
      expect(boundary.suspense!.pendingBranch).not.toBeNull()
      expect(mounts).toBe(0)
      expect(host.querySelector('#hydrated-fx')).toBe(serverNode)
      clientGate.resolve()
      await vi.waitFor(() => expect(mounts).toBe(1))
      expect(boundary.suspense!.pendingBranch).toBeNull()
      await vi.waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
      expect((serverNode as HTMLElement).style.opacity).toBe('1')
      expect(serverNode.getAttribute('fx')).toBe('')
      expect(host.querySelector('#hydrated-fx')).toBe(serverNode)
      expect(host.querySelectorAll('#hydrated-fx')).toHaveLength(1)
      expect(consumers).toBe(1)
      expect(warn.mock.calls.filter(args => /hydration/i.test(args.join(' ')))).toEqual([])
      expect(error.mock.calls.filter(args => /hydration/i.test(args.join(' ')))).toEqual([])
    }
    finally {
      clientGate.resolve()
      app.unmount()
      host.remove()
      warn.mockRestore()
      error.mockRestore()
    }
  })
})
