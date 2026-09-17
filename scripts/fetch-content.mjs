/**
 * Build-time content fetch.
 *
 * Pulls the site content object from Cloudflare KV (`content:v1`) via the REST
 * API and writes it to `app/content/content.json`, which `useSiteContent()`
 * imports statically so the page stays fully prerendered.
 *
 * Runs on `predev` / `prebuild` / `pregenerate` (see package.json).
 *
 * Behaviour:
 *   - CF_* env vars missing        → use content/seed.json (info message)
 *   - KV request fails / times out → use content/seed.json (loud warning)
 *   - data fails schema validation → exit 1, build stops (never ship bad data)
 *
 * Env: CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN (Workers KV Storage Read)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTENT_KV_KEY, validateContent } from '../shared/validateContent.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SEED_PATH = resolve(ROOT, 'content/seed.json')
const OUT_PATH = resolve(ROOT, 'app/content/content.json')
const FETCH_TIMEOUT_MS = 15_000

const TAG = '[fetch-content]'

async function fetchFromKV({ accountId, namespaceId, token }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(CONTENT_KV_KEY)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`KV responded ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 300)}`)
  }
  return res.json()
}

async function readSeed() {
  return JSON.parse(await readFile(SEED_PATH, 'utf8'))
}

async function main() {
  const accountId = process.env.CF_ACCOUNT_ID
  const namespaceId = process.env.CF_KV_NAMESPACE_ID
  const token = process.env.CF_API_TOKEN

  let content
  let source

  if (!accountId || !namespaceId || !token) {
    console.log(`${TAG} CF_ACCOUNT_ID / CF_KV_NAMESPACE_ID / CF_API_TOKEN not set — using content/seed.json`)
    content = await readSeed()
    source = 'seed'
  } else {
    try {
      content = await fetchFromKV({ accountId, namespaceId, token })
      source = 'kv'
      console.log(`${TAG} fetched ${CONTENT_KV_KEY} from KV (revision ${content?.revision ?? '?'})`)
    } catch (err) {
      console.warn(`${TAG} WARNING: failed to fetch from KV — falling back to content/seed.json`)
      console.warn(`${TAG} ${err instanceof Error ? err.message : String(err)}`)
      content = await readSeed()
      source = 'seed'
    }
  }

  const problems = validateContent(content)
  if (problems.length) {
    console.error(`${TAG} ERROR: content from ${source} failed schema validation:`)
    for (const p of problems) console.error(`${TAG}   - ${p}`)
    process.exit(1)
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(content, null, 2) + '\n', 'utf8')
  console.log(`${TAG} wrote app/content/content.json (source: ${source})`)
}

main().catch((err) => {
  console.error(`${TAG} ERROR: ${err instanceof Error ? err.stack ?? err.message : String(err)}`)
  process.exit(1)
})
