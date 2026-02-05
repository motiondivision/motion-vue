import { lazyMotionContextProvider } from '@/components/lazy-motion/context'
import type { Feature } from '@/features'
import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'

export const LazyMotion = defineComponent({
  name: 'LazyMotion',
  inheritAttrs: false,
  props: {
    features: {
      type: [Object, Function] as PropType<Feature[] | Promise<Feature[]> | (() => Promise<Feature[]>)>,
      default: () => ([]),
    },
    strict: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const features = ref<any[]>(Array.isArray(props.features) ? props.features : [])

    if (!Array.isArray(props.features)) {
      const featuresPromise = typeof props.features === 'function' ? props.features() : props.features
      featuresPromise.then((feats) => {
        features.value = feats
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
