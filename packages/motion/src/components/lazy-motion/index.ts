import { lazyMotionContextProvider } from '@/components/lazy-motion/context'
import type { FeatureBundle } from '@/features/dom-animation'
import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'

type FeaturesProp = FeatureBundle | Promise<FeatureBundle> | (() => Promise<FeatureBundle>)

export const LazyMotion = defineComponent({
  name: 'LazyMotion',
  inheritAttrs: false,
  props: {
    features: {
      type: [Object, Function] as PropType<FeaturesProp>,
      required: true,
    },
    strict: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const features = ref<Partial<FeatureBundle>>({})

    // Check if it's a FeatureBundle object (has renderer property)
    if (typeof props.features === 'object' && 'renderer' in props.features) {
      // Sync load
      features.value = props.features
    }
    else if (typeof props.features === 'function') {
      // Async load - function that returns promise
      props.features().then((mod) => {
        features.value = mod
      })
    }
    else if (props.features instanceof Promise) {
      // Async load - direct promise
      props.features.then((mod) => {
        features.value = mod
      })
    }

    lazyMotionContextProvider({
      features,
      strict: props.strict,
    })

    return () => {
      return slots.default?.()
    }
  },
})
