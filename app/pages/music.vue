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
let keyHandler: ((e: KeyboardEvent) => void) | null = null

const currentTrack = computed(() => tracks.value?.[currentIndex.value] ?? null)
const progress = computed(() =>
  duration.value > 0 ? currentTime.value / duration.value : 0,
)
const isMuted = computed(() => volume.value === 0)

function parseLrc(text: string): LyricLine[] {
  const result: LyricLine[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/\[(\d{1,3}):(\d{2})\.(\d{2,3})\](.*)/)
    if (!m) continue
    const time = Number(m[1]) * 60 + Number(m[2]) + parseInt(m[3]!.padEnd(3, '0')) / 1000
    const txt = m[4]!.trim()
    result.push({ time, text: txt })
  }
  return result.sort((a, b) => a.time - b.time)
}

async function loadLyrics(lrcUrl: string) {
  parsedLyrics.value = []
  currentLyricIndex.value = -1
  if (!lrcUrl) return
  try {
    const text = await $fetch<string>(lrcUrl, { responseType: 'text' })
    parsedLyrics.value = parseLrc(text)
  }
  catch { /* no lyrics available */ }
}

function onTimeUpdate() {
  if (!audio) return
  currentTime.value = audio.currentTime

  const lyrics = parsedLyrics.value
  if (!lyrics.length) return

  let idx = -1
  for (let i = 0; i < lyrics.length; i++) {
    if ((lyrics[i]?.time ?? Infinity) <= audio.currentTime) idx = i
    else break
  }

  if (idx !== currentLyricIndex.value) {
    currentLyricIndex.value = idx
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

function togglePlay() {
  if (!audio) return
  if (isPlaying.value) audio.pause()
  else audio.play().catch(() => {})
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
  if (idx === 0 && repeat.value === 'none' && !shuffle.value) {
    loadAndPlay(idx, false)
  }
  else {
    loadAndPlay(idx, isPlaying.value)
  }
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

onMounted(() => {
  audio = new Audio()
  audio.volume = volume.value
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('durationchange', () => { if (audio) duration.value = audio.duration })
  audio.addEventListener('ended', advanceTrack)
  audio.addEventListener('play', () => { isPlaying.value = true })
  audio.addEventListener('pause', () => { isPlaying.value = false })

  if (tracks.value?.length) loadAndPlay(0)

  keyHandler = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    if (e.code === 'Space') { e.preventDefault(); togglePlay() }
    else if (e.code === 'ArrowRight' && audio) audio.currentTime = Math.min(duration.value, audio.currentTime + 5)
    else if (e.code === 'ArrowLeft' && audio) audio.currentTime = Math.max(0, audio.currentTime - 5)
  }
  window.addEventListener('keydown', keyHandler)
})

onBeforeUnmount(() => {
  if (audio) { audio.pause(); audio.src = '' }
  if (keyHandler) window.removeEventListener('keydown', keyHandler)
  if (arcRafId !== null) cancelAnimationFrame(arcRafId)
})
</script>

<template>
  <div class="fixed inset-0 flex flex-col overflow-hidden text-white bg-[#111] font-sans">
    <MusicBackground :cover="currentTrack?.cover" />

    <MusicDrawerTab
      :is-open="mobileDrawerOpen"
      @toggle="mobileDrawerOpen = !mobileDrawerOpen"
      @close="mobileDrawerOpen = false"
    />

    <!-- Main area: track list + player panel -->
    <div class="relative z-[2] flex flex-1 min-h-0 mt-10 mx-15 max-sm:flex-col max-sm:mt-0 max-sm:mx-0 max-sm:z-auto">
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
        @toggle-play="togglePlay"
        @seek-to-lyric="seekToLyric"
        @random-track="randomTrack"
        @start-refresh-arc="startRefreshArc"
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
</template>
