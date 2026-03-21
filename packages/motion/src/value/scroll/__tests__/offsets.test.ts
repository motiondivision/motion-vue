import { describe, it, expect } from 'vitest'
import { ScrollOffset, offsetToViewTimelineRange } from '../offsets'

describe('ScrollOffset', () => {
  it('Enter preset has correct values', () => {
    expect(ScrollOffset.Enter).toEqual([[0, 1], [1, 1]])
  })

  it('Exit preset has correct values', () => {
    expect(ScrollOffset.Exit).toEqual([[0, 0], [1, 0]])
  })

  it('Any preset has correct values', () => {
    expect(ScrollOffset.Any).toEqual([[1, 0], [0, 1]])
  })

  it('All preset has correct values', () => {
    expect(ScrollOffset.All).toEqual([[0, 0], [1, 1]])
  })
})

describe('offsetToViewTimelineRange', () => {
  it('returns contain range when no offset provided', () => {
    expect(offsetToViewTimelineRange(undefined)).toEqual({
      rangeStart: 'contain 0%',
      rangeEnd: 'contain 100%',
    })
  })

  it('maps Enter preset to entry range', () => {
    expect(offsetToViewTimelineRange(ScrollOffset.Enter as any)).toEqual({
      rangeStart: 'entry 0%',
      rangeEnd: 'entry 100%',
    })
  })

  it('maps Exit preset to exit range', () => {
    expect(offsetToViewTimelineRange(ScrollOffset.Exit as any)).toEqual({
      rangeStart: 'exit 0%',
      rangeEnd: 'exit 100%',
    })
  })

  it('maps Any preset to cover range', () => {
    expect(offsetToViewTimelineRange(ScrollOffset.Any as any)).toEqual({
      rangeStart: 'cover 0%',
      rangeEnd: 'cover 100%',
    })
  })

  it('maps All preset to contain range', () => {
    expect(offsetToViewTimelineRange(ScrollOffset.All as any)).toEqual({
      rangeStart: 'contain 0%',
      rangeEnd: 'contain 100%',
    })
  })

  it('maps string form of Enter preset to entry range', () => {
    expect(offsetToViewTimelineRange(['start end', 'end end'])).toEqual({
      rangeStart: 'entry 0%',
      rangeEnd: 'entry 100%',
    })
  })

  it('returns undefined for unrecognised offset', () => {
    expect(offsetToViewTimelineRange(['start center', 'end start'])).toBeUndefined()
  })

  it('returns undefined for offset with wrong length', () => {
    expect(offsetToViewTimelineRange(['start end'] as any)).toBeUndefined()
  })
})
