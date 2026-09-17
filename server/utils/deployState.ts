/**
 * Publish reconciliation (plan §4.3).
 *
 * KV is the source of truth; the live site is a prerender of whatever KV held
 * at build time. `content:v1:deploy` records how far the live site has caught
 * up so we can detect "KV is ahead and nobody is going to rebuild":
 *
 *   (a) stamp    — scripts/stamp-deployed.mjs writes `deployedRevision` at the
 *                  end of a successful Pages build.
 *   (b) merge    — a build started < IN_FLIGHT_WINDOW_MS ago is assumed in
 *                  flight; further saves ride along instead of re-triggering.
 *   (c) catch-up — `revision > deployedRevision` with nothing in flight fires
 *                  the Deploy Hook. Called from PUT and from /api/status polls.
 *   (d) fuse     — MAX_ATTEMPTS triggers without `deployedRevision` advancing
 *                  stops automatic retries and surfaces `stalled`.
 */

import type { H3Event } from 'h3'
import { DEPLOY_KV_KEY } from '#shared/validateContent'
import type { ContentStore } from './contentStore'

export interface DeployState {
  /** Revision the most recent successful build baked in (written by the stamp script). */
  deployedRevision: number
  /** When the Deploy Hook was last POSTed successfully; null once nothing is pending. */
  deployStartedAt: string | null
  /** Trigger attempts since `deployedRevision` last advanced. */
  deployAttempts: number
  /** Revision `deployAttempts` counts toward; a newer revision resets the counter. */
  attemptsRevision: number | null
  lastError: string | null
}

export interface PublishStatus {
  revision: number
  deployedRevision: number
  deployStartedAt: string | null
  deployAttempts: number
  /** KV is ahead of the live site and a build is (believed to be) on its way. */
  publishing: boolean
  /** Automatic retries gave up; needs a manual rebuild or a new save. */
  stalled: boolean
  hookConfigured: boolean
  lastError: string | null
}

export const IN_FLIGHT_WINDOW_MS = 120_000
export const MAX_ATTEMPTS = 3
const HOOK_TIMEOUT_MS = 10_000

const EMPTY_STATE: DeployState = {
  deployedRevision: 0,
  deployStartedAt: null,
  deployAttempts: 0,
  attemptsRevision: null,
  lastError: null,
}

export async function readDeployState(store: ContentStore): Promise<DeployState> {
  const raw = await store.get<Partial<DeployState>>(DEPLOY_KV_KEY)
  return { ...EMPTY_STATE, ...raw }
}

function isInFlight(state: DeployState, now: number): boolean {
  if (!state.deployStartedAt) return false
  const started = Date.parse(state.deployStartedAt)
  return Number.isFinite(started) && now - started < IN_FLIGHT_WINDOW_MS
}

async function postDeployHook(url: string) {
  const res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(HOOK_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Deploy Hook responded ${res.status} ${res.statusText}`)
}

/**
 * Compare `revision` (current KV content) against the deploy state and fire the
 * Deploy Hook when the live site is behind and no build is in flight. Writes
 * the deploy key only when it actually attempts a trigger, so status polls are
 * read-only in the steady state.
 */
export async function reconcileDeploy(event: H3Event, store: ContentStore, revision: number): Promise<PublishStatus> {
  const hookUrl = getEnvVar(event, 'DEPLOY_HOOK_URL')
  const state = await readDeployState(store)
  const now = Date.now()

  const behind = revision > state.deployedRevision
  const inFlight = behind && isInFlight(state, now)
  // A newer revision gets a fresh budget — the failing build may have been data-related.
  const attempts = state.attemptsRevision === revision ? state.deployAttempts : 0
  const stalled = behind && !inFlight && attempts >= MAX_ATTEMPTS

  const toStatus = (s: DeployState, publishing: boolean, isStalled: boolean): PublishStatus => ({
    revision,
    deployedRevision: s.deployedRevision,
    deployStartedAt: s.deployStartedAt,
    deployAttempts: s.deployAttempts,
    publishing,
    stalled: isStalled,
    hookConfigured: Boolean(hookUrl),
    lastError: s.lastError,
  })

  if (!behind || inFlight || stalled || !hookUrl) {
    return toStatus(state, behind && !stalled && Boolean(hookUrl), stalled)
  }

  const next: DeployState = { ...state, deployAttempts: attempts + 1, attemptsRevision: revision }
  try {
    await postDeployHook(hookUrl)
    next.deployStartedAt = new Date(now).toISOString()
    next.lastError = null
  } catch (err) {
    next.lastError = err instanceof Error ? err.message : String(err)
  }
  await store.put(DEPLOY_KV_KEY, next)

  const nowStalled = next.lastError !== null && next.deployAttempts >= MAX_ATTEMPTS
  return toStatus(next, !nowStalled, nowStalled)
}
