import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Motion, motion } from '@/components/motion'
import { M, m } from '@/components/motion/m'
import { Reorder } from '@/components/reorder'

const Transparent = defineComponent({ setup: (_, { attrs }) => () => h('div', attrs) })
const Opaque = defineComponent({ inheritAttrs: false, setup: () => () => h('div') })
const values = [true, false, '', undefined] as const

function expectMarker(el: Element, enabled: boolean) {
  expect(el.matches('[fx]')).toBe(enabled)
  expect(el.getAttribute('fx')).toBe(enabled ? '' : null)
}

const targets = [
  ['HTML', motion.div],
  ['SVG', motion.svg],
  ['self-closing', motion.input],
  ['m', m.div],
  ['Motion', Motion],
  ['M', M],
  ['transparent', motion.create(Transparent)],
] as const

describe('fx marker', () => {
  it.each(targets)('%s normalizes boolean, bare, omitted and repeated updates', async (_, Target) => {
    for (const forwardMotionProps of [false, true]) {
      const wrapper = mount(Target, { props: { forwardMotionProps } })
      expectMarker(wrapper.element, false)
      for (const fx of [...values, true, false, true, undefined]) {
        await wrapper.setProps({ fx })
        expectMarker(wrapper.element, fx === true || fx === '')
      }
      wrapper.unmount()
    }
  })

  it.each(targets)('%s serializes the same marker in SSR', async (_, Target) => {
    for (const forwardMotionProps of [false, true]) {
      for (const fx of values) {
        const html = await renderToString(createSSRApp({ render: () => h(Target, { fx, forwardMotionProps }) }))
        const host = document.createElement('div')
        host.innerHTML = html
        expectMarker(host.firstElementChild!, fx === true || fx === '')
      }
    }
  })

  it.each(['div', Transparent])('asChild preserves child-last precedence and source props for %s', async (target) => {
    for (const forwardMotionProps of [false, true]) {
      for (const [parent, child, enabled] of [
        [true, false, false],
        [true, undefined, false],
        [false, true, true],
        [false, '', true],
      ] as const) {
        const source = h(target, { fx: child })
        const wrapper = mount(motion.div, {
          props: { asChild: true, fx: parent, forwardMotionProps },
          slots: { default: () => source },
        })
        expectMarker(wrapper.element, enabled)
        expect(source.props!.fx).toBe(child)
        wrapper.unmount()
        const html = await renderToString(createSSRApp({
          render: () => h(motion.div, { asChild: true, fx: parent, forwardMotionProps }, { default: () => source }),
        }))
        const host = document.createElement('div')
        host.innerHTML = html
        expectMarker(host.firstElementChild!, enabled)
        expect(source.props!.fx).toBe(child)
      }
    }
  })

  it('allows custom targets to opt out of forwarding', () => {
    const wrapper = mount(motion.create(Opaque), { props: { fx: true } })
    expectMarker(wrapper.element, false)
    wrapper.unmount()
  })

  it('derives Reorder Group and Item marker rendering', async () => {
    const marker = shallowRef<boolean | undefined>(true)
    const wrapper = mount(defineComponent({
      render: () => h(Reorder.Group, { values: ['one'], fx: marker.value }, {
        default: () => h(Reorder.Item, { value: 'one', fx: marker.value }, { default: () => 'one' }),
      }),
    }))
    for (const fx of [true, false, undefined, true]) {
      marker.value = fx
      await nextTick()
      expectMarker(wrapper.element, fx === true)
      expectMarker(wrapper.find('li').element, fx === true)
    }
    wrapper.unmount()
  })
})
