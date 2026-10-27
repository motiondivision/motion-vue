import { describe, expect, it } from 'vitest'
import { drag as domDrag, processFrame as domProcessFrame, scopeMotion as domScopeMotion } from 'motion-dom'
import { drag, processFrame, scopeMotion } from '@/index'

describe('motion 14.6 DOM exports', () => {
  it('exposes the new shared APIs through the public entry', () => {
    expect(drag).toBe(domDrag)
    expect(scopeMotion).toBe(domScopeMotion)
    expect(processFrame).toBe(domProcessFrame)
  })
})
