import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import MotionVResolver from 'motion-v/resolver'

export default defineConfig({
  plugins: [
    vue(),
    jsx(),
    Components({
      resolvers: [MotionVResolver()],
    }),
  ],
  server: {
    port: 5173,
    // 监听 node_modules 中的特定包，实现热更新
    watch: {
      // 监听 motion-v 包的变更
      ignored: ['!**/node_modules/motion-v/**'],
    },
    // 允许访问 node_modules 中的文件
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    // 强制重新预构建，禁用缓存
    force: true,
    // 排除 motion-v，让它不被预构建，直接使用源码
    exclude: ['motion-v'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
