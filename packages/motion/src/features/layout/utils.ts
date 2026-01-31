import type { IProjectionNode, VisualElement } from 'motion-dom'

export function getClosestProjectingNode(
  visualElement?: VisualElement<
    unknown,
    unknown,
    { allowProjection?: boolean }
  >,
): IProjectionNode | undefined {
  if (!visualElement)
    return undefined

  return visualElement.options.allowProjection !== false
    ? visualElement.projection
    : getClosestProjectingNode(visualElement.parent)
}
