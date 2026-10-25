import { describe, expect, it, vi } from 'vitest'
import type { PresenceMode } from '../presence-core'
import { createPresenceCore } from '../presence-core'

function setup(mode: PresenceMode = 'sync') {
  const onExitComplete = vi.fn()
  const core = createPresenceCore<string>({
    getMode: () => mode,
    onExitComplete,
  })
  const rendered = () => core.getRendered().map(e => `${String(e.key)}:${e.isPresent}`)
  return { core, rendered, onExitComplete }
}

const kids = (...keys: string[]) => keys.map(key => ({ key, child: `child-${key}` }))

describe('presence-core', () => {
  it('renders present children on initial sync', () => {
    const { core, rendered } = setup()
    core.syncChildren(kids('a', 'b'))
    expect(rendered()).toEqual(['a:true', 'b:true'])
  })

  it('splices a vanished key back at its original index as not-present', () => {
    const { core, rendered } = setup()
    core.syncChildren(kids('a', 'b', 'c'))
    core.syncChildren(kids('a', 'c'))
    expect(rendered()).toEqual(['a:true', 'b:false', 'c:true'])
  })

  it('holds the render set until every exiting key completes, then commits in one shot', () => {
    const { core, rendered, onExitComplete } = setup()
    core.syncChildren(kids('a', 'b', 'c'))
    core.syncChildren(kids('c'))

    core.completeExit('a')
    expect(rendered()).toEqual(['a:false', 'b:false', 'c:true'])
    expect(onExitComplete).not.toHaveBeenCalled()

    core.completeExit('b')
    expect(rendered()).toEqual(['c:true'])
    expect(onExitComplete).toHaveBeenCalledTimes(1)
  })

  it('re-entered keys flip back to present and stale exit completion is ignored', () => {
    const { core, rendered, onExitComplete } = setup()
    core.syncChildren(kids('a'))
    core.syncChildren(kids())
    expect(rendered()).toEqual(['a:false'])

    core.syncChildren(kids('a'))
    expect(rendered()).toEqual(['a:true'])

    core.completeExit('a')
    expect(rendered()).toEqual(['a:true'])
    expect(onExitComplete).not.toHaveBeenCalled()
  })

  it('ignores completion for keys that never exited', () => {
    const { core, rendered, onExitComplete } = setup()
    core.syncChildren(kids('a'))
    core.completeExit('zzz')
    expect(rendered()).toEqual(['a:true'])
    expect(onExitComplete).not.toHaveBeenCalled()
  })

  it('a stale completion does not block the key\'s next exit from committing', () => {
    const { core, rendered, onExitComplete } = setup()
    core.syncChildren(kids('a'))
    core.syncChildren(kids())
    core.syncChildren(kids('a'))
    // The first exit's completion arrives after the re-entry dropped the key
    // from the wait set: stale, and it must not mark the key as processed.
    core.completeExit('a')
    core.syncChildren(kids())
    core.completeExit('a')
    expect(rendered()).toEqual([])
    expect(onExitComplete).toHaveBeenCalledTimes(1)
  })

  it('does not duplicate an exiting entry when a mid-exit sync still omits the key', () => {
    const { core, rendered } = setup()
    core.syncChildren(kids('a', 'b'))
    core.syncChildren(kids('b'))
    core.syncChildren(kids('b'))
    core.syncChildren(kids('b', 'c'))
    expect(rendered()).toEqual(['a:false', 'b:true', 'c:true'])
  })

  it('wait mode renders only the exiting set and holds incoming children until commit', () => {
    const { core, rendered, onExitComplete } = setup('wait')
    core.syncChildren(kids('a'))
    core.syncChildren(kids('b'))
    expect(rendered()).toEqual(['a:false'])

    core.completeExit('a')
    expect(rendered()).toEqual(['b:true'])
    expect(onExitComplete).toHaveBeenCalledTimes(1)
  })

  it('wait mode without exiting children syncs normally', () => {
    const { core, rendered } = setup('wait')
    core.syncChildren(kids('a'))
    core.syncChildren(kids('a', 'b'))
    expect(rendered()).toEqual(['a:true', 'b:true'])
  })

  /**
   * Upstream inserts at the old index, so an exiting key lands where the index
   * shift puts it once the new list also inserts or reorders keys. Pinned here
   * so the placement stays traceable to upstream rather than drifting.
   */
  it('places an exiting key at its old index even when the list also inserts', () => {
    const { core, rendered } = setup()
    core.syncChildren(kids('a', 'b', 'c'))
    core.syncChildren(kids('x', 'a', 'c'))
    expect(rendered()).toEqual(['x:true', 'b:false', 'a:true', 'c:true'])
  })

  it('appends exiting keys that have no remaining neighbour', () => {
    const { core, rendered } = setup()
    core.syncChildren(kids('a', 'b', 'c'))
    core.syncChildren(kids('a', 'b'))
    expect(rendered()).toEqual(['a:true', 'b:true', 'c:false'])
  })

  it('popLayout schedules like sync (pop styling lives in the adapter)', () => {
    const { core, rendered } = setup('popLayout')
    core.syncChildren(kids('a', 'b'))
    core.syncChildren(kids('b'))
    expect(rendered()).toEqual(['a:false', 'b:true'])
  })
})
