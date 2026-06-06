// Bundles scripts/simulate.js through rolldown (Vite's bundler, so the app's
// extensionless imports resolve), writes a temp bundle, and runs it.
import { rolldown } from 'rolldown'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '.sim-bundle.mjs')

const bundle = await rolldown({
  input: join(here, 'simulate.js'),
  logLevel: 'silent',
  platform: 'node',
})
await bundle.write({ file: out, format: 'esm' })
await bundle.close()
await import(out)
