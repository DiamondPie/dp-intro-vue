/**
 * In-page content editor state (plan §3 phase C).
 *
 * Entry: `#edit=<token>` in the URL hash (never a query — hashes stay out of
 * referers and server logs). The hash is stripped immediately and the token
 * kept in `sessionStorage` only. The token here is UX — it decides whether the
 * editing controls render; the real gate is `requireEditToken` on PUT.
 *
 * Editing mutates `siteContent` (see `useSiteContent`) in place after loading
 * the live KV document, so the normal components render the draft. `snapshot`
 * is the last document known to match the server; `dirty` compares against it.
 *
 * Saving is an explicit, whole-document PUT with the loaded `revision` —
 * there is deliberately no autosave (KV allows 1 write/s per key). After a
 * save the editor polls `/api/status` until the build that bakes the saved
 * revision lands (`deployedRevision >= revision`) or the reconciler reports a
 * stall; that polling is also what re-fires a failed Deploy Hook (§4.3c).
 */

import { validateContent } from '#shared/validateContent'
import { siteContent } from './useSiteContent'

const TOKEN_KEY = 'edit_token'
const HASH_PREFIX = '#edit='
const STATUS_POLL_MS = 10_000

type Doc = typeof siteContent.value

interface PublishStatus {
  revision: number
  deployedRevision: number
  publishing: boolean
  stalled: boolean
  hookConfigured: boolean
  lastError: string | null
}

export type EditorPhase =
  | 'idle'        // editing, nothing pending on the server
  | 'saving'
  | 'publishing'  // saved; waiting for the build that bakes `savedRevision`
  | 'published'   // build landed
  | 'no_hook'     // saved but DEPLOY_HOOK_URL isn't configured
  | 'stalled'     // reconciler gave up on this revision

export interface EditorError {
  kind: 'load' | 'save' | 'conflict' | 'unauthorized'
  message: string
}

/* Module-level so every component shares one editor session. */
const enabled = ref(false)
const loading = ref(false)
const token = ref<string | null>(null)
const snapshot = ref<string | null>(null)
const phase = ref<EditorPhase>('idle')
const savedRevision = ref<number | null>(null)
const error = ref<EditorError | null>(null)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const dirty = computed(() => enabled.value && snapshot.value !== null && JSON.stringify(siteContent.value) !== snapshot.value)
const problems = computed(() => (enabled.value ? validateContent(siteContent.value) : []))
const canSave = computed(() => dirty.value && problems.value.length === 0 && phase.value !== 'saving' && !loading.value)

function readTokenFromHash(): string | null {
  const { hash } = window.location
  if (!hash.startsWith(HASH_PREFIX)) return null
  const value = decodeURIComponent(hash.slice(HASH_PREFIX.length)).trim()
  history.replaceState(history.state, '', window.location.pathname + window.location.search)
  return value || null
}

function readToken(): string | null {
  try {
    const fromHash = readTokenFromHash()
    if (fromHash) {
      sessionStorage.setItem(TOKEN_KEY, fromHash)
      return fromHash
    }
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function forgetToken() {
  token.value = null
  try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

function stopPolling() {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
}

function applyStatus(status: PublishStatus) {
  const rev = savedRevision.value ?? status.revision
  if (!status.hookConfigured) {
    phase.value = 'no_hook'
  } else if (status.deployedRevision >= rev) {
    phase.value = 'published'
  } else if (status.stalled) {
    phase.value = 'stalled'
  } else {
    phase.value = 'publishing'
  }
  return phase.value === 'publishing'
}

async function pollStatus() {
  stopPolling()
  try {
    const status = await $fetch<PublishStatus>('/api/status')
    if (!applyStatus(status)) return
  } catch {
    // Transient — keep polling; the next tick may succeed.
  }
  pollTimer = setTimeout(pollStatus, STATUS_POLL_MS)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const doc = await $fetch<Doc>('/api/content')
    siteContent.value = doc
    snapshot.value = JSON.stringify(doc)
    // A publish may already be in flight from an earlier session / tab, so
    // check once now and keep polling if the live site is still behind.
    savedRevision.value = doc.revision
    await pollStatus()
  } catch (err) {
    error.value = { kind: 'load', message: describe(err) }
  } finally {
    loading.value = false
  }
}

function describe(err: unknown): string {
  const e = err as { data?: { message?: string, statusMessage?: string }, message?: string }
  return e?.data?.message ?? e?.data?.statusMessage ?? e?.message ?? String(err)
}

async function save() {
  if (!canSave.value || !token.value) return
  phase.value = 'saving'
  error.value = null
  const body = siteContent.value
  try {
    const result = await $fetch<PublishStatus & { updatedAt: string }>('/api/content', {
      method: 'PUT',
      body,
      headers: { Authorization: `Bearer ${token.value}` },
    })
    // Don't read back — KV is eventually consistent. Trust what we just wrote.
    siteContent.value = { ...body, revision: result.revision, updatedAt: result.updatedAt }
    snapshot.value = JSON.stringify(siteContent.value)
    savedRevision.value = result.revision
    if (applyStatus(result)) pollTimer = setTimeout(pollStatus, STATUS_POLL_MS)
  } catch (err) {
    const status = (err as { statusCode?: number, response?: { status?: number } })
    const code = status?.statusCode ?? status?.response?.status
    if (code === 401) {
      error.value = { kind: 'unauthorized', message: describe(err) }
      forgetToken()
      enabled.value = false
    } else if (code === 409) {
      error.value = { kind: 'conflict', message: describe(err) }
    } else {
      error.value = { kind: 'save', message: describe(err) }
    }
    phase.value = 'idle'
  }
}

function discard() {
  if (snapshot.value === null) return
  siteContent.value = JSON.parse(snapshot.value)
  error.value = null
}

/** Re-fetch the live document (after a 409) — drops local edits. */
async function reload() {
  await load()
}

function exit(confirmMessage: string) {
  if (dirty.value && !window.confirm(confirmMessage)) return
  stopPolling()
  forgetToken()
  enabled.value = false
  // Reload to get the pristine prerendered content back.
  window.location.reload()
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (!dirty.value) return
  e.preventDefault()
}

let initialised = false

/** Call once from the page (client-side). Safe to call from several components. */
function init() {
  if (initialised || import.meta.server) return
  initialised = true
  token.value = readToken()
  if (!token.value) return
  enabled.value = true
  window.addEventListener('beforeunload', onBeforeUnload)
  load()
}

export function useEditor() {
  return {
    enabled: readonly(enabled),
    loading: readonly(loading),
    dirty,
    problems,
    canSave,
    phase: readonly(phase),
    savedRevision: readonly(savedRevision),
    error: readonly(error),
    revision: computed(() => siteContent.value.revision),
    init,
    save,
    discard,
    reload,
    exit,
  }
}
