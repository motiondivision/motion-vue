import type { VariantLabels } from '@/types'

export function isVariantLabels(value: any): value is VariantLabels {
  return typeof value === 'string' || value === false || Array.isArray(value)
}
