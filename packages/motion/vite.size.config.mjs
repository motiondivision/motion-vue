/**
 * Granular production size builds for motion-v.
 *
 * Mirrors motiondivision/motion's `rollup.size.config.mjs`: each public
 * surface is bundled on its own (resolve + NODE_ENV=production + terser)
 * so a shared chunk cannot hide bytes from the gzip budget.
 *
 * Run with `pnpm measure` (this file is a Node script, not a Vite CLI config).
 * Treemaps land in `size-stats/` for local inspection.
 *
 * `vue` and `@vueuse/core` stay external (peer dependencies). `framer-motion`,
 * `motion-dom`, `motion-utils`, and `hey-listen` are bundled — that is the
 * cost a consumer pays on top of Vue, same as React's size builds bundle
 * `motion-dom` while externalising React.
 *
 * There is no `motion-v/m` subpath (React publishes `framer-motion/m`).
 * These entries import the feature modules directly. With `sideEffects: false`
 * the root ESM barrel tree-shakes to the same graphs; bundlers that ignore
 * that still pull `motion` and `m` together.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { build } from 'vite'

const pkgRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)))
const distDir = path.join(pkgRoot, 'dist')
const statsDir = path.join(pkgRoot, 'size-stats')

/** @type {{ name: string, input: string }[]} */
export const sizeEntries = [
  { name: 'motion', input: 'size/motion.ts' },
  { name: 'm', input: 'size/m.ts' },
  { name: 'm-dom-animation', input: 'size/m-dom-animation.ts' },
  { name: 'm-dom-max', input: 'size/m-dom-max.ts' },
  { name: 'animate', input: 'size/animate.ts' },
  { name: 'use-animate', input: 'size/use-animate.ts' },
  { name: 'scroll', input: 'size/scroll.ts' },
  { name: 'use-scroll', input: 'size/use-scroll.ts' },
  { name: 'waapi-animate', input: 'size/waapi-animate.ts' },
]

function isFrameworkExternal(id) {
  if (
    id === 'vue'
    || id.startsWith('vue/')
    || id === '@vueuse/core'
    || id.startsWith('@vueuse/')
  ) {
    return true
  }
  return /\/node_modules\/(?:vue|@vueuse\/(?:core|shared|metadata))(?:\/|$)/.test(id)
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

/**
 * Tight ceiling: round the measured gzip up to 0.01 kB, then add 0.05 kB
 * so a 1-byte zlib rounding difference does not flap CI.
 */
export function suggestedMaxSize(bytes) {
  const padded = Math.ceil((bytes / 1024) * 100) / 100 + 0.05
  return `${padded.toFixed(2)} kB`
}

function assertProductionBundle(name, code) {
  if (code.includes('process.env.NODE_ENV')) {
    throw new Error(`${name} still contains process.env.NODE_ENV — dev branches were not stripped`)
  }
  if (/from\s*["'](?:framer-motion|motion-dom|motion-utils|hey-listen)(?:\/[^"']*)?["']/.test(code)) {
    throw new Error(`${name} externalised a library dependency; size bundles must include it`)
  }
}

async function buildEntry(entry) {
  const outFile = `size-rollup-${entry.name}.js`
  const result = await build({
    configFile: false,
    root: pkgRoot,
    publicDir: false,
    logLevel: 'warn',
    clearScreen: false,
    mode: 'production',
    define: {
      'process.env.NODE_ENV': '"production"',
      '__VUE_OPTIONS_API__': 'true',
      '__VUE_PROD_DEVTOOLS__': 'false',
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'false',
    },
    resolve: {
      alias: {
        '@': path.join(pkgRoot, 'src'),
      },
    },
    plugins: [
      vue(),
      visualizer({
        filename: path.join(statsDir, `${entry.name}.html`),
        title: `motion-v ${entry.name}`,
        gzipSize: true,
        template: 'treemap',
        open: false,
        projectRoot: pkgRoot,
      }),
    ],
    build: {
      outDir: distDir,
      emptyOutDir: false,
      copyPublicDir: false,
      sourcemap: false,
      minify: 'terser',
      cssCodeSplit: false,
      chunkSizeWarningLimit: 10000,
      reportCompressedSize: false,
      terserOptions: {
        format: { comments: false },
      },
      lib: {
        entry: path.join(pkgRoot, entry.input),
        formats: ['es'],
        fileName: () => outFile,
      },
      rolldownOptions: {
        external: isFrameworkExternal,
        // Externals are peers (`vue`, `@vueuse/core`), both side-effect free.
        // Without this, an unused `@vueuse/core` binding survives as
        // `import "@vueuse/core"`, which would pull the whole package in.
        treeshake: {
          moduleSideEffects(id, external) {
            return !external
          },
        },
        output: {
          codeSplitting: false,
          comments: false,
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE')
            return
          warn(warning)
        },
      },
    },
  })

  const outputs = Array.isArray(result) ? result.flatMap(item => item.output) : result.output
  const jsChunks = outputs.filter(item => item.type === 'chunk' && item.fileName.endsWith('.js'))
  if (jsChunks.length !== 1 || jsChunks[0].fileName !== outFile) {
    const names = outputs.map(item => item.fileName).join(', ')
    throw new Error(`${entry.name} did not emit a single ${outFile} (got: ${names})`)
  }

  for (const item of outputs) {
    if (item.type === 'chunk')
      continue
    const assetPath = path.join(distDir, item.fileName)
    const source = typeof item.source === 'string' ? item.source : ''
    if (item.fileName.endsWith('.css') && source.trim() === '') {
      rmSync(assetPath, { force: true })
      continue
    }
    throw new Error(`${entry.name} emitted an unexpected asset: ${item.fileName}`)
  }

  const fullPath = path.join(distDir, outFile)
  const code = readFileSync(fullPath)
  assertProductionBundle(entry.name, code.toString('utf8'))
  const gzip = gzipSync(code).length
  return { name: entry.name, file: `./dist/${outFile}`, raw: code.length, gzip }
}

function cleanPreviousSizeBundles() {
  mkdirSync(distDir, { recursive: true })
  if (existsSync(distDir)) {
    for (const file of readdirSync(distDir)) {
      if (file.startsWith('size-rollup-') && file.endsWith('.js'))
        rmSync(path.join(distDir, file))
    }
  }
  rmSync(statsDir, { recursive: true, force: true })
  mkdirSync(statsDir, { recursive: true })
}

async function main() {
  cleanPreviousSizeBundles()
  const rows = []
  for (const entry of sizeEntries)
    rows.push(await buildEntry(entry))

  const nameWidth = Math.max(...rows.map(row => row.name.length))
  console.log('\nGzip size (vue + @vueuse/core external)\n')
  for (const row of rows) {
    console.log(
      `  ${row.name.padEnd(nameWidth)}  ${kb(row.gzip).padStart(10)} gzip   raw ${kb(row.raw).padStart(10)}   maxSize "${suggestedMaxSize(row.gzip)}"`,
    )
  }
  console.log(`\nTreemaps: ${path.relative(process.cwd(), statsDir) || 'size-stats'}/`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
