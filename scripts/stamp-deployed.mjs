/**
 * Build stamp (plan §4.3a).
 *
 * Runs on `postbuild`, i.e. only after `nuxt build` succeeded. Writes the
 * revision this build baked in (from `app/content/fetch-meta.json`) to the
 * `content:v1:deploy` key as `deployedRevision`, so the API can tell whether
 * the live site is behind KV. Never touches `content:v1` itself.
 *
 * Only runs inside a Cloudflare Pages build (`CF_PAGES=1`) with the `CF_*`
 * variables set and when the content actually came from KV. Set
 * `CONTENT_STAMP=1` to force it locally. Failures here are warnings — a
 * missed stamp just means one extra rebuild via reconciliation, whereas a
 * non-zero exit would block the deploy.
 *
 * Env: CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN (Workers KV Storage Write)
 */

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEPLOY_KV_KEY } from '../shared/validateContent.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const META_PATH = resolve(ROOT, 'app/content/fetch-meta.json')
const FETCH_TIMEOUT_MS = 15_000

const TAG = '[stamp-deployed]'

function kvUrl({ accountId, namespaceId }) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(DEPLOY_KV_KEY)}`
}

async function readDeployState(cf) {
  const res = await fetch(kvUrl(cf), {
    headers: { Authorization: `Bearer ${cf.token}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (res.status === 404) return {}
  if (!res.ok) throw new Error(`KV GET responded ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

async function writeDeployState(cf, state) {
  const form = new FormData()
  form.set('value', JSON.stringify(state))
  const res = await fetch(kvUrl(cf), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${cf.token}` },
    body: form,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`KV PUT responded ${res.status}: ${(await res.text()).slice(0, 300)}`)
}

async function main() {
  const isPagesBuild = process.env.CF_PAGES === '1' || process.env.CONTENT_STAMP === '1'
  if (!isPagesBuild) {
    console.log(`${TAG} not a Cloudflare Pages build — skipping stamp`)
    return
  }

  const cf = {
    accountId: process.env.CF_ACCOUNT_ID,
    namespaceId: process.env.CF_KV_NAMESPACE_ID,
    token: process.env.CF_API_TOKEN,
  }
  if (!cf.accountId || !cf.namespaceId || !cf.token) {
    console.log(`${TAG} CF_* env not set — skipping stamp`)
    return
  }

  const meta = JSON.parse(await readFile(META_PATH, 'utf8'))
  if (meta.source !== 'kv') {
    console.warn(`${TAG} content came from ${meta.source}, not KV — not stamping deployedRevision`)
    return
  }

  const previous = await readDeployState(cf)
  // Always overwrite, even if it regresses: an older build finishing last (Pro
  // concurrency) really did put older content live, and reconciliation will
  // notice `revision > deployedRevision` and rebuild.
  const next = {
    ...previous,
    deployedRevision: meta.revision,
    deployStartedAt: null,
    deployAttempts: 0,
    attemptsRevision: null,
    lastError: null,
  }
  await writeDeployState(cf, next)
  console.log(`${TAG} stamped deployedRevision=${meta.revision} (was ${previous.deployedRevision ?? 'unset'})`)
}

main().catch((err) => {
  console.warn(`${TAG} WARNING: ${err instanceof Error ? err.message : String(err)}`)
  console.warn(`${TAG} build output is unaffected; reconciliation will trigger an extra rebuild if needed`)
})
