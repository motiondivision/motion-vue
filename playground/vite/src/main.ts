import { createApp } from 'vue'
import { MotionPlugin } from 'motion-v'
import { router } from './router'
import App from './App.vue'

import './style.css'

const app = createApp(App)
app.use(router)
app.use(MotionPlugin, {
  presets: {
    'fade-in': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 },
    },
    'slide-up': {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    },
    'scale-in': {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
})
app.mount('#app')
