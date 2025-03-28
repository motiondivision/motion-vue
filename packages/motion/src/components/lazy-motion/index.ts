import { lazyMotionContextProvider } from '@/components/lazy-motion/context'
import type { Feature } from '@/features'
import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'

export const LazyMotion = defineComponent({
  name: 'LazyMotion',
  props: {
    features: {
      type: Object as PropType<Feature[] | Promise<Feature[]>>,
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
      props.features.then((feats) => {
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
