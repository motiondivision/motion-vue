import type { MotionState } from '@/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { useDragControls } from '@/features/gestures/drag/use-drag-controls'
import { rootProjectionNode } from 'motion-dom'
import { mountedStates } from '@/state/motion-state'
import { nextFrames, pointerDown, pointerMove, pointerUp } from '@/features/gestures/__tests__/utils'

function getState(el: Element): MotionState {
  const state = mountedStates.get(el)
  if (!state)
    throw new Error('no motion state for element')
  return state
}

function getDragControls(el: Element): any {
  return (getState(el) as any).features.get('drag').controls
}

/**
 * jsdom has no layout; per-testid rects stand in for it. The stub reads the
 * map at call time so a test can resize an element mid-scenario.
 */
const rects = new Map<string, { left: number, top: number, width: number, height: number }>()

beforeEach(() => {
  rects.clear()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const r = (this.dataset?.testid && rects.get(this.dataset.testid)) || { left: 0, top: 0, width: 0, height: 0 }
    return {
      x: r.left,
      y: r.top,
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      right: r.left + r.width,
      bottom: r.top + r.height,
      toJSON: () => ({}),
    } as DOMRect
  })
})

afterEach(() => {
  pointerUp(0, 0)
  // The exiting test's element outlives its unmount (pending exit session).
  document.body.innerHTML = ''
  document.documentElement.scrollTop = 0
  rootProjectionNode.current = undefined
  vi.restoreAllMocks()
})

describe('drag: text input guard', () => {
  it('does not start a drag from a text input child', async () => {
    const wrapper = render(Motion, {
      props: { drag: true, dragMomentum: false },
      attrs: { 'data-testid': 'box' },
      slots: { default: '<input data-testid="field" />' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')
    const field = wrapper.getByTestId('field')

    pointerDown(field, 0, 0)
    pointerMove(100, 0)
    await nextFrames(2)

    expect(box.style.transform).toBe('')
  })
})

describe('drag: shared drag lock with motion-dom', () => {
  it('suppresses hover on other elements while dragging', async () => {
    const onHoverStart = vi.fn()
    const wrapper = render(defineComponent({
      setup: () => () => h('div', null, [
        h(Motion, { 'drag': true, 'dragMomentum': false, 'data-testid': 'dragger' }),
        h(Motion, { 'whileHover': { scale: 1.1 }, 'onHoverStart': onHoverStart, 'data-testid': 'hoverable' }),
      ]),
    }))
    await nextTick()
    const dragger = wrapper.getByTestId('dragger')
    const hoverable = wrapper.getByTestId('hoverable')

    pointerDown(dragger, 0, 0)
    pointerMove(100, 0)
    await nextFrames(2)
    expect(dragger.style.transform).toContain('100px')

    hoverable.dispatchEvent(new PointerEvent('pointerenter'))
    await nextFrames(2)
    expect(onHoverStart).not.toHaveBeenCalled()
  })
})

describe('drag: exiting element', () => {
  it('does not start a drag while the element is exiting', async () => {
    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(AnimatePresence, null, () => show.value
        ? h(Motion, {
          'key': 'box',
          'drag': true,
          'dragMomentum': false,
          'exit': { opacity: 0 },
          'transition': { duration: 10 },
          'data-testid': 'box',
        })
        : null),
    }), { attachTo: document.body, global: { stubs: { Transition: false, TransitionGroup: false } } })
    await nextTick()
    const box = document.querySelector('[data-testid="box"]') as HTMLElement

    // jsdom resolves animations instantly, so the exit promise would settle
    // in the same tick; hold it open the way a real 10s exit would.
    const state = getState(box) as any
    vi.spyOn(state.visualElement.animationState, 'setActive')
      .mockReturnValue(new Promise(() => {}))

    show.value = false
    await nextTick()
    await nextFrames(2)

    // AnimatePresence keeps the state mounted during exit; prove we're
    // mid-exit, then try to drag.
    expect(state.isExiting).toBe(true)
    pointerDown(box, 0, 0)
    pointerMove(100, 0)
    await nextFrames(2)

    expect(box.style.transform).toBe('')
    wrapper.unmount()
  })
})

describe('drag: dragControls prop swap', () => {
  it('resubscribes when the dragControls prop changes', async () => {
    const controlsA = useDragControls()
    const controlsB = useDragControls()
    const wrapper = render(Motion, {
      props: { drag: true, dragListener: false, dragControls: controlsA, dragMomentum: false },
      attrs: { 'data-testid': 'box' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')

    await wrapper.rerender({ drag: true, dragListener: false, dragControls: controlsB, dragMomentum: false })
    await nextTick()

    const down = new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0 })
    controlsB.start(down)
    pointerMove(100, 0)
    await nextFrames(2)

    expect(box.style.transform).toContain('100px')
  })
})

describe('drag: DragControls public API', () => {
  function renderControlled(props: Record<string, any> = {}) {
    const controls = useDragControls()
    const wrapper = render(Motion, {
      props: {
        drag: true,
        dragListener: false,
        dragControls: controls,
        dragMomentum: false,
        ...props,
      },
      attrs: { 'data-testid': 'box' },
    })
    return { controls, wrapper }
  }

  function startDrag(controls: ReturnType<typeof useDragControls>, options?: Record<string, any>) {
    controls.start(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0 }), options)
  }

  it('cancel() ends the drag without momentum or onDragEnd', async () => {
    const onDragEnd = vi.fn()
    const { controls, wrapper } = renderControlled({ onDragEnd })
    await nextTick()
    const box = wrapper.getByTestId('box')

    startDrag(controls)
    pointerMove(50, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('50px')

    controls.cancel()
    pointerMove(100, 0)
    await nextFrames(2)

    expect(box.style.transform).toContain('50px')
    expect(onDragEnd).not.toHaveBeenCalled()
  })

  it('stop() ends the drag and fires onDragEnd without pointer arguments', async () => {
    const onDragEnd = vi.fn()
    const { controls, wrapper } = renderControlled({ onDragEnd })
    await nextTick()
    const box = wrapper.getByTestId('box')

    startDrag(controls)
    pointerMove(50, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('50px')

    controls.stop()
    await nextFrames(2)
    pointerMove(100, 0)
    await nextFrames(2)

    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(box.style.transform).toContain('50px')
  })

  it('respects distanceThreshold before starting the drag', async () => {
    const { controls, wrapper } = renderControlled()
    await nextTick()
    const box = wrapper.getByTestId('box')

    startDrag(controls, { distanceThreshold: 50 })
    pointerMove(10, 0)
    await nextFrames(2)
    expect(box.style.transform).toBe('')

    pointerMove(60, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('60px')
  })

  it('dragSnapToOrigin="x" snaps only x back and leaves y', async () => {
    const { controls, wrapper } = renderControlled({ dragSnapToOrigin: 'x' })
    await nextTick()
    const box = wrapper.getByTestId('box')

    startDrag(controls)
    pointerMove(100, 80)
    await nextFrames(2)
    expect(box.style.transform).toContain('100px')

    pointerUp(100, 80)
    await nextFrames(10)

    expect(box.style.transform).not.toContain('100px')
    expect(box.style.transform).toContain('80px')
  })
})

describe('drag: element constraints resolution', () => {
  it('does not double-rebase ref constraints (#2829 class)', async () => {
    rects.set('container', { left: 0, top: 0, width: 200, height: 200 })
    rects.set('box', { left: 10, top: 10, width: 50, height: 50 })

    const wrapper = render(defineComponent({
      setup: () => {
        const container = ref<HTMLElement>()
        return () => h('div', { 'ref': container, 'data-testid': 'container' }, [
          h(Motion, {
            'drag': true,
            'dragConstraints': container.value,
            'dragElastic': 0,
            'dragMomentum': false,
            'data-testid': 'box',
          }),
        ])
      },
    }))
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 60, 60)
    pointerMove(-500, 0)
    await nextFrames(2)

    // Container spans page x 0..200, the 50px box rests at x 10: travel is
    // [-10, 140]. A second rebase shifts both by -layout.min (-10 again).
    expect(box.style.transform).toContain('-10px')
  })

  it('re-reads root scroll before measuring ref constraints', async () => {
    rects.set('container', { left: 0, top: 0, width: 200, height: 200 })
    rects.set('box', { left: 10, top: 10, width: 50, height: 50 })

    const wrapper = render(defineComponent({
      setup: () => {
        const container = ref<HTMLElement>()
        return () => h('div', { 'ref': container, 'data-testid': 'container' }, [
          h(Motion, {
            'drag': true,
            'dragConstraints': container.value,
            'dragElastic': 0,
            'dragMomentum': false,
            'data-testid': 'box',
          }),
        ])
      },
    }))
    await nextTick()
    const box = wrapper.getByTestId('box')

    // Document scrolls after mount; the root scroll cache from mount is stale.
    document.documentElement.scrollTop = 100

    pointerDown(box, 60, 60)
    pointerMove(0, -500)
    await nextFrames(2)

    const { constraints } = getDragControls(box)
    // With the scroll re-read, the container's page box is y 100..300, so
    // vertical travel is [90, 240]; the stale cache reports [-10, 140].
    expect(constraints.y).toEqual({ min: 90, max: 240 })
  })

  it('repositions the dragged element when constraints shrink on resize', async () => {
    rects.set('container', { left: 0, top: 0, width: 200, height: 200 })
    rects.set('box', { left: 10, top: 10, width: 50, height: 50 })

    const wrapper = render(defineComponent({
      setup: () => {
        const container = ref<HTMLElement>()
        return () => h('div', { 'ref': container, 'data-testid': 'container' }, [
          h(Motion, {
            'drag': true,
            'dragConstraints': container.value,
            'dragElastic': 0,
            'dragMomentum': false,
            'data-testid': 'box',
          }),
        ])
      },
    }))
    await nextTick()
    const box = wrapper.getByTestId('box')

    // Drag to the right edge of the 200px container: travel [-10, 140].
    pointerDown(box, 60, 60)
    pointerMove(500, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('140px')
    pointerUp(500, 0)
    await nextFrames(2)

    // Container shrinks to 100px: travel becomes [-10, 40], progress 1 → 40px.
    rects.set('container', { left: 0, top: 0, width: 100, height: 200 })
    window.dispatchEvent(new Event('resize'))
    await nextFrames(3)

    expect(box.style.transform).toContain('40px')
  })

  it('leaves an untouched element at its origin when constraints resize', async () => {
    rects.set('container', { left: 0, top: 0, width: 200, height: 200 })
    rects.set('box', { left: 10, top: 10, width: 50, height: 50 })

    const wrapper = render(defineComponent({
      setup: () => {
        const container = ref<HTMLElement>()
        return () => h('div', { 'ref': container, 'data-testid': 'container' }, [
          h(Motion, {
            'drag': true,
            'dragConstraints': container.value,
            'dragElastic': 0,
            'dragMomentum': false,
            'data-testid': 'box',
          }),
        ])
      },
    }))
    await nextTick()
    const box = wrapper.getByTestId('box')

    // No drag: the element sits at x=0. Re-projecting progress 0.0667 of the
    // shrunk constraints [-10, 40] would shift it to -6.67px.
    rects.set('container', { left: 0, top: 0, width: 100, height: 200 })
    window.dispatchEvent(new Event('resize'))
    await nextFrames(3)

    expect(box.style.transform).not.toContain('translateX(-')
  })
})
