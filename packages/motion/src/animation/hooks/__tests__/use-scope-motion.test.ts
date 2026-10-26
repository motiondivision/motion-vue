import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import { scopeMotion } from 'motion-dom'
import { useScopeMotion } from '../use-scope-motion'

vi.mock('motion-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion-dom')>()
  return { ...actual, scopeMotion: vi.fn() }
})

describe('useScopeMotion', () => {
  afterEach(() => {
    vi.mocked(scopeMotion).mockReset()
  })

  it('scopes setup to the element and cancels on option changes and unmount', async () => {
    const setup = vi.fn()
    const options = ref({ transition: { duration: 1 } })
    const scopes: Array<{ cancel: ReturnType<typeof vi.fn> }> = []
    vi.mocked(scopeMotion).mockImplementation(((_root: Element, run: typeof setup) => {
      const current = { cancel: vi.fn() }
      scopes.push(current)
      run(current)
      return current
    }) as any)

    const root = ref<HTMLElement | null>(null)
    let returnedScope: ReturnType<typeof useScopeMotion>
    const wrapper = mount({
      setup() {
        returnedScope = useScopeMotion(root, setup, options)
        return () => h('div', { ref: root })
      },
    })
    await nextTick()

    expect(scopeMotion).toHaveBeenCalledTimes(1)
    expect(scopeMotion).toHaveBeenCalledWith(wrapper.element, setup, options.value)
    expect(setup).toHaveBeenCalledWith(scopes[0])
    expect(returnedScope!.value).toBe(scopes[0])

    options.value = { transition: { duration: 2 } }
    await nextTick()
    expect(scopes[0].cancel).toHaveBeenCalledOnce()
    expect(returnedScope!.value).toBe(scopes[1])

    wrapper.unmount()
    expect(scopes[1].cancel).toHaveBeenCalledOnce()
    expect(returnedScope!.value).toBeNull()
  })
})
