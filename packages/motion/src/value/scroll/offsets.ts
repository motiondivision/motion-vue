import type { Edge, Intersection, ProgressIntersection } from '@/types'

type ScrollOffsetType = Array<Edge | Intersection | ProgressIntersection>

/**
 * Preset scroll offsets matching framer-motion's ScrollOffset presets.
 * Use with useScroll's offset option to define scroll-linked animation ranges.
 *
 * @example
 * useScroll({ target: el, offset: ScrollOffset.Enter })
 */
export const ScrollOffset = {
  /** Progress 0→1 as target enters the container */
  Enter: [[0, 1], [1, 1]] as const,
  /** Progress 0→1 as target exits the container */
  Exit: [[0, 0], [1, 0]] as const,
  /** Progress 0→1 across any overlap between target and container */
  Any: [[1, 0], [0, 1]] as const,
  /** Progress 0→1 while target is fully contained within the container */
  All: [[0, 0], [1, 1]] as const,
}

export type ScrollOffset = ScrollOffsetType

type NormalisedOffset = [[number, number], [number, number]]

const presets: [readonly (readonly [number, number])[], string][] = [
  [ScrollOffset.Enter, 'entry'],
  [ScrollOffset.Exit, 'exit'],
  [ScrollOffset.Any, 'cover'],
  [ScrollOffset.All, 'contain'],
]

const stringToProgress: Record<string, number> = {
  start: 0,
  end: 1,
}

function parseStringOffset(s: string): [number, number] | undefined {
  const parts = s.trim().split(/\s+/)
  if (parts.length !== 2)
    return undefined
  const a = stringToProgress[parts[0]]
  const b = stringToProgress[parts[1]]
  if (a === undefined || b === undefined)
    return undefined
  return [a, b]
}

function normaliseOffset(offset: ScrollOffsetType): NormalisedOffset | undefined {
  if (offset.length !== 2)
    return undefined
  const result: [number, number][] = []
  for (const item of offset) {
    if (Array.isArray(item)) {
      result.push(item as [number, number])
    }
    else if (typeof item === 'string') {
      const parsed = parseStringOffset(item)
      if (!parsed)
        return undefined
      result.push(parsed)
    }
    else {
      // bare number Edge values are not mapped to [target, container] coordinates
      // fall through to undefined → signals JS-based scroll tracking fallback
      return undefined
    }
  }
  return result as NormalisedOffset
}

function matchesPreset(
  offset: ScrollOffsetType,
  preset: readonly (readonly [number, number])[],
): boolean {
  const normalised = normaliseOffset(offset)
  if (!normalised)
    return false
  for (let i = 0; i < 2; i++) {
    const o = normalised[i]
    const p = preset[i]
    if (o[0] !== p[0] || o[1] !== p[1])
      return false
  }
  return true
}

/**
 * Maps a ScrollOffset array to a ViewTimeline named range.
 * Returns undefined for unrecognised patterns — signals fallback to JS scroll tracking.
 *
 * Ported from framer-motion's internal render/dom/scroll/utils/offset-to-range.mjs
 */
export function offsetToViewTimelineRange(
  offset: ScrollOffsetType | undefined,
): { rangeStart: string, rangeEnd: string } | undefined {
  if (!offset) {
    return { rangeStart: 'contain 0%', rangeEnd: 'contain 100%' }
  }
  for (const [preset, name] of presets) {
    if (matchesPreset(offset, preset)) {
      return { rangeStart: `${name} 0%`, rangeEnd: `${name} 100%` }
    }
  }
  return undefined
}
