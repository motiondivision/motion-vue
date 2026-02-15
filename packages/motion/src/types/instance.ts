import type { Options } from '@/types/state'

// @ts-expect-error
declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends Omit<Options, 'motionConfig' | 'layoutGroup'> {
  }
}
