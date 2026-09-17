/**
 * KV access for the content editor endpoints.
 *
 * In production the `CONTENT` KV namespace is bound to the Pages project and
 * reached through `event.context.cloudflare.env.CONTENT`. Under `nuxt dev`
 * there is no binding, so we fall back to the Cloudflare REST API using the
 * same `CF_*` variables `scripts/fetch-content.mjs` already uses (the token
 * needs Workers KV Storage **Write** for the PUT endpoint).
 *
 * KV allows 1 write/s per key; `put` retries on 429 with exponential backoff.
 */

import type { H3Event } from 'h3'

export interface ContentStore {
  get<T = unknown>(key: string): Promise<T | null>
  put(key: string, value: unknown): Promise<void>
}

interface KVNamespaceLike {
  get(key: string, type: 'text'): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

const PUT_MAX_ATTEMPTS = 4
const PUT_BASE_DELAY_MS = 1_100

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRateLimited(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /\b429\b|rate ?limit/i.test(message)
}

async function putWithBackoff(write: () => Promise<void>) {
  for (let attempt = 1; ; attempt++) {
    try {
      await write()
      return
    } catch (err) {
      if (!isRateLimited(err) || attempt >= PUT_MAX_ATTEMPTS) throw err
      await sleep(PUT_BASE_DELAY_MS * 2 ** (attempt - 1))
    }
  }
}

function parseJson<T>(text: string | null, key: string): T | null {
  if (text === null) return null
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`KV value at "${key}" is not valid JSON`)
  }
}

function bindingStore(kv: KVNamespaceLike): ContentStore {
  return {
    async get<T>(key: string) {
      return parseJson<T>(await kv.get(key, 'text'), key)
    },
    put(key, value) {
      return putWithBackoff(() => kv.put(key, JSON.stringify(value)))
    },
  }
}

function restStore({ accountId, namespaceId, token }: { accountId: string, namespaceId: string, token: string }): ContentStore {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/`
  const headers = { Authorization: `Bearer ${token}` }

  return {
    async get<T>(key: string) {
      const res = await fetch(base + encodeURIComponent(key), { headers })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`KV REST GET ${key} responded ${res.status}: ${(await res.text()).slice(0, 300)}`)
      return parseJson<T>(await res.text(), key)
    },
    put(key, value) {
      return putWithBackoff(async () => {
        const form = new FormData()
        form.set('value', JSON.stringify(value))
        const res = await fetch(base + encodeURIComponent(key), { method: 'PUT', headers, body: form })
        if (!res.ok) throw new Error(`KV REST PUT ${key} responded ${res.status}: ${(await res.text()).slice(0, 300)}`)
      })
    },
  }
}

/** Resolve a binding/secret: Cloudflare env in production, `process.env` under `nuxt dev`. */
export function getEnvVar(event: H3Event, name: string): string | undefined {
  const cfEnv = event.context.cloudflare?.env as Record<string, unknown> | undefined
  // `process` isn't typed in the cloudflare-pages server tsconfig; unenv polyfills it at runtime.
  const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const value = cfEnv?.[name] ?? nodeEnv?.[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function useContentStore(event: H3Event): ContentStore {
  const binding = event.context.cloudflare?.env?.CONTENT as KVNamespaceLike | undefined
  if (binding) return bindingStore(binding)

  const accountId = getEnvVar(event, 'CF_ACCOUNT_ID')
  const namespaceId = getEnvVar(event, 'CF_KV_NAMESPACE_ID')
  const token = getEnvVar(event, 'CF_API_TOKEN')
  if (accountId && namespaceId && token) return restStore({ accountId, namespaceId, token })

  throw createError({
    statusCode: 503,
    statusMessage: 'Content store unavailable',
    message: 'No CONTENT KV binding and CF_ACCOUNT_ID / CF_KV_NAMESPACE_ID / CF_API_TOKEN are not set.',
  })
}
