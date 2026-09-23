<script setup lang="ts">
interface Track {
  name: string
  artist: string
  format: 'mp3' | 'flac'
  url: string
  cover: string
  lrc: string
}

/** One run of lyric text; `ruby` holds its furigana when the line is annotated. */
interface RubySegment {
  text: string
  ruby?: string
}

interface LyricLine {
  time: number
  text: string
  segments?: RubySegment[]
  translation?: string
  translationSegments?: RubySegment[]
}

const props = defineProps<{
  currentTrack: Track | null
  isPlaying: boolean
  parsedLyrics: LyricLine[]
  currentLyricIndex: number
  arcActive: boolean
  refreshArcPct: number
  showVisualizer: boolean
  /** Two-column layout: cover + title on the left, lyrics on the right. */
  immersive: boolean
}>()

const emit = defineEmits<{
  togglePlay: []
  seekToLyric: [time: number]
  randomTrack: []
  startRefreshArc: []
  toggleVisualizer: []
  toggleImmersive: []
}>()

const lyricsContainer = ref<HTMLElement | null>(null)
const coverWrapperEl = ref<HTMLElement | null>(null)
const titleNameEl = ref<HTMLElement | null>(null)
const titleArtistEl = ref<HTMLElement | null>(null)
const titleSepEl = ref<HTMLElement | null>(null)

let scrollRafId: number | null = null

function smoothScrollTo(el: HTMLElement, target: number, duration: number) {
  if (scrollRafId !== null) cancelAnimationFrame(scrollRafId)
  const start = el.scrollTop
  const distance = target - start
  const t0 = performance.now()
  function step(now: number) {
    const t = Math.min((now - t0) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.scrollTop = start + distance * eased
    scrollRafId = t < 1 ? requestAnimationFrame(step) : null
  }
  scrollRafId = requestAnimationFrame(step)
}

/** Scrolls the active lyric to the vertical center; `duration` 0 jumps instantly. Stacked layout only. */
function centerActiveLyric(duration: number) {
  if (props.immersive) return // MusicLyricsWheel positions its own lines
  const container = lyricsContainer.value
  const el = container?.querySelector<HTMLElement>('.lyric-active')
  if (!container || !el) return
  const cr = container.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const target = Math.max(0, container.scrollTop + er.top - cr.top - cr.height / 2 + er.height / 2)
  if (duration > 0) {
    smoothScrollTo(container, target, duration)
  }
  else {
    if (scrollRafId !== null) { cancelAnimationFrame(scrollRafId); scrollRafId = null }
    container.scrollTop = target
  }
}

watch(() => props.currentLyricIndex, () => {
  nextTick(() => centerActiveLyric(700))
})

// ── Layout switch (FLIP) ──────────────────────────────────────────────
// The two layouts differ in grid structure, which CSS can't interpolate. On toggle we record where
// each block is, let the DOM switch, then animate every block from its old box back to its new one.

const LAYOUT_DURATION = 800
const LAYOUT_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
// The old layout's lyrics leave first; everything else (cover/title FLIP, the new lyrics, the track
// list coming back) waits until they're mostly gone, so the two sets of lyrics never overlap.
const STACKED_LYRICS_LEAVE_MS = 300 // entering: the stacked list slides right and fades
const ENTER_WAIT_MS = 240
// Leaving: the wheel's spin-out length depends on the song (MusicLyricsWheel scales it with the lines
// it turns through), so the wait is a fraction of it. Handed to MusicTrackList's re-entry delay too.
const EXIT_WAIT_RATIO = 0.76
const EXIT_WAIT_FALLBACK_MS = 380 // no wheel to ask (e.g. no lyrics)

const flipping = ref(false)
let flipAnims: Animation[] = []

interface Snapshot { el: HTMLElement; rect: DOMRect; font: number; scale: number }

interface FlipFirst {
  cover: Snapshot | null
  coverRadius: number
  name: Snapshot | null
  artist: Snapshot | null
  sep: Snapshot | null
  lyrics: Snapshot | null
}

/** Starting boxes captured on click; consumed by the `immersive` watcher. Null → switch instantly. */
let pendingFirst: FlipFirst | null = null
/** Frozen copy of the old lyrics, animated out on top while the new ones come in. */
let lyricsGhost: HTMLElement | null = null
interface WheelSpinOut { duration: number; run: (copyRoot: HTMLElement) => Promise<void> }
const wheelRef = ref<{ prepareSpinOut: () => WheelSpinOut } | null>(null)
/** How long a newly mounted wheel holds its spin-in (only non-zero right after the user toggles in). */
const wheelEnterDelay = ref(0)
/** Delay before the new layout's motion starts, chosen on click for the watcher. */
let pendingWait = 0
/** Leaving immersive: spins the frozen copy of the wheel out (captured while the wheel still exists). */
let pendingSpinOut: WheelSpinOut | null = null

function removeLyricsGhost() {
  lyricsGhost?.remove()
  lyricsGhost = null
}

/**
 * The lyrics re-flow between layouts (width, alignment, font size), so they can't be FLIP-scaled.
 * A static clone keeps the old rendering on screen at its old spot to cross-fade from.
 */
function createLyricsGhost(src: HTMLElement, panel: HTMLElement): HTMLElement {
  const rect = src.getBoundingClientRect()
  const panelStyle = getComputedStyle(panel)
  // Wrapper carries the panel's classes so the mode-dependent lyric rules still match the clone
  const wrap = document.createElement('div')
  wrap.className = panel.className
  wrap.setAttribute('aria-hidden', 'true')
  Object.assign(wrap.style, {
    position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    display: 'block', padding: '0', margin: '0', overflow: 'visible', pointerEvents: 'none', zIndex: '3',
    fontFamily: panelStyle.fontFamily, color: panelStyle.color,
  })
  const clone = src.cloneNode(true) as HTMLElement
  Object.assign(clone.style, { width: '100%', height: '100%', margin: '0', animation: 'none' })
  wrap.appendChild(clone)
  document.body.appendChild(wrap)
  clone.scrollTop = src.scrollTop
  return wrap
}

function transformScale(el: Element): number {
  const t = getComputedStyle(el).transform
  return t === 'none' ? 1 : new DOMMatrixReadOnly(t).a
}

/** Measured as rendered, in-flight FLIP transforms included, so an interrupted toggle starts from what's on screen. */
function snapshot(el: HTMLElement | null): Snapshot | null {
  if (!el) return null
  const scale = transformScale(el)
  return { el, rect: el.getBoundingClientRect(), font: parseFloat(getComputedStyle(el).fontSize) * scale, scale }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Must run before anything re-renders: the parent patches MusicTrackList (which leaves the flow and
// resizes this panel) before our `immersive` prop updates, so measuring inside the watcher is too late.
function toggleImmersive() {
  const panel = lyricsContainer.value?.parentElement
  pendingWait = 0
  wheelEnterDelay.value = 0
  if (!prefersReducedMotion()) {
    if (props.immersive) {
      pendingSpinOut = wheelRef.value?.prepareSpinOut() ?? null
      pendingWait = pendingSpinOut?.duration
        ? Math.round(pendingSpinOut.duration * EXIT_WAIT_RATIO)
        : EXIT_WAIT_FALLBACK_MS
    }
    else {
      pendingSpinOut = null
      pendingWait = ENTER_WAIT_MS
      wheelEnterDelay.value = ENTER_WAIT_MS
    }
    const cover = snapshot(coverWrapperEl.value)
    const img = coverWrapperEl.value?.querySelector<HTMLElement>('.cover-art')
    pendingFirst = {
      cover,
      coverRadius: img && cover ? parseFloat(getComputedStyle(img).borderTopLeftRadius) * cover.scale : 0,
      name: snapshot(titleNameEl.value),
      artist: snapshot(titleArtistEl.value),
      sep: snapshot(titleSepEl.value),
      lyrics: snapshot(lyricsContainer.value),
    }
    removeLyricsGhost()
    if (lyricsContainer.value && panel) lyricsGhost = createLyricsGhost(lyricsContainer.value, panel)
  }
  // CSS transitions (the artist's color/weight, the track list coming back) start on the class change
  // itself, so their delays have to be in place before the re-render. The track list is a sibling, so
  // its value goes on the shared parent.
  panel?.style.setProperty('--layout-delay', `${pendingWait}ms`)
  panel?.parentElement?.style.setProperty('--layout-exit-wait', `${props.immersive ? pendingWait : 0}ms`)
  flipAnims.forEach(a => a.cancel())
  flipAnims = []
  emit('toggleImmersive')
}

watch(() => props.immersive, async () => {
  const first = pendingFirst
  pendingFirst = null
  const spinOut = pendingSpinOut
  pendingSpinOut = null

  await nextTick()
  centerActiveLyric(0)
  // Not user-initiated (restored state, viewport crossing the mobile breakpoint): no animation
  if (!first) return

  flipping.value = true
  // `backwards` holds each element at its old spot through the delay
  const timing: KeyframeAnimationOptions = {
    duration: LAYOUT_DURATION, easing: LAYOUT_EASING, delay: pendingWait, fill: 'backwards',
  }

  /** Transform that puts an element (now at its new box) back where `from` was on screen. */
  const inverse = (from: Snapshot, scale: number) => {
    const last = from.el.getBoundingClientRect()
    return `translate(${from.rect.left - last.left}px, ${from.rect.top - last.top}px) scale(${scale})`
  }
  const flip = (from: Snapshot | null, scaleOf: (s: Snapshot) => number) => {
    if (!from) return
    flipAnims.push(from.el.animate([
      { transformOrigin: '0 0', transform: inverse(from, scaleOf(from)) },
      { transformOrigin: '0 0', transform: 'none' },
    ], timing))
  }
  const fontScale = (s: Snapshot) => s.font / parseFloat(getComputedStyle(s.el).fontSize)

  if (first.cover) {
    const coverScale = first.cover.rect.width / first.cover.el.getBoundingClientRect().width
    flip(first.cover, () => coverScale)
    // Radius is drawn inside the scaled box, so counter-scale it to keep the corners continuous
    const img = first.cover.el.querySelector<HTMLElement>('.cover-art')
    if (img) {
      flipAnims.push(img.animate([
        { borderRadius: `${first.coverRadius / coverScale}px` },
        { borderRadius: getComputedStyle(img).borderTopLeftRadius },
      ], timing))
    }
  }
  if (first.artist) {
    // Its truncation width lives inside the scaled box too: start from the on-screen width, un-scaled.
    // Started before any "last" is measured — in the centered stacked layout it shifts the whole line.
    const artist = first.artist
    const scale = fontScale(artist)
    flipAnims.push(artist.el.animate([
      { maxWidth: `${artist.rect.width / scale}px` },
      { maxWidth: getComputedStyle(artist.el).maxWidth },
    ], timing))
    flip(artist, () => scale)
  }
  flip(first.name, fontScale)

  // The " - " separator only exists in the stacked layout: fade it out where it was, or fade it in late
  if (first.sep) {
    const sep = first.sep
    flipAnims.push(props.immersive
      ? sep.el.animate([
          { opacity: 1, transformOrigin: '0 0', transform: inverse(sep, fontScale(sep)) },
          { opacity: 0, transformOrigin: '0 0', transform: inverse(sep, fontScale(sep)) },
        ], { duration: 220, easing: 'ease-out' })
      // Back in the stacked layout it only fades in once the name and artist have settled either side
      // of it (the layout curve is ~98% there by 75% of its duration)
      : sep.el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300, easing: 'ease-out', delay: pendingWait + LAYOUT_DURATION * 0.75, fill: 'backwards',
        }))
  }

  // Lyrics re-flow between layouts, so they cross-fade rather than FLIP: a frozen copy of the old
  // lyrics fades out on top while the new ones come in.
  const ghost = lyricsGhost
  if (first.lyrics && ghost) {
    const done = () => { if (lyricsGhost === ghost) removeLyricsGhost() }
    if (props.immersive) {
      // Entering: the old list slips slightly right and fades; MusicLyricsWheel spins its lines in.
      // Gentler start than the layout curve so the fade reads as a fade, not a cut.
      ghost.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(3rem)' }],
        { duration: STACKED_LYRICS_LEAVE_MS, easing: 'cubic-bezier(0.33, 0, 0.2, 1)', fill: 'forwards' },
      ).finished.then(done).catch(() => {})
    }
    else {
      // Leaving: the frozen wheel keeps turning counter-clockwise until its lines exit through the top,
      // while the stacked list drifts in from the wheel's side
      const last = first.lyrics.el.getBoundingClientRect()
      const r = first.lyrics.rect
      const dx = (r.left + r.width / 2 - (last.left + last.width / 2)) * 0.35
      const dy = (r.top + r.height / 2 - (last.top + last.height / 2)) * 0.35
      flipAnims.push(first.lyrics.el.animate([
        { opacity: 0, transform: `translate(${dx}px, ${dy}px)` },
        { opacity: 1, transform: 'none' },
      ], timing))
      const copyRoot = ghost.querySelector<HTMLElement>('.wheel')
      if (spinOut && copyRoot) spinOut.run(copyRoot).then(done)
      else done()
    }
  }
  else {
    removeLyricsGhost()
  }

  const running = flipAnims
  Promise.all(running.map(a => a.finished)).then(() => {
    if (flipAnims === running) flipping.value = false
  }).catch(() => { /* cancelled by a newer toggle */ })
})

onBeforeUnmount(() => {
  flipAnims.forEach(a => a.cancel())
  removeLyricsGhost()
  if (scrollRafId !== null) cancelAnimationFrame(scrollRafId)
})
</script>

<template>
  <div class="player-panel" :class="{ 'is-immersive': immersive, 'is-flipping': flipping }">
    <!-- Cover art -->
    <div class="cover-section flex flex-shrink-0 items-start justify-center mb-[1.1rem]">
      <div ref="coverWrapperEl" class="cover-wrapper" @click="emit('togglePlay')">
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
      <template v-if="currentTrack">
        <span ref="titleNameEl" class="title-name">{{ currentTrack.name }}</span><span ref="titleSepEl" class="title-sep">&nbsp;-&nbsp;</span><span ref="titleArtistEl" class="title-artist" :title="currentTrack.artist">{{ currentTrack.artist }}</span>
      </template>
      <template v-else>
        ...
      </template>
    </h2>

    <!-- Lyrics -->
    <div ref="lyricsContainer" class="lyrics-area">
      <MusicLyricsWheel
        v-if="immersive"
        ref="wheelRef"
        :enter-delay="wheelEnterDelay"
        :lyrics="parsedLyrics"
        :current-index="currentLyricIndex"
        @seek="(time: number) => emit('seekToLyric', time)"
      />
      <template v-else>
        <div class="lyrics-pad" />
        <template v-if="parsedLyrics.length">
          <div
            v-for="(line, i) in parsedLyrics"
            :key="i"
            class="lyric-line"
            :class="{ 'lyric-active': i === currentLyricIndex }"
            @click="emit('seekToLyric', line.time)"
          >
            <p class="lyric-text" :class="{ 'has-ruby': line.segments }">
              <template v-if="line.segments">
                <template v-for="(seg, si) in line.segments" :key="si"><ruby v-if="seg.ruby">{{ seg.text }}<rp>(</rp><rt>{{ seg.ruby }}</rt><rp>)</rp></ruby><template v-else>{{ seg.text }}</template></template>
              </template>
              <template v-else>{{ line.text }}</template>
            </p>
            <p v-if="line.translation" class="lyric-translation" :class="{ 'has-ruby': line.translationSegments }">
              <template v-if="line.translationSegments">
                <template v-for="(seg, si) in line.translationSegments" :key="si"><ruby v-if="seg.ruby">{{ seg.text }}<rp>(</rp><rt>{{ seg.ruby }}</rt><rp>)</rp></ruby><template v-else>{{ seg.text }}</template></template>
              </template>
              <template v-else>{{ line.translation }}</template>
            </p>
          </div>
        </template>
        <p v-else class="text-center text-[2rem] my-8" style="color: rgba(255,255,255,.18)">
          ♪
        </p>
        <div class="lyrics-pad" />
      </template>
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
      <button
        class="mode-btn mode-btn--immersive"
        :class="{ 'mode-btn--on': immersive }"
        :title="immersive ? 'Exit immersive view' : 'Immersive view'"
        @click="toggleImmersive"
      >
        <Icon v-if="immersive" name="mdi:arrow-collapse" />
        <Icon v-else name="mdi:arrow-expand" />
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
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto minmax(0, 1fr);
  grid-template-areas:
    "cover"
    "title"
    "lyrics";
  padding: 1.5rem 1.75rem 1rem;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* While blocks FLIP across the panel their old boxes can sit outside it (the track list re-enters the flow) */
.player-panel.is-flipping { overflow: visible; }

.cover-section {
  grid-area: cover;
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 150ms backwards;
}

.track-title {
  grid-area: title;
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 300ms backwards;
}

.lyrics-area {
  grid-area: lyrics;
  animation: element-slide-in 480ms cubic-bezier(0.1, 0.9, 0.2, 1) 450ms backwards;
}

.track-title { position: relative; }

/* inline-block so the FLIP transforms apply to each part of the title */
.title-name,
.title-sep,
.title-artist {
  display: inline-block;
  max-width: 100%;
  vertical-align: top;
  /* Google Sans Flex has an opsz axis: glyphs change shape between sizes, so a FLIP-scaled title
     wouldn't match its real rendering at either end. A fixed optical size keeps the switch seamless. */
  font-optical-sizing: none;
  /* Re-declared so it tracks each span's own size; inherited from h2 it would be a fixed px value */
  letter-spacing: 0.01em;
}

/* Truncated in CSS (not by slicing the string) so the full name can slide open when the layout switches */
.title-artist {
  max-width: 10ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* max-width is animated by the FLIP (it needs the scale compensation) */
  transition:
    color 800ms cubic-bezier(0.32, 0.72, 0, 1),
    font-weight 800ms cubic-bezier(0.32, 0.72, 0, 1);
  transition-delay: var(--layout-delay, 0ms);
}

/* ── Immersive layout ─────────────────────────────────────────────── */
.player-panel.is-immersive {
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  grid-template-rows: 1fr auto auto 1fr;
  grid-template-areas:
    ".     lyrics"
    "cover lyrics"
    "title lyrics"
    ".     lyrics";
  column-gap: 4rem;
  padding: 1.5rem 3rem 1rem 8rem;
}

.player-panel.is-immersive .cover-section {
  justify-content: flex-start;
  margin-bottom: 2rem;
}

.player-panel.is-immersive .cover-art {
  width: min(24vw, 42vh, 340px);
  height: min(24vw, 42vh, 340px);
  border-radius: 16px;
  box-shadow: 0 18px 60px rgba(0,0,0,.55);
}

.player-panel.is-immersive .track-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  text-align: left;
  font-size: 2.75rem;
  line-height: 1.15;
  margin-bottom: 0;
}

/* Kept in the DOM (out of flow, invisible) so it can fade out from where it was */
.player-panel.is-immersive .title-sep {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}

.player-panel.is-immersive .title-artist {
  max-width: 100%;
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(255,255,255,.55);
}

.player-panel.is-immersive .lyrics-area {
  margin: 0;
  padding-right: 0;
  overflow: hidden;
  /* The drum fades its own far lines; only soften the very edges */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
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

/* Sized relative to the cover (76px / 30px / 42px at 220px) so it scales with it during the layout FLIP */
.cover-overlay-btn.is-paused {
  top: 50%;
  left: 50%;
  width: 34.5%;
  height: 34.5%;
  transform: translate(-50%, -50%);
  opacity: 0.7;
}

.cover-overlay-btn.is-playing {
  top: 81%;
  left: 81%;
  width: 13.6%;
  height: 13.6%;
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

/* Japanese furigana: `{base|reading}` groups in the .lrc become <ruby>/<rt> */
.lyric-text ruby,
.lyric-translation ruby {
  ruby-position: over;
  ruby-align: center;
}

.lyric-text rt,
.lyric-translation rt {
  font-size: 0.5em;
  font-weight: inherit;
  line-height: 1.25;
  letter-spacing: 0.02em;
  opacity: 0.8;
  user-select: none;
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

  /* Immersive view is desktop-only */
  .mode-btn--immersive { display: none; }
}
</style>
