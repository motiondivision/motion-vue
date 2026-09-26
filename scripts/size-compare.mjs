#!/usr/bin/env node
/**
 * Compare the current build's bundle size against the published npm version,
 * with terminal bar charts for before/after/diff.
 *
 * Usage:
 *   pnpm size:compare [version] [--build]
 *
 *   [version]  Published version to compare against (default: latest).
 *   --build    Run `pnpm build` in packages/motion before measuring.
 *
 * Two views:
 *   1. Package files — per-file raw/gzip diff of dist/es (both dists are
 *      published unminified, so this is apples-to-apples).
 *   2. Consumer bundles — fixed entry points bundled with rolldown
 *      (minified, library externals) from identical sandboxes, so both
 *      versions resolve bare imports the same way.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const pkgRoot = join(repoRoot, 'packages/motion')
const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))

const version = process.argv.find(a => /^\d+\.\d+\.\d+/.test(a))
const doBuild = process.argv.includes('--build')

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim()
}

function walk(dir, base = dir) {
  const out = new Map()
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      for (const [k, v] of walk(full, base)) out.set(k, v)
    }
    else {
      const content = readFileSync(full)
      out.set(relative(base, full), { raw: content.length, gzip: gzipSync(content).length })
    }
  }
  return out
}

// --- tiny chart helpers ---

const BAR_WIDTH = 30
const RED = '\x1B[31m'
const GREEN = '\x1B[32m'
const DIM = '\x1B[2m'
const RESET = '\x1B[0m'

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`
}

function bar(bytes, max) {
  const n = Math.max(1, Math.round((bytes / max) * BAR_WIDTH))
  return '█'.repeat(n)
}

function diffLine(delta, total) {
  if (delta === 0)
    return `${DIM}±0${RESET}`
  const pct = total > 0 ? ` (${delta > 0 ? '+' : ''}${((delta / total) * 100).toFixed(1)}%)` : ''
  const color = delta > 0 ? RED : GREEN
  return `${color}${delta > 0 ? '+' : ''}${kb(delta)}${pct}${RESET}`
}

// --- main ---

if (doBuild) {
  console.log('Building current source…')
  run('pnpm build', pkgRoot)
}

const currentDist = join(pkgRoot, 'dist/es')
if (!existsSync(currentDist)) {
  console.error('packages/motion/dist/es not found — run `pnpm build` first (or pass --build)')
  process.exit(1)
}

const publishedVersion = version ?? run(`npm view ${pkg.name} version`, pkgRoot)

const tmp = mkdtempSync(join(tmpdir(), 'size-compare-'))

try {
  const tarball = run(`npm pack ${pkg.name}@${publishedVersion} --pack-destination "${tmp}" --silent`, pkgRoot)
  run(`tar -xzf "${join(tmp, tarball)}" -C "${tmp}"`, tmp)
  const publishedDist = join(tmp, 'package/dist/es')
  if (!existsSync(publishedDist)) {
    console.error(`published package has no dist/es`)
    process.exit(1)
  }

  /**
   * Sandbox both dists identically: copy the current dist next to the
   * extracted one and share one node_modules of symlinks, so bare imports
   * resolve the same way for both bundles.
   */
  mkdirSync(join(tmp, 'current'), { recursive: true })
  run(`cp -R "${join(pkgRoot, 'dist')}" "${join(tmp, 'current/')}"`, tmp)
  const sandboxCurrentDist = join(tmp, 'current/dist/es')

  const require = createRequire(join(pkgRoot, 'package.json'))
  const tmpNm = join(tmp, 'node_modules')
  for (const name of ['vue', 'hey-listen', 'motion-dom', 'motion-utils', '@vueuse/core', 'framer-motion']) {
    try {
      let pkgDir
      try {
        pkgDir = dirname(require.resolve(`${name}/package.json`))
      }
      catch {
        // exports maps may hide package.json — resolve the entry and walk up
        pkgDir = dirname(require.resolve(name))
        while (!existsSync(join(pkgDir, 'package.json'))) pkgDir = dirname(pkgDir)
      }
      const link = join(tmpNm, name)
      mkdirSync(dirname(link), { recursive: true })
      symlinkSync(pkgDir, link)
    }
    catch {
      console.warn(`  warn: could not link ${name}`)
    }
  }

  console.log(`\n${pkg.name}: ${DIM}published ${publishedVersion}${RESET} vs ${DIM}current working tree${RESET}\n`)

  // --- 1. package files ---

  const current = walk(sandboxCurrentDist)
  const published = walk(publishedDist)
  const allFiles = [...new Set([...current.keys(), ...published.keys()])].sort()

  const rows = []
  let totalRaw = 0
  let totalGzip = 0
  let curRaw = 0
  let curGzip = 0
  let pubRaw = 0
  let pubGzip = 0
  for (const file of allFiles) {
    if (!file.endsWith('.mjs'))
      continue
    const cur = current.get(file)
    const pub = published.get(file)
    curRaw += cur?.raw ?? 0
    curGzip += cur?.gzip ?? 0
    pubRaw += pub?.raw ?? 0
    pubGzip += pub?.gzip ?? 0
    const dRaw = (cur?.raw ?? 0) - (pub?.raw ?? 0)
    const dGzip = (cur?.gzip ?? 0) - (pub?.gzip ?? 0)
    totalRaw += dRaw
    totalGzip += dGzip
    if (dRaw !== 0) {
      rows.push({ file, status: !pub ? 'added' : !cur ? 'removed' : 'changed', dRaw, dGzip })
    }
  }

  console.log('## Package files (dist/es/*.mjs)\n')
  const maxGzip = Math.max(pubGzip, curGzip)
  console.log(`  published ${publishedVersion.padEnd(8)} ${kb(pubGzip).padStart(8)} gzip ${DIM}${bar(pubGzip, maxGzip)}${RESET}`)
  console.log(`  current  ${''.padEnd(8)} ${kb(curGzip).padStart(8)} gzip ${bar(curGzip, maxGzip)}  ${diffLine(totalGzip, pubGzip)}`)
  console.log(`  ${DIM}(raw: ${kb(pubRaw)} → ${kb(curRaw)}, ${diffLine(totalRaw, pubRaw)})${RESET}\n`)

  if (rows.length === 0) {
    console.log('  no per-file changes\n')
  }
  else {
    const width = Math.max(...rows.map(r => r.file.length))
    const fileMax = Math.max(...rows.map(r => Math.abs(r.dGzip)))
    for (const row of rows) {
      const b = bar(Math.abs(row.dGzip), fileMax)
      console.log(`  ${row.file.padEnd(width)}  ${row.status.padEnd(7)} ${RED}${b}${RESET} ${diffLine(row.dGzip, pubGzip)}`)
    }
    console.log()
  }

  // --- 2. consumer bundles ---

  const externals = [
    'vue',
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    'framer-motion/dom',
  ]
  const externalFlags = [...new Set(externals)].flatMap(e => ['--external', e])

  const entries = [
    ['barrel (import * as m)', `import * as m from '%DIST%/index.mjs'\nconsole.log(m)\n`],
    ['Motion only', `import { Motion } from '%DIST%/index.mjs'\nconsole.log(Motion)\n`],
  ]
  if (existsSync(join(sandboxCurrentDist, 'components/animate-view/AnimateView.mjs'))) {
    entries.push([
      'AnimateView + startTransition only',
      `import { AnimateView, startTransition } from '%DIST%/index.mjs'\nconsole.log(AnimateView, startTransition)\n`,
    ])
  }

  const rolldownBin = join(repoRoot, 'node_modules', '.bin', 'rolldown')

  function bundle(distDir, entrySource, tag) {
    const entry = join(tmp, `entry-${tag}.mjs`)
    const outDir = join(tmp, `bundle-${tag}`)
    writeFileSync(entry, entrySource.replaceAll('%DIST%', distDir))
    run(
      [rolldownBin, entry, '-d', outDir, '--minify', ...externalFlags.map(e => (e.includes('/') ? `'${e}'` : e))].join(' '),
      tmp,
    )
    const outFile = join(outDir, readdirSync(outDir)[0])
    const content = readFileSync(outFile)
    return { raw: content.length, gzip: gzipSync(content).length }
  }

  console.log('## Consumer bundles (rolldown, minified, library externals)\n')
  for (const [label, source] of entries) {
    const hasInPublished = !label.startsWith('AnimateView')
      || existsSync(join(publishedDist, 'components/animate-view/AnimateView.mjs'))
    const cur = bundle(sandboxCurrentDist, source, 'cur')
    const pub = hasInPublished ? bundle(publishedDist, source, 'pub') : null

    console.log(`  ${label}`)
    if (!pub) {
      console.log(`    published: ${DIM}n/a (not in ${publishedVersion})${RESET}`)
      console.log(`    current:   ${kb(cur.gzip)} gzip ${bar(cur.gzip, cur.gzip)}`)
      continue
    }
    const maxG = Math.max(pub.gzip, cur.gzip)
    console.log(`    published: ${kb(pub.gzip).padStart(8)} gzip ${DIM}${bar(pub.gzip, maxG)}${RESET}`)
    console.log(`    current:   ${kb(cur.gzip).padStart(8)} gzip ${bar(cur.gzip, maxG)}  ${diffLine(cur.gzip - pub.gzip, pub.gzip)}`)
  }
  console.log()
}
finally {
  rmSync(tmp, { recursive: true, force: true })
}
