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

const props = defineProps<{
  currentTrack: Track | null
  isPlaying: boolean
  parsedLyrics: LyricLine[]
  currentLyricIndex: number
  arcActive: boolean
  refreshArcPct: number
  showVisualizer: boolean
}>()

const emit = defineEmits<{
  togglePlay: []
  seekToLyric: [time: number]
  randomTrack: []
  startRefreshArc: []
  toggleVisualizer: []
}>()

const lyricsContainer = ref<HTMLElement | null>(null)

function smoothScrollTo(el: HTMLElement, target: number, duration: number) {
  const start = el.scrollTop
  const distance = target - start
  const t0 = performance.now()
  function step(now: number) {
    const t = Math.min((now - t0) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.scrollTop = start + distance * eased
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(() => props.currentLyricIndex, () => {
  nextTick(() => {
    const container = lyricsContainer.value
    const el = container?.querySelector<HTMLElement>('.lyric-active')
    if (!container || !el) return
    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    const target = container.scrollTop + er.top - cr.top - cr.height / 2 + er.height / 2
    smoothScrollTo(container, Math.max(0, target), 700)
  })
})
</script>

<template>
  <div class="player-panel">
    <!-- Cover art -->
    <div class="cover-section flex flex-shrink-0 items-start justify-center mb-[1.1rem]">
      <div class="cover-wrapper" @click="emit('togglePlay')">
        <img
          v-if="currentTrack?.cover"
          :src="currentTrack.cover"
          :alt="currentTrack.name"
          class="cover-art"
          draggable="false"
        >
        <div v-else class="cover-art cover-art--empty" />
        <button
          class="cover-overlay-btn"
          :class="isPlaying ? 'is-playing' : 'is-paused'"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click.stop="emit('togglePlay')"
        >
          <svg v-if="!isPlaying" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <circle cx="18" cy="18" r="16.5" fill="rgba(0,0,0,0.4)" stroke="white" stroke-width="1.5" />
            <polygon points="14,10 14,26 27,18" fill="white" />
          </svg>
          <svg v-else viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <circle cx="18" cy="18" r="16.5" fill="rgba(0,0,0,0.4)" stroke="white" stroke-width="1.5" />
            <rect x="11" y="10.5" width="4.5" height="15" rx="1.2" fill="white" />
            <rect x="20.5" y="10.5" width="4.5" height="15" rx="1.2" fill="white" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Track title -->
    <h2 class="track-title flex-shrink-0 text-center text-white font-bold mb-[0.85rem] tracking-[0.01em] text-[1.8rem] max-sm:text-[1.1rem]">
      {{ currentTrack ? `${currentTrack.name} - ${currentTrack.artist}` : '...' }}
    </h2>

    <!-- Lyrics -->
    <div ref="lyricsContainer" class="lyrics-area">
      <div class="lyrics-pad" />
      <template v-if="parsedLyrics.length">
        <div
          v-for="(line, i) in parsedLyrics"
          :key="i"
          class="lyric-line"
          :class="{ 'lyric-active': i === currentLyricIndex }"
          @click="emit('seekToLyric', line.time)"
        >
          <p class="lyric-text">{{ line.text }}</p>
          <p v-if="line.translation" class="lyric-translation">{{ line.translation }}</p>
        </div>
      </template>
      <p v-else class="text-center text-[2rem] my-8" style="color: rgba(255,255,255,.18)">
        ♪
      </p>
      <div class="lyrics-pad" />
    </div>

    <!-- Mode buttons -->
    <div class="absolute bottom-4 right-[1.75rem] flex gap-[0.6rem] z-[1] max-sm:bottom-2 max-sm:right-4">
      <button class="mode-btn" title="Random track" @click="emit('randomTrack')">
        <Icon name="mdi:dice-multiple" />
      </button>
      <button
        class="mode-btn"
        :class="{ 'arc-active': arcActive }"
        :style="{ '--arc-pct': `${refreshArcPct.toFixed(2)}%` }"
        title="Refresh playlist"
        @click="emit('startRefreshArc')"
      >
        <Icon name="mdi:refresh" />
      </button>
      <button
        class="mode-btn"
        :class="{ 'mode-btn--on': showVisualizer }"
        :title="showVisualizer ? 'Hide visualizer' : 'Show visualizer'"
        @click="emit('toggleVisualizer')"
      >
        <Icon name="mdi:waveform" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes element-slide-in {
  from {
    opacity: 0;
    transform: translateX(2.5rem);
  }
}

.player-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.75rem 1rem;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.cover-section {
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 150ms backwards;
}

.track-title {
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 300ms backwards;
}

.lyrics-area {
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 450ms backwards;
}

.cover-art {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
  flex-shrink: 0;
  -webkit-user-drag: none;
  user-select: none;
}

.cover-art--empty {
  background: rgba(255,255,255,.05);
}

.cover-wrapper {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  cursor: pointer;
}

/* Animated play/pause button that repositions based on state */
.cover-overlay-btn {
  position: absolute;
  border: none;
  cursor: pointer;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  outline: none;
  z-index: 2;
  transition:
    top 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    left 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    width 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    height 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 0.1s ease;
}

.cover-overlay-btn.is-paused {
  top: 50%;
  left: 50%;
  width: 76px;
  height: 76px;
  transform: translate(-50%, -50%);
  opacity: 0.7;
}

.cover-overlay-btn.is-playing {
  top: calc(100% - 42px);
  left: calc(100% - 42px);
  width: 30px;
  height: 30px;
  transform: translate(0, 0);
  opacity: 0.52;
}

@media (hover: hover) {
  .cover-wrapper:hover .cover-overlay-btn {
    opacity: 1;
  }
}

/* Lyrics scroll area */
.lyrics-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-right: .25rem;
  margin: 0.2rem 0;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
}

.lyrics-area::-webkit-scrollbar { display: none; }

.lyrics-pad { height: 35%; flex-shrink: 0; }

.lyric-line {
  text-align: center;
  font-size: 1rem;
  margin: 0;
  padding: 0.15rem 0;
  transition: font-size .5s;
  cursor: pointer;
  user-select: none;
}

.lyric-text {
  line-height: 1.8;
  margin: 0;
  color: rgba(255,255,255,.35);
  transition: color .3s, font-weight .3s;
}

.lyric-translation {
  line-height: 1.4;
  font-size: 0.78em;
  margin: 0;
  margin-bottom: 0.3em;
  color: rgba(255,255,255,.35);
  opacity: 0.55;
  letter-spacing: 0.01em;
  transition: color .3s, opacity .3s;
}

@media (hover: hover) {
  .lyric-line:hover .lyric-text { color: rgba(255,255,255,.6); }
  .lyric-line:hover .lyric-translation { opacity: 0.75; }
}

.lyric-line.lyric-active {
  font-size: 1.14rem;
}

.lyric-line.lyric-active .lyric-text {
  color: #fff;
  font-weight: 700;
}

.lyric-line.lyric-active .lyric-translation {
  color: #fff;
  opacity: 0.7;
  font-weight: 400;
}

/* Refresh arc button: conic-gradient ::before ring */
.mode-btn {
  position: relative;
  isolation: isolate;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  border: none;
  color: rgba(255,255,255,.55);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: background .2s, color .2s;
}

@media (hover: hover) {
  .mode-btn:hover { background: rgba(255,255,255,.22); color: #fff; }
}
.mode-btn--on { background: rgba(255,255,255,.22); color: #fff; }

.mode-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: conic-gradient(
    from 0deg,
    rgba(255,255,255,.9) var(--arc-pct, 0%),
    transparent var(--arc-pct, 0%)
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.mode-btn.arc-active::before { opacity: 1; }

@media (max-width: 640px) {
  .player-panel {
    flex: 1;
    max-height: none;
    padding: 2.5rem 1.25rem .5rem;
    z-index: 2;
  }

  .cover-art { width: 160px; height: 160px; }

  .cover-overlay-btn.is-paused { width: 52px; height: 52px; }
  .cover-overlay-btn.is-playing {
    width: 28px;
    height: 28px;
    top: calc(100% - 34px);
    left: calc(100% - 34px);
  }

  .mode-btn { width: 36px; height: 36px; font-size: 1.1rem; }
}
</style>
