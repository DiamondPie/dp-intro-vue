/** Audio container the CDN holds for a track. `mp3` is the default when unspecified. */
type AudioFormat = 'mp3' | 'flac'

interface SongConfig {
  name: string
  artist: string
  /** Set to `"flac"` for lossless tracks; omit (or `"mp3"`) for the common case. */
  format?: string
}

interface MusicConfig {
  cdnUrl: string
  songs: SongConfig[]
}

const AUDIO_EXTENSION: Record<AudioFormat, string> = {
  mp3: 'mp3',
  flac: 'flac',
}

function resolveFormat(format?: string): AudioFormat {
  const normalized = format?.trim().toLowerCase()
  return normalized === 'flac' ? 'flac' : 'mp3'
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

  return data.songs.map(({ name, artist, format }) => {
    const slug = normalizeName(name)
    const audioFormat = resolveFormat(format)
    return {
      name,
      artist,
      format: audioFormat,
      url: `${base}${slug}/${slug}.${AUDIO_EXTENSION[audioFormat]}`,
      cover: `${base}${slug}/${slug}.webp`,
      lrc: `${base}${slug}/${slug}.lrc`,
    }
  })
})
