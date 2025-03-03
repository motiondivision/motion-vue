import type { VariantLabels } from '@/types'

export function isVariantLabels(value: any): value is VariantLabels {
  return typeof value === 'string' || Array.isArray(value)
}
