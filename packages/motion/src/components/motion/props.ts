import { warning } from 'hey-listen'

export const MotionComponentProps = {
  'ignoreStrict': { type: Boolean },
  'forwardMotionProps': { type: Boolean, default: false },
  'asChild': { type: Boolean, default: false },
  'hover': { type: [String, Array, Object] },
  'press': { type: [String, Array, Object] },
  'inView': { type: [String, Array, Object] },
  'focus': { type: [String, Array, Object] },
  'whileDrag': { type: [String, Array, Object] },
  'whileHover': { type: [String, Array, Object], default: ({ hover }) => {
    if (process.env.NODE_ENV === 'development' && hover) {
      warning(true, 'hover is deprecated. Use whileHover instead.')
    }
    return hover
  } },
  'whilePress': { type: [String, Array, Object], default: ({ press }) => {
    if (process.env.NODE_ENV === 'development' && press) {
      warning(true, 'press is deprecated. Use whilePress instead.')
    }
    return press
  } },
  'whileInView': { type: [String, Array, Object], default: ({ inView }) => {
    if (process.env.NODE_ENV === 'development' && inView) {
      warning(true, 'inView is deprecated. Use whileInView instead.')
    }
    return inView
  } },
  'whileFocus': { type: [String, Array, Object], default: ({ focus }) => {
    if (process.env.NODE_ENV === 'development' && focus) {
      warning(true, 'focus is deprecated. Use whileFocus instead.')
    }
    return focus
  } },
  'custom': { type: [String, Number, Object, Array] },
  'initial': { type: [String, Array, Object, Boolean], default: undefined },
  'animate': { type: [String, Array, Object], default: undefined },
  'exit': { type: [String, Array, Object] },
  'variants': { type: Object },
  'inherit': { type: Boolean },
  'style': { type: Object },
  'transformTemplate': { type: Function },
  'transition': { type: Object },
  'layoutGroup': { type: Object },
  'motionConfig': { type: Object },
  'onAnimationComplete': { type: Function },
  'onUpdate': { type: Function },
  'layout': { type: [Boolean, String], default: false },
  'layoutId': { type: String, default: undefined },
  'layoutScroll': { type: Boolean, default: false },
  'layoutRoot': { type: Boolean, default: false },
  'data-framer-portal-id': { type: String },
  'crossfade': { type: Boolean, default: true },
  'layoutDependency': { type: [String, Number, Object, Array] },
  'onBeforeLayoutMeasure': { type: Function },
  'onLayoutMeasure': { type: Function },
  'onLayoutAnimationStart': { type: Function },
  'onLayoutAnimationComplete': { type: Function },
  'globalPressTarget': { type: Boolean },
  'onPressStart': { type: Function },
  'onPress': { type: Function },
  'onPressCancel': { type: Function },
  'onHoverStart': { type: Function },
  'onHoverEnd': { type: Function },
  'inViewOptions': { type: Object },
  'onViewportEnter': { type: Function },
  'onViewportLeave': { type: Function },
  'drag': { type: [Boolean, String] },
  'dragSnapToOrigin': { type: Boolean },
  'dragDirectionLock': { type: Boolean },
  'dragPropagation': { type: Boolean },
  'dragConstraints': { type: [Boolean, Object] },
  'dragElastic': { type: [Boolean, Number, Object], default: 0.5 },
  'dragMomentum': { type: Boolean, default: true },
  'dragTransition': { type: Object },
  'dragListener': { type: Boolean, default: true },
  'dragControls': { type: Object },
  'onDragStart': { type: Function },
  'onDragEnd': { type: Function },
  'onDrag': { type: Function },
  'onDirectionLock': { type: Function },
  'onDragTransitionEnd': { type: Function },
  'onMeasureDragConstraints': { type: Function },
  'onPanSessionStart': { type: Function },
  'onPanStart': { type: Function },
  'onPan': { type: Function },
  'onPanEnd': { type: Function },
}
