/**
 * Publish status for the editor to poll after saving. Also runs the §4.3
 * catch-up: if KV is ahead of the live site and no build is in flight, this
 * poll re-fires the Deploy Hook, so a failed build/hook self-heals while the
 * editor tab is open.
 */

import { CONTENT_KV_KEY } from '#shared/validateContent'

export default defineEventHandler(async (event) => {
  const store = useContentStore(event)
  const content = await store.get<{ revision?: number, updatedAt?: string }>(CONTENT_KV_KEY)
  const status = await reconcileDeploy(event, store, content?.revision ?? 0)

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { updatedAt: content?.updatedAt ?? null, ...status }
})
