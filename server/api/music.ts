export default defineEventHandler(async () => {
  const storage = useStorage('assets:server')
  const data = await storage.getItem<unknown[]>('music.json')
  return Array.isArray(data) ? data : []
})
