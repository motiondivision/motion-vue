import type { E2EConfig } from 'e2e'
import { web } from '@e2e-dev/web'

export default {
  targets: [{
    engine: web(),
    app: {
      url: process.env.APP_URL ?? 'http://localhost:5397',
      command: {
        executable: 'bash',
        args: ['-lc', 'npx vite build && npx vite preview --port 5397 --strictPort'],
        cwd: './playground/vite',
        reuseExisting: true,
        startupTimeout: 180_000,
        log: '.e2e/logs/app.log',
      },
    },
  }],
} satisfies E2EConfig
