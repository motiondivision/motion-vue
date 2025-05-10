import type { IProjectionNode } from 'framer-motion'

function notify(node: IProjectionNode) {
  return !node.isLayoutDirty && node.willUpdate(false)
}

export interface NodeGroup {
  add: (node: IProjectionNode) => void
  remove: (node: IProjectionNode) => void
  dirty: VoidFunction
}

export function nodeGroup(): NodeGroup {
  const nodes = new Set<IProjectionNode>()
  const subscriptions = new WeakMap<IProjectionNode, () => void>()

  const dirtyAll = (node?: IProjectionNode) => {
    nodes.forEach(notify)
    if (!node?.options.layoutId)
      node?.root?.didUpdate()
  }

  return {
    add: (node) => {
      nodes.add(node)
      subscriptions.set(
        node,
        node.addEventListener('willUpdate', () => dirtyAll(node)),
      )
    },
    remove: (node) => {
      nodes.delete(node)
      const unsubscribe = subscriptions.get(node)
      if (unsubscribe) {
        unsubscribe()
        subscriptions.delete(node)
      }
      dirtyAll(node)
    },
    dirty: dirtyAll,
  }
}
