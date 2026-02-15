import type { Options } from '@/types/state'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends Omit<Options, 'motionConfig' | 'layoutGroup'> {
  }
}
