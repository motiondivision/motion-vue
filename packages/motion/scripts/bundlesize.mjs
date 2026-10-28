#!/usr/bin/env node
/**
 * Gzip-check the size bundles listed in package.json `bundlesize`.
 * Adapted from motiondivision/motion `dev/inc/bundlesize.mjs`.
 *
 * Run `pnpm measure` first (or `pnpm size`, which does both).
 */
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { gzip } from 'node:zlib'

const gzipAsync = promisify(gzip)
const pkgRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const pkgPath = path.join(pkgRoot, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

if (!pkg.bundlesize?.length) {
  console.error(`No bundlesize configuration found in ${pkg.name}`)
  process.exit(1)
}

let hasFailures = false

for (const { path: filePath, maxSize } of pkg.bundlesize) {
  const fullPath = path.join(pkgRoot, filePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath} (run pnpm measure)`)
    hasFailures = true
    continue
  }

  const gzipped = await gzipAsync(fs.readFileSync(fullPath))
  const maxBytes = Number.parseFloat(maxSize) * 1024
  const gzippedSizeKb = (gzipped.length / 1024).toFixed(2)

  if (gzipped.length > maxBytes) {
    console.error(`❌ ${pkg.name}/${filePath} is ${gzippedSizeKb} kB (${maxSize} allowed)`)
    hasFailures = true
  }
  else {
    console.log(`✅ ${pkg.name}/${filePath} is ${gzippedSizeKb} kB (${maxSize} allowed)`)
  }
}

if (hasFailures)
  process.exit(1)
