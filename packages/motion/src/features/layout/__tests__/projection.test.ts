import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { rootProjectionNode } from 'motion-dom'
import { nextTick } from 'vue'
import { Motion } from '@/components'
import { mountedStates } from '@/state/motion-state'

function getProjection(el: Element) {
  const state = mountedStates.get(el)
  if (!state)
    throw new Error('no motion state for element')
  return state.visualElement.projection as any
}

afterEach(() => {
  document.documentElement.scrollTop = 0
  rootProjectionNode.current = undefined
})

describe('projectionFeature', () => {
  // Regression: a stale root scroll cache left over from a previous page
  // must be refreshed when a layoutId node mounts.
  it('refreshes the stale root scroll cache when a layoutId node mounts', async () => {
    const first = render(Motion, {
      props: { layoutId: 'a' },
      attrs: { 'data-testid': 'first' },
    })
    await nextTick()

    const root = getProjection(first.getByTestId('first')).root
    // Simulate a stale scroll cache left over from a previous page
    root.scroll = {
      animationId: Number.NaN,
      phase: 'measure',
      isRoot: true,
      wasRoot: true,
      offset: { x: 0, y: 0 },
    }
    document.documentElement.scrollTop = 1000

    render(Motion, {
      props: { layoutId: 'b' },
      attrs: { 'data-testid': 'second' },
    })
    await nextTick()

    expect(root.scroll?.offset.y).toBe(1000)
  })

  it('passes layoutAnchor to the projection options', async () => {
    const { getByTestId } = render(Motion, {
      props: { layout: true, layoutAnchor: { x: 0.5, y: 0.5 } },
      attrs: { 'data-testid': 'anchored' },
    })
    await nextTick()

    expect(getProjection(getByTestId('anchored')).options.layoutAnchor).toEqual({ x: 0.5, y: 0.5 })
  })

  it('passes layoutAnchor false through to the projection options', async () => {
    const { getByTestId } = render(Motion, {
      props: { layout: true, layoutAnchor: false },
      attrs: { 'data-testid': 'no-anchor' },
    })
    await nextTick()

    expect(getProjection(getByTestId('no-anchor')).options.layoutAnchor).toBe(false)
  })

  it('keeps layoutAnchor undefined when the prop is absent', async () => {
    const { getByTestId } = render(Motion, {
      props: { layout: true },
      attrs: { 'data-testid': 'default-anchor' },
    })
    await nextTick()

    expect(getProjection(getByTestId('default-anchor')).options.layoutAnchor).toBeUndefined()
  })
})
