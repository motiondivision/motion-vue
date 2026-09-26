import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { animateViewLayers } from '../animate-view-layers'

/**
 * jsdom has no view transition support, so stub the Web Animations pieces
 * that `animateViewLayers` inspects: `KeyframeEffect` (used for an
 * instanceof check) and `document.getAnimations`.
 */
class FakeKeyframeEffect {
  pseudoElement: string
  target: Element
  timing: Record<string, unknown> = {}

  constructor(pseudoElement: string) {
    this.pseudoElement = pseudoElement
    this.target = document.documentElement
  }

  updateTiming(timing: Record<string, unknown>) {
    Object.assign(this.timing, timing)
  }
}

vi.mock('motion-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('motion-dom')>()

  class FakeNativeAnimation {
    static created: FakeNativeAnimation[] = []
    options: any

    constructor(options: any) {
      this.options = options
      FakeNativeAnimation.created.push(this)
    }

    cancel() {}
    stop() {}
    get finished() {
      return Promise.resolve(this)
    }
  }

  return {
    ...original,
    NativeAnimation: FakeNativeAnimation,
    NativeAnimationWrapper: class {
      animation: any

      constructor(animation: any) {
        this.animation = animation
      }

      cancel() {}
      stop() {}
      get finished() {
        return Promise.resolve(this)
      }
    },
  }
})

function fakeViewAnimation(pseudoElement: string) {
  return {
    playState: 'running',
    effect: new FakeKeyframeEffect(pseudoElement),
    cancel: vi.fn(),
  }
}

describe('animateViewLayers', () => {
  beforeEach(() => {
    vi.stubGlobal('KeyframeEffect', FakeKeyframeEffect)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function mockLayers(...pseudoElements: string[]) {
    const animations = pseudoElements.map(fakeViewAnimation)
    ;(document as any).getAnimations = () => animations
    return animations
  }

  it('retimes the browser animations with Motion transition options when no custom values are set', async () => {
    const [group, oldLayer, newLayer] = mockLayers(
      '::view-transition-group(item)',
      '::view-transition-old(item)',
      '::view-transition-new(item)',
    )

    animateViewLayers('item', 'update', { transition: { duration: 1 } }, [])

    for (const layer of [group, oldLayer, newLayer]) {
      expect(layer.cancel).not.toHaveBeenCalled()
      expect(layer.effect.timing.duration).toBe(1000)
    }
  })

  it('cancels the crossfade layers but keeps the group layer when custom values are set', () => {
    const [group, oldLayer, newLayer] = mockLayers(
      '::view-transition-group(item)',
      '::view-transition-old(item)',
      '::view-transition-new(item)',
    )

    animateViewLayers('item', 'exit', { exit: { opacity: 0 } }, [])

    expect(group.cancel).not.toHaveBeenCalled()
    expect(oldLayer.cancel).toHaveBeenCalled()
    expect(newLayer.cancel).toHaveBeenCalled()
  })

  it('resolves functional animation props with the transition types', () => {
    mockLayers('::view-transition-new(item)')
    let receivedTypes: string[] | undefined

    animateViewLayers('item', 'enter', {
      enter: (types) => {
        receivedTypes = types
        return {}
      },
    }, ['next'])

    expect(receivedTypes).toEqual(['next'])
  })

  it('ignores animations belonging to other layers or non-view-transition effects', () => {
    const [other] = mockLayers('::view-transition-old(other)')

    animateViewLayers('item', 'exit', { exit: { opacity: 0 } }, [])

    expect(other.cancel).not.toHaveBeenCalled()
  })

  it('fires onAnimationComplete when the animations finish', async () => {
    mockLayers('::view-transition-new(item)')
    const onAnimationComplete = vi.fn()

    animateViewLayers('item', 'enter', { onAnimationComplete }, [])

    await vi.waitFor(() => {
      expect(onAnimationComplete).toHaveBeenCalledWith('enter')
    })
  })
})
