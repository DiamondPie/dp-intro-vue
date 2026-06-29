interface MusicConfig {
  cdnUrl: string
  songs: { name: string; artist: string }[]
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ \t_`~!@#$%^&*()[\]{}|\\;:'",./<>?+\-=]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default defineEventHandler(async () => {
  const storage = useStorage('assets:server')
  const data = await storage.getItem<MusicConfig>('music.json')
  if (!data || !Array.isArray(data.songs)) return []

  const base = data.cdnUrl.endsWith('/') ? data.cdnUrl : data.cdnUrl + '/'

  return data.songs.map(({ name, artist }) => {
    const slug = normalizeName(name)
    return {
      name,
      artist,
      url: `${base}${slug}/${slug}.mp3`,
      cover: `${base}${slug}/${slug}.webp`,
      lrc: `${base}${slug}/${slug}.lrc`,
    }
  })
})
