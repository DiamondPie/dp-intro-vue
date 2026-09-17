/**
 * Bearer-token gate for the content PUT endpoint (plan §5).
 *
 * Single-user site: one long random secret (`EDIT_TOKEN`), compared in
 * constant time. The front-end token check is UX only — this is the real gate.
 */

import type { H3Event } from 'h3'

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  // Always walk the longer input so length differences don't short-circuit.
  const len = Math.max(ab.length, bb.length)
  let diff = ab.length ^ bb.length
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  return diff === 0
}

export function requireEditToken(event: H3Event) {
  const expected = getEnvVar(event, 'EDIT_TOKEN')
  if (!expected) {
    throw createError({ statusCode: 503, statusMessage: 'Editing disabled', message: 'EDIT_TOKEN is not configured.' })
  }

  const header = getRequestHeader(event, 'authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match || !constantTimeEqual(match[1]!, expected)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
