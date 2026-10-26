import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { Motion } from '@/components'
import { nextTick } from 'vue'
import { nextFrame, nextFrames, pointerDown, pointerMove, pointerUp, pointerUpOn } from '@/features/gestures/__tests__/utils'

afterEach(() => {
  // End any session a failing assertion left stranded so it can't hold the
  // global drag lock into the next test.
  pointerUp(0, 0)
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
})

describe('pan session reliability (upstream sync)', () => {
  it('ends the gesture when a descendant stopPropagations pointerup (#2794)', async () => {
    const wrapper = render(Motion, {
      props: { drag: true, dragMomentum: false },
      attrs: { 'data-testid': 'box' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(100, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('100px')

    // A descendant handler swallowing pointerup must not strand the session.
    box.addEventListener('pointerup', e => e.stopPropagation())
    pointerUpOn(box, 100, 0)

    pointerMove(150, 0)
    await nextFrames(2)
    expect(box.style.transform).toContain('100px')
  })

  it('flushes a pending pointermove before pointerup', async () => {
    const points: number[] = []
    const wrapper = render(Motion, {
      props: {
        drag: true,
        dragMomentum: false,
        onDrag: (_e: PointerEvent, info: { point: { x: number } }) => points.push(info.point.x),
      },
      attrs: { 'data-testid': 'box' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(50, 0)
    await nextFrames(2)
    expect(points.at(-1)).toBe(50)

    // Browsers flush coalesced moves right before pointerup; no frame runs
    // between the last move and the up.
    pointerMove(100, 0)
    pointerUp(100, 0)
    await nextFrames(2)

    expect(points.at(-1)).toBe(100)
  })

  it('settles window scroll before storing the next pointer point', async () => {
    const points: number[] = []
    const wrapper = render(Motion, {
      props: {
        drag: true,
        dragMomentum: false,
        onDrag: (_e: PointerEvent, info: { point: { y: number } }) => points.push(info.point.y),
      },
      attrs: { 'data-testid': 'box' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')

    pointerDown(box, 0, 0)
    pointerMove(0, 10)
    await nextFrames(2)

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 })
    pointerMove(0, 120)
    await nextFrames(2)
    expect(points.at(-1)).toBe(120)

    window.dispatchEvent(new Event('scroll'))
    await nextFrames(2)

    expect(points.at(-1)).toBe(120)
  })

  it('measures flick velocity from the flick, not the pointer-down point', async () => {
    let endVelocityX = 0
    const wrapper = render(Motion, {
      props: {
        drag: true,
        dragMomentum: false,
        onDragEnd: (_e: PointerEvent, info: { velocity: { x: number } }) => {
          endVelocityX = info.velocity.x
        },
      },
      attrs: { 'data-testid': 'box' },
    })
    await nextTick()
    const box = wrapper.getByTestId('box')

    // Press, hold still well past the 100ms velocity window, then flick.
    pointerDown(box, 0, 0)
    await new Promise(resolve => setTimeout(resolve, 300))
    pointerMove(50, 0)
    await nextFrame()
    pointerMove(100, 0)
    await nextFrame()
    pointerUp(100, 0)
    await nextFrames(2)

    // Flick of 50px in one frame (~16ms) ≈ 3000 px/s; diluted by the hold
    // it would read ≈ 100px / 300ms ≈ 300 px/s.
    expect(endVelocityX).toBeGreaterThan(1500)
  })
})
