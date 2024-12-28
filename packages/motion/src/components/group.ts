import type { IProjectionNode } from 'framer-motion'

function notify(node: IProjectionNode) {
  return !node.isLayoutDirty && node.willUpdate(false)
}

export interface NodeGroup {
  add: (node: IProjectionNode) => void
  remove: (node: IProjectionNode) => void
  dirty: VoidFunction
  didUpdate: VoidFunction
}

export function nodeGroup(): NodeGroup {
  const nodes = new Set<IProjectionNode>()
  const subscriptions = new WeakMap<IProjectionNode, () => void>()

  const dirtyAll = () => nodes.forEach(notify)

  return {
    add: (node) => {
      nodes.add(node)
      subscriptions.set(
        node,
        node.addEventListener('willUpdate', dirtyAll),
      )
    },
    remove: (node) => {
      nodes.delete(node)
      const unsubscribe = subscriptions.get(node)
      if (unsubscribe) {
        unsubscribe()
        subscriptions.delete(node)
      }
      // dirtyAll()
    },
    dirty: dirtyAll,
    didUpdate: () => {
      nodes[0]?.didUpdate()
    },
  }
}
