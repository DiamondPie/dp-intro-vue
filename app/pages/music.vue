<script setup lang="ts">
interface Track {
  name: string
  artist: string
  url: string
  cover: string
  lrc: string
}

interface LyricLine {
  time: number
  text: string
  translation?: string
}

useHead({
  title: 'Music — DiamondPie',
  meta: [{ name: 'description', content: "DiamondPie's music collection" }],
})

const { data: tracks, refresh: refreshTracks } = await useFetch<Track[]>('/api/music', { default: () => [] })

// Player state
const currentIndex = ref(0)
const isPlaying = ref(false)
const refreshArcPct = ref(0)
const arcActive = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const prevVolume = ref(1)
const shuffle = ref(false)
const repeat = ref<'none' | 'all' | 'one'>('none')
const parsedLyrics = ref<LyricLine[]>([])
const currentLyricIndex = ref(-1)
const mobileDrawerOpen = ref(false)

let audio: HTMLAudioElement | null = null
let audioCtx: AudioContext | null = null
let gainNode: GainNode | null = null
let keyHandler: ((e: KeyboardEvent) => void) | null = null
let lastSaveTime = 0
const lyricsCache = new Map<string, LyricLine[]>()

const FADE_DURATION = 0.3 // seconds

const STORAGE_KEY = 'music-player-state'

interface PersistedState {
  currentIndex?: number
  volume?: number
  prevVolume?: number
  shuffle?: boolean
  repeat?: 'none' | 'all' | 'one'
  showVisualizer?: boolean
  currentTime?: number
}

function loadSavedState(): PersistedState | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as PersistedState : null
  }
  catch { return null }
}

function saveState() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentIndex: currentIndex.value,
      volume: volume.value,
      prevVolume: prevVolume.value,
      shuffle: shuffle.value,
      repeat: repeat.value,
      showVisualizer: showVisualizer.value,
      currentTime: audio?.currentTime ?? 0,
    } satisfies PersistedState))
  }
  catch { /* quota exceeded */ }
}

const audioAnalyser = ref<AnalyserNode | null>(null)
const showVisualizer = ref(true)

function initAudioContext() {
  if (audioCtx || !audio) return
  try {
    audioCtx = new AudioContext()
    const analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize = 1024
    analyserNode.smoothingTimeConstant = 0.72
    gainNode = audioCtx.createGain()
    gainNode.gain.value = 1
    const src = audioCtx.createMediaElementSource(audio)
    src.connect(gainNode)
    gainNode.connect(analyserNode)
    analyserNode.connect(audioCtx.destination)
    audioAnalyser.value = analyserNode
  }
  catch (e) {
    console.warn('[MusicAudioVisualizer] AudioContext init failed', e)
  }
}

const playerReady = ref(false)
const currentTrack = computed(() => playerReady.value ? (tracks.value?.[currentIndex.value] ?? null) : null)
const progress = computed(() =>
  duration.value > 0 ? currentTime.value / duration.value : 0,
)
const isMuted = computed(() => volume.value === 0)

function parseLrc(text: string): LyricLine[] {
  interface RawItem { time: number; text: string; isTr: boolean }
  const items: RawItem[] = []

  for (const line of text.split('\n')) {
    const m = line.match(/\[(\d{1,3}):(\d{2})\.(\d{2,3})\](.*)/)
    if (!m) continue
    const time = Number(m[1]) * 60 + Number(m[2]) + parseInt(m[3]!.padEnd(3, '0')) / 1000
    const rest = m[4]!.trim()
    const trMatch = rest.match(/^\[tr\](.*)/)
    if (trMatch) {
      items.push({ time, text: trMatch[1]!.trim(), isTr: true })
    }
    else {
      items.push({ time, text: rest, isTr: false })
    }
  }

  const timeToLyric = new Map<number, LyricLine>()
  const result: LyricLine[] = []

  for (const item of items) {
    if (!item.isTr) {
      const lyric: LyricLine = { time: item.time, text: item.text }
      timeToLyric.set(item.time, lyric)
      result.push(lyric)
    }
  }
  for (const item of items) {
    if (item.isTr) {
      const lyric = timeToLyric.get(item.time)
      if (lyric) lyric.translation = item.text
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

async function loadLyrics(lrcUrl: string) {
  parsedLyrics.value = []
  currentLyricIndex.value = -1
  if (!lrcUrl) return
  if (lyricsCache.has(lrcUrl)) {
    parsedLyrics.value = lyricsCache.get(lrcUrl)!
    return
  }
  try {
    const text = await $fetch<string>(lrcUrl, { responseType: 'text' })
    const parsed = parseLrc(text)
    lyricsCache.set(lrcUrl, parsed)
    parsedLyrics.value = parsed
  }
  catch { /* no lyrics available */ }
}

function onTimeUpdate() {
  if (!audio) return
  currentTime.value = audio.currentTime

  const lyrics = parsedLyrics.value
  if (lyrics.length) {
    let idx = -1
    for (let i = 0; i < lyrics.length; i++) {
      if ((lyrics[i]?.time ?? Infinity) <= audio.currentTime) idx = i
      else break
    }
    if (idx !== currentLyricIndex.value) currentLyricIndex.value = idx
  }

  const now = Date.now()
  if (now - lastSaveTime > 5000) {
    lastSaveTime = now
    saveState()
  }
}

function loadAndPlay(index: number, autoPlay = false) {
  if (!audio || !tracks.value?.length) return
  const track = tracks.value[index]
  if (!track) return
  currentIndex.value = index
  audio.src = track.url
  currentTime.value = 0
  duration.value = 0
  parsedLyrics.value = []
  currentLyricIndex.value = -1
  loadLyrics(track.lrc)
  if (autoPlay) audio.play().catch(() => {})
}

function selectTrack(index: number) {
  loadAndPlay(index, true)
  mobileDrawerOpen.value = false
}

async function togglePlay() {
  if (!audio) return
  if (isPlaying.value) {
    if (gainNode && audioCtx) {
      const ct = audioCtx.currentTime
      gainNode.gain.cancelScheduledValues(ct)
      gainNode.gain.setValueAtTime(gainNode.gain.value, ct)
      gainNode.gain.linearRampToValueAtTime(0, ct + FADE_DURATION)
    }
    // setTimeout is imprecise; add buffer so AudioContext gain ramp is guaranteed complete before pause
    await new Promise<void>(resolve => setTimeout(resolve, FADE_DURATION * 1000 + 80))
    audio.pause()
    // Do NOT reset gain here: the decoder's pre-buffered frames keep flowing through the Web Audio
    // graph for ~500ms after pause; resetting gain to 1 would let them through and cause a pop.
    // The fade-in branch always starts from setValueAtTime(0) so no reset is needed.
  }
  else {
    if (gainNode && audioCtx) {
      const ct = audioCtx.currentTime
      gainNode.gain.cancelScheduledValues(ct)
      gainNode.gain.setValueAtTime(0, ct)
      gainNode.gain.linearRampToValueAtTime(1, ct + FADE_DURATION)
    }
    audio.play().catch(() => {})
  }
}

function prevTrack() {
  if (!audio) return
  if (currentTime.value > 3) {
    audio.currentTime = 0
    return
  }
  const len = tracks.value?.length ?? 0
  const idx = currentIndex.value === 0 ? len - 1 : currentIndex.value - 1
  loadAndPlay(idx, isPlaying.value)
}

function advanceTrack() {
  const len = tracks.value?.length ?? 0
  if (!len) return
  if (repeat.value === 'one') {
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
    return
  }
  let idx: number
  if (shuffle.value) {
    do { idx = Math.floor(Math.random() * len) } while (len > 1 && idx === currentIndex.value)
  }
  else {
    idx = (currentIndex.value + 1) % len
  }
  loadAndPlay(idx, true)
}

function nextTrack() {
  const len = tracks.value?.length ?? 0
  if (!len) return
  let idx: number
  if (shuffle.value) {
    do { idx = Math.floor(Math.random() * len) } while (len > 1 && idx === currentIndex.value)
  }
  else {
    idx = (currentIndex.value + 1) % len
  }
  loadAndPlay(idx, isPlaying.value)
}

let arcRafId: number | null = null
const ARC_DURATION = 500

function startRefreshArc() {
  if (arcRafId !== null) return
  refreshTracks()
  arcActive.value = true
  refreshArcPct.value = 0
  const start = performance.now()
  function tick(now: number) {
    const t = Math.min((now - start) / ARC_DURATION, 1)
    const ratio = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    refreshArcPct.value = ratio * 100
    if (ratio < 1) {
      arcRafId = requestAnimationFrame(tick)
    }
    else {
      arcRafId = null
      arcActive.value = false
      setTimeout(() => { refreshArcPct.value = 0 }, 220)
    }
  }
  arcRafId = requestAnimationFrame(tick)
}

function randomTrack() {
  const len = tracks.value?.length ?? 0
  if (!len) return
  let idx: number
  do { idx = Math.floor(Math.random() * len) } while (len > 1 && idx === currentIndex.value)
  loadAndPlay(idx, true)
}

function seekToLyric(time: number) {
  if (audio && duration.value > 0 && time < duration.value) audio.currentTime = time
}

function toggleMute() {
  if (volume.value > 0) { prevVolume.value = volume.value; volume.value = 0 }
  else volume.value = prevVolume.value || 1
}

function toggleRepeat() {
  repeat.value = repeat.value === 'none' ? 'all' : repeat.value === 'all' ? 'one' : 'none'
}

function seekTo(e: Event) {
  if (!audio) return
  audio.currentTime = parseFloat((e.target as HTMLInputElement).value)
}

function setVolume(e: Event) {
  volume.value = parseFloat((e.target as HTMLInputElement).value)
}

watch(volume, (v) => { if (audio) audio.volume = v })
watch([currentIndex, volume, prevVolume, shuffle, repeat, showVisualizer], saveState)

function updateMediaSession() {
  if (!import.meta.client || !('mediaSession' in navigator)) return
  const track = currentTrack.value
  if (!track) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.name,
    artist: track.artist,
    artwork: track.cover ? [{ src: track.cover }] : [],
  })
}

function setupMediaSessionHandlers() {
  if (!import.meta.client || !('mediaSession' in navigator)) return
  navigator.mediaSession.setActionHandler('play', () => { if (!isPlaying.value) togglePlay() })
  navigator.mediaSession.setActionHandler('pause', () => { if (isPlaying.value) togglePlay() })
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack)
  navigator.mediaSession.setActionHandler('nexttrack', nextTrack)
}

watch(currentTrack, updateMediaSession)
watch(isPlaying, (playing) => {
  if (!import.meta.client || !('mediaSession' in navigator)) return
  navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
})

onMounted(() => {
  audio = new Audio()
  audio.crossOrigin = 'anonymous'

  const saved = loadSavedState()
  if (saved) {
    if (saved.volume !== undefined) volume.value = saved.volume
    if (saved.prevVolume !== undefined) prevVolume.value = saved.prevVolume
    if (saved.shuffle !== undefined) shuffle.value = saved.shuffle
    if (saved.repeat !== undefined) repeat.value = saved.repeat
    if (saved.showVisualizer !== undefined) showVisualizer.value = saved.showVisualizer
  }

  audio.volume = volume.value
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('durationchange', () => { if (audio) duration.value = audio.duration })
  audio.addEventListener('ended', advanceTrack)
  audio.addEventListener('play', () => {
    isPlaying.value = true
    if (audioCtx?.state === 'suspended') audioCtx.resume()
  })
  audio.addEventListener('pause', () => { isPlaying.value = false })

  initAudioContext()

  if (tracks.value?.length) {
    const startIndex = (saved?.currentIndex !== undefined && saved.currentIndex < tracks.value.length)
      ? saved.currentIndex
      : 0
    loadAndPlay(startIndex)
    if (saved?.currentTime && saved.currentTime > 1) {
      audio.addEventListener('loadedmetadata', () => {
        if (audio && saved.currentTime && audio.duration > 0 && saved.currentTime < audio.duration - 2) {
          audio.currentTime = saved.currentTime
        }
      }, { once: true })
    }
  }

  setupMediaSessionHandlers()
  window.addEventListener('beforeunload', saveState)

  keyHandler = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    if (e.code === 'Space') { e.preventDefault(); togglePlay() }
    else if (e.code === 'ArrowRight' && audio) audio.currentTime = Math.min(duration.value, audio.currentTime + 5)
    else if (e.code === 'ArrowLeft' && audio) audio.currentTime = Math.max(0, audio.currentTime - 5)
  }
  window.addEventListener('keydown', keyHandler)
  playerReady.value = true
})

onBeforeUnmount(() => {
  saveState()
  if (audio) { audio.pause(); audio.src = '' }
  audioCtx?.close()
  if (keyHandler) window.removeEventListener('keydown', keyHandler)
  window.removeEventListener('beforeunload', saveState)
  if (arcRafId !== null) cancelAnimationFrame(arcRafId)
  if (import.meta.client && 'mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', null)
    navigator.mediaSession.setActionHandler('pause', null)
    navigator.mediaSession.setActionHandler('previoustrack', null)
    navigator.mediaSession.setActionHandler('nexttrack', null)
  }
})
</script>

<template>
  <div class="fixed inset-0 z-[2]">
    <Teleport to="body">
      <MusicBackground :cover="currentTrack?.cover" />
    </Teleport>
    <div class="fixed inset-0 flex flex-col overflow-hidden text-white font-sans">
    <!-- TEST NAV BUTTON: remove after testing -->
    <NuxtLink
      to="/"
      class="absolute top-4 left-4 z-[100] px-4 py-2 text-sm font-mono rounded-full bg-white/10 border border-white/20"
    >Test → Home</NuxtLink>
    <MusicAudioVisualizer :analyser="audioAnalyser" :is-playing="isPlaying" :visible="showVisualizer" :cover="currentTrack?.cover ?? ''" />

    <MusicDrawerTab
      :is-open="mobileDrawerOpen"
      @toggle="mobileDrawerOpen = !mobileDrawerOpen"
      @close="mobileDrawerOpen = false"
    />

    <!-- Main area: track list + player panel -->
    <div class="relative z-[3] flex flex-1 min-h-0 mt-10 mx-15 max-sm:flex-col max-sm:mt-0 max-sm:mx-0 max-sm:z-auto">
      <MusicTrackList
        :tracks="tracks ?? []"
        :current-index="currentIndex"
        :is-open="mobileDrawerOpen"
        @select="selectTrack"
      />

      <MusicPlayerPanel
        :current-track="currentTrack"
        :is-playing="isPlaying"
        :parsed-lyrics="parsedLyrics"
        :current-lyric-index="currentLyricIndex"
        :arc-active="arcActive"
        :refresh-arc-pct="refreshArcPct"
        :show-visualizer="showVisualizer"
        @toggle-play="togglePlay"
        @seek-to-lyric="seekToLyric"
        @random-track="randomTrack"
        @start-refresh-arc="startRefreshArc"
        @toggle-visualizer="showVisualizer = !showVisualizer"
      />
    </div>

    <MusicControlBar
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      :progress="progress"
      :volume="volume"
      :is-muted="isMuted"
      :shuffle="shuffle"
      :repeat="repeat"
      @prev-track="prevTrack"
      @toggle-play="togglePlay"
      @next-track="nextTrack"
      @seek="seekTo"
      @set-volume="setVolume"
      @toggle-mute="toggleMute"
      @toggle-shuffle="shuffle = !shuffle"
      @toggle-repeat="toggleRepeat"
    />
    </div>
  </div>
</template>
