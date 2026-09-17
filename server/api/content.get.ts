/**
 * Current content document from KV. Serves the editor only — the site itself
 * is prerendered from `app/content/content.json` and never calls this.
 */

import { CONTENT_KV_KEY } from '#shared/validateContent'

export default defineEventHandler(async (event) => {
  const store = useContentStore(event)
  const content = await store.get(CONTENT_KV_KEY)
  if (!content) {
    throw createError({ statusCode: 404, statusMessage: 'Content not found', message: `KV has no "${CONTENT_KV_KEY}" yet.` })
  }
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return content
})
