/**
 * Save the full content document (plan §3 phase B).
 *
 *   401  missing / wrong `Authorization: Bearer <EDIT_TOKEN>`
 *   400  body fails the shared schema
 *   409  `body.revision` ≠ current KV revision (optimistic lock)
 *
 * On success the stored document gets `revision + 1` and a fresh `updatedAt`,
 * then `reconcileDeploy` decides whether to POST the Deploy Hook (§4.3 — not
 * every save triggers a build). The response carries the new revision and the
 * publish status the editor should show.
 */

import { CONTENT_KV_KEY, CONTENT_SCHEMA_VERSION, validateContent } from '#shared/validateContent'

interface ContentDocument {
  version: number
  revision: number
  updatedAt: string
  works: unknown[]
  photos: unknown[]
  friends: unknown[]
  commits: unknown[]
}

export default defineEventHandler(async (event) => {
  requireEditToken(event)

  const body = await readBody<Partial<ContentDocument>>(event)
  const problems = validateContent(body)
  if (problems.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid content', data: { problems } })
  }
  const incoming = body as ContentDocument

  const store = useContentStore(event)
  const current = await store.get<ContentDocument>(CONTENT_KV_KEY)
  const currentRevision = current?.revision ?? 0
  if (current && incoming.revision !== currentRevision) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Revision conflict',
      message: `Content was modified elsewhere (server revision ${currentRevision}, yours ${incoming.revision}). Reload before saving.`,
      data: { revision: currentRevision },
    })
  }

  // Rebuild from known fields only so stray keys never reach KV.
  const next: ContentDocument = {
    version: CONTENT_SCHEMA_VERSION,
    revision: currentRevision + 1,
    updatedAt: new Date().toISOString(),
    works: incoming.works,
    photos: incoming.photos,
    friends: incoming.friends,
    commits: incoming.commits,
  }
  await store.put(CONTENT_KV_KEY, next)

  // Don't read back: KV is eventually consistent — use what we just wrote.
  const status = await reconcileDeploy(event, store, next.revision)

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { updatedAt: next.updatedAt, ...status }
})
