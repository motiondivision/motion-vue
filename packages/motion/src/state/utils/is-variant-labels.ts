import type { VariantLabels } from 'motion-dom'

export function isVariantLabels(value: any): value is VariantLabels {
  return typeof value === 'string' || value === false || Array.isArray(value)
}
