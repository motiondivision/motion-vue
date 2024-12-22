import type { Variant } from '@/types'

type MarginValue = `${number}${'px' | '%'}`

type MarginType = MarginValue | `${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`

export interface InViewOptions {
  root?: Element | Document
  margin?: MarginType
  amount?: 'some' | 'all' | number
}

type ViewportEventHandler = (entry: IntersectionObserverEntry | null) => void

export interface InViewProps {
  inViewOptions?: InViewOptions & { once?: boolean }
  inView?: string | Variant

  onViewportEnter?: ViewportEventHandler
  onViewportLeave?: ViewportEventHandler
}
