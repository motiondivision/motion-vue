import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScroll } from '../use-scroll'

describe('useScroll', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports each axis length as the distance left to scroll', async () => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientHeight', { value: 100 })
    Object.defineProperty(container, 'scrollHeight', { value: 400 })
    Object.defineProperty(container, 'clientWidth', { value: 50 })
    Object.defineProperty(container, 'scrollWidth', { value: 250 })
    container.scrollTop = 40
    container.scrollLeft = 10
    document.body.appendChild(container)

    const lengths = ref({ x: -1, y: -1 })
    const wrapper = mount(defineComponent({
      setup() {
        const values = useScroll({ container })
        lengths.value = {
          x: values.scrollXLength.get(),
          y: values.scrollYLength.get(),
        }
        values.scrollXLength.on('change', (value) => {
          lengths.value = { ...lengths.value, x: value }
        })
        values.scrollYLength.on('change', (value) => {
          lengths.value = { ...lengths.value, y: value }
        })
        return () => h('div')
      },
    }))

    await nextTick()
    await vi.waitFor(() => {
      expect(lengths.value).toEqual({ x: 200, y: 300 })
    })

    wrapper.unmount()
    container.remove()
  })
})
