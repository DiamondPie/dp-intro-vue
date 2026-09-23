<script setup lang="ts">
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
  lyrics: LyricLine[]
  currentIndex: number
  /** While paused, a manually scrolled rim is left where the user put it. */
  isPlaying: boolean
  /** Hold the first entrance this long (ms), e.g. until the previous layout's lyrics have left. */
  enterDelay?: number
}>()

const emit = defineEmits<{
  seek: [time: number]
}>()

// Lyrics laid out flat along the rim of a large wheel whose hub sits far to the left of the column.
// Each line sits at an arc distance `u` from the rightmost point of the rim and is turned with it, so
// lines above tilt up to the right, lines below tilt down, and both curve back to the left. Nothing
// folds into the screen: it's a 2D arc plus shrink/blur/fade with distance. The wheel's rotation is
// `pos`, driven by a critically damped spring. Styles are written straight to the line elements every
// frame — no reactive state per frame.

const LINE_GAP = 14 // px between lines, measured along the rim
const RADIUS_RATIO = 0.9 // rim radius relative to the wheel's height
const TILT = 0.6 // fraction of a line's angle on the rim applied as its own rotation
const SHRINK = 0.35 // scale lost per radian away from the front
const ACTIVE_SCALE = 0.08 // extra scale at the front
const FADE_START = 0.28 // rad: lines start fading past this angle…
const FADE_END = 0.55 // …and are gone here (the rim at this angle is roughly the wheel's top/bottom edge)
const HIDE_ANGLE = 0.6 // rad: past this, lines are not rendered at all
const BLUR_START = 0.06 // rad
const BLUR_PER_RAD = 7 // px of blur per radian past BLUR_START
const BLUR_MAX = 3.5
const SPRING_OMEGA = 8 // rad/s; critically damped, settles in ~0.7s
// Entrance spins the whole song in counter-clockwise from its first line, so it can travel far:
// base duration plus a bit per radian travelled, capped.
const ENTER_BASE_MS = 900
const ENTER_MS_PER_RAD = 120
const ENTER_MAX_EXTRA_MS = 600

// Spin-out (leaving the layout, or the old song on a track change) turns the rim through the lines on
// screen plus a tail of what follows; its duration scales with the distance, within bounds.
const SPIN_OUT_TAIL_RATIO = 0.4 // tail = 40% of the song's lines, rounded down…
const SPIN_OUT_MIN_TAIL = 8 // …but at least this many
interface SpinOutTiming { minMs: number; msPerRad: number; maxMs: number }
interface SpinOut {
  /** Total length of the spin, so callers can start the next thing when it's mostly done. */
  duration: number
  run: (copyRoot: HTMLElement) => Promise<void>
}
const LAYOUT_SPIN_OUT: SpinOutTiming = { minMs: 500, msPerRad: 240, maxMs: 1100 }
const TRACK_SPIN_OUT: SpinOutTiming = { minMs: 350, msPerRad: 180, maxMs: 900 } // faster on a track change
const TRACK_ENTER_AT = 0.63 // the new song starts spinning in at this fraction of the old one's spin-out
const USER_SCROLL_HOLD = 2500 // ms before a manual wheel scroll springs back to the active line

const rootEl = ref<HTMLElement | null>(null)
/** Holds frozen copies of the previous song while they spin out; has no Vue children of its own. */
const leavingEl = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)

let lineEls: HTMLElement[] = []
let heights: number[] = []
let centers: number[] = []
let radius = 300
let measuredSize = ''

let pos = 0
let vel = 0
let target = 0
let userOffset = 0
let rafId: number | null = null
let lastFrame = 0
/** Timed entrance in progress; the spring takes over once it ends. */
let entrance: { from: number; start: number; duration: number } | null = null
let userTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function measure() {
  const root = rootEl.value
  if (!root) return
  // Scoped to the live stage: `.wheel-leaving` may hold copies of the previous song's lines
  lineEls = [...(stageEl.value?.querySelectorAll<HTMLElement>('.wheel-line') ?? [])]
  // offsetHeight ignores transforms, so this is the flat layout height of each line
  heights = lineEls.map(el => el.offsetHeight)
  centers = []
  let acc = 0
  heights.forEach((h, i) => {
    if (i > 0) acc += LINE_GAP
    centers.push(acc + h / 2)
    acc += h
  })
  radius = Math.max(160, root.clientHeight * RADIUS_RATIO)
  // Room on the left for the arc: the front line sits this far in, visible lines bend back toward 0
  root.style.setProperty('--arc-room', `${(radius * (1 - Math.cos(FADE_END))).toFixed(1)}px`)
  measuredSize = `${root.clientWidth}x${root.clientHeight}`
}

/**
 * The line treated as current. Before the first timestamp (`currentIndex` -1) the first line counts
 * as current, as if it started at 0:00 — otherwise the rim would sit with nothing at the front.
 */
const activeIndex = computed(() => props.lyrics.length ? Math.max(0, props.currentIndex) : -1)

/** Arc position that should face the viewer for the current line. */
function baseTarget(): number {
  if (!centers.length) return 0
  return centers[Math.min(Math.max(0, activeIndex.value), centers.length - 1)]!
}

/**
 * Places `els` on the rim for rotation `at`. Pure over its arguments so it can also drive the
 * frozen copy that spins out after this component is gone (see `prepareSpinOut`).
 */
function placeLines(els: HTMLElement[], hs: number[], cs: number[], r: number, at: number) {
  for (let i = 0; i < els.length; i++) {
    const el = els[i]!
    const h = hs[i]!
    const u = cs[i]! - at
    const theta = u / r
    const a = Math.abs(theta)
    if (a > HIDE_ANGLE) {
      el.style.visibility = 'hidden'
      continue
    }
    // Point on the rim, relative to the rim's rightmost point
    const x = -r * (1 - Math.cos(theta))
    const y = r * Math.sin(theta)
    const emphasis = Math.max(0, 1 - Math.abs(u) / (h + LINE_GAP))
    const scale = (1 - SHRINK * a) * (1 + ACTIVE_SCALE * emphasis)
    const fade = Math.min(1, Math.max(0, 1 - (a - FADE_START) / (FADE_END - FADE_START)))
    const blur = Math.min(BLUR_MAX, Math.max(0, (a - BLUR_START) * BLUR_PER_RAD))
    el.style.visibility = 'visible' // not '' — the stylesheet hides lines until they're first placed
    el.style.transform = `translate(${x.toFixed(2)}px, ${(y - h / 2).toFixed(2)}px) rotate(${(theta * TILT).toFixed(4)}rad) scale(${scale.toFixed(4)})`
    el.style.opacity = fade.toFixed(3)
    el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''
    el.style.pointerEvents = fade > 0.3 ? '' : 'none'
  }
}

function render() {
  placeLines(lineEls, heights, centers, radius, pos)
}

const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4)
const easeInQuad = (p: number) => p * p

function tick(now: number) {
  const dt = Math.min(0.034, (now - lastFrame) / 1000)
  lastFrame = now
  const goal = target + userOffset

  if (entrance) {
    // Tween toward the live goal, so a line change mid-entrance is simply absorbed
    const p = Math.min(1, Math.max(0, (now - entrance.start) / entrance.duration))
    pos = entrance.from + (goal - entrance.from) * easeOutQuart(p)
    vel = 0
    render()
    if (p < 1) {
      rafId = requestAnimationFrame(tick)
      return
    }
    entrance = null
  }

  const acc = -SPRING_OMEGA * SPRING_OMEGA * (pos - goal) - 2 * SPRING_OMEGA * vel
  vel += acc * dt
  pos += vel * dt
  if (Math.abs(pos - goal) < 0.05 && Math.abs(vel) < 0.05) {
    pos = goal
    vel = 0
    render()
    rafId = null
    return
  }
  render()
  rafId = requestAnimationFrame(tick)
}

/** Starts the spring toward `target + userOffset`, or jumps there when motion is reduced. */
function settle() {
  if (prefersReducedMotion()) {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    pos = target + userOffset
    vel = 0
    render()
    return
  }
  if (rafId === null) {
    lastFrame = performance.now()
    rafId = requestAnimationFrame(tick)
  }
}

/**
 * Re-measures, then spins the whole song in counter-clockwise: the rim starts empty with the first
 * line just below the visible arc, and every line up to the current one rolls up through view.
 */
function enterFromStart(delay = 0) {
  measure()
  target = baseTarget()
  userOffset = 0
  vel = 0
  if (!centers.length || prefersReducedMotion()) {
    entrance = null
    pos = target
    render()
    return
  }
  pos = centers[0]! - HIDE_ANGLE * radius - 1
  const travel = (target - pos) / radius
  entrance = {
    from: pos,
    start: performance.now() + delay, // progress clamps to 0 until then, so the rim stays empty
    duration: ENTER_BASE_MS + Math.min(ENTER_MAX_EXTRA_MS, travel * ENTER_MS_PER_RAD),
  }
  render()
  if (rafId === null) {
    lastFrame = performance.now()
    rafId = requestAnimationFrame(tick)
  }
}

/**
 * Captures the wheel as it is now and returns a function that spins a frozen copy of it
 * counter-clockwise until every line has left through the top; the copy's lines are matched to ours
 * by order. Used when leaving the immersive layout (the copy outlives this component) and when the
 * track changes (the copy spins out while the new song's lines spin in).
 */
function prepareSpinOut(timing: SpinOutTiming = LAYOUT_SPIN_OUT): SpinOut {
  const hs = heights
  const cs = centers
  const r = radius
  const from = pos
  if (!cs.length || prefersReducedMotion()) return { duration: 0, run: () => Promise.resolve() }

  // Lines taking part: everything on screen now, plus a tail of the following lines so the rim keeps
  // bringing lyrics up from below as it turns. The tail is 40% of the song (at least SPIN_OUT_MIN_TAIL
  // lines) to keep long songs from spinning for ages. Lines past the tail stay hidden, so the rim is
  // empty by the time the copy is removed.
  let current = 0 // the line nearest the front — `currentIndex` may already belong to the next track
  cs.forEach((c, i) => { if (Math.abs(c - from) < Math.abs(cs[current]! - from)) current = i })
  const onScreen = cs.map((_, i) => i).filter(i => Math.abs((cs[i]! - from) / r) <= HIDE_ANGLE)
  const tail = Math.max(SPIN_OUT_MIN_TAIL, Math.floor(cs.length * SPIN_OUT_TAIL_RATIO))
  const first = onScreen[0] ?? current
  const last = Math.min(cs.length - 1, Math.max(current + tail, onScreen.at(-1) ?? current))
  const to = cs[last]! + HIDE_ANGLE * r // the tail's last line ends up past the top
  const duration = Math.min(timing.maxMs, Math.max(timing.minMs, ((to - from) / r) * timing.msPerRad))
  const indices = Array.from({ length: last - first + 1 }, (_, k) => first + k)

  const run = (copyRoot: HTMLElement) => {
    // Either a copy of the stage itself, or of the whole wheel — then only its live stage, not any
    // track-change copies it happens to contain
    const stage = copyRoot.classList.contains('wheel-stage')
      ? copyRoot
      : copyRoot.querySelector<HTMLElement>(':scope > .wheel-stage')
    const all = [...(stage?.querySelectorAll<HTMLElement>(':scope > .wheel-line') ?? [])]
    const els = indices.map(i => all[i]).filter((el): el is HTMLElement => !!el)
    if (!els.length) return Promise.resolve()
    const subHs = indices.map(i => hs[i]!)
    const subCs = indices.map(i => cs[i]!)
    return new Promise<void>((resolve) => {
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        placeLines(els, subHs, subCs, r, from + (to - from) * easeInQuad(p))
        if (p < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }
  return { duration, run }
}

defineExpose({ prepareSpinOut })

/**
 * (Re)starts the countdown back to the current line after the user moved the rim. Only while
 * playing: when paused, whatever the user scrolled to stays put until playback resumes.
 */
function scheduleReturn() {
  if (userTimer) { clearTimeout(userTimer); userTimer = null }
  if (!props.isPlaying) return
  userTimer = setTimeout(() => {
    userTimer = null
    userOffset = 0
    settle()
  }, USER_SCROLL_HOLD)
}

watch(() => props.isPlaying, (playing) => {
  if (!playing) {
    if (userTimer) { clearTimeout(userTimer); userTimer = null }
  }
  else if (userOffset) {
    scheduleReturn()
  }
})

function onWheel(e: WheelEvent) {
  if (!centers.length) return
  entrance = null
  const min = centers[0]! - target
  const max = centers[centers.length - 1]! - target
  userOffset = Math.min(max, Math.max(min, userOffset + e.deltaY))
  settle()
  scheduleReturn()
}

// `userOffset` is relative to the current line. When the current line moves while the user has the
// rim scrolled away, fold the move into the offset so the view they're looking at stays put —
// otherwise a click on a scrolled-to line would add the offset on top of that line and overshoot.
watch(activeIndex, () => {
  const previous = target
  target = baseTarget()
  if (userOffset) userOffset -= target - previous
  settle()
})

/** Clicking a line: aim the rim at it now (no jump back first), then seek; the index catches up. */
function onLineClick(i: number, time: number) {
  if (centers[i] !== undefined) userOffset = centers[i]! - target
  // Normally the offset is back to 0 once the index reaches this line; if the seek lands on a
  // different line (e.g. shared timestamps), still return to the real current line eventually
  scheduleReturn()
  entrance = null
  settle()
  emit('seek', i === 0 ? 0 : time) // the first line counts as starting at 0:00
}

/** When the new song may start spinning in: once the previous one's spin-out is mostly done. */
let trackEnterAt = -Infinity

/**
 * Freezes the old song's lines into a copy (in `leavingEl`, which Vue never renders into) and spins
 * it out. Must run before the DOM update, while the elements still show the old song.
 */
function spinOutOldTrack() {
  const stage = stageEl.value
  const holder = leavingEl.value
  if (!stage || !holder || !lineEls.length) return
  const spin = prepareSpinOut(TRACK_SPIN_OUT)
  const copy = stage.cloneNode(true) as HTMLElement
  copy.setAttribute('aria-hidden', 'true')
  holder.appendChild(copy)
  trackEnterAt = performance.now() + spin.duration * TRACK_ENTER_AT
  spin.run(copy).then(() => copy.remove())
}

// New track: the old song spins out counter-clockwise, then the new one spins in from its first
// line. Runs pre-flush (before the DOM is patched to the new lines). The player briefly clears the
// lyrics while the new file loads, so this may fire twice — old → [] → new — and the new song's
// wait is measured from when the old one started leaving.
watch(() => props.lyrics, (_, prev) => {
  if (prev?.length) spinOutOldTrack()
  nextTick(() => {
    const wait = Math.max(0, trackEnterAt - performance.now())
    enterFromStart(wait)
  })
})

onMounted(() => {
  enterFromStart(props.enterDelay ?? 0)
  resizeObserver = new ResizeObserver(() => {
    const root = rootEl.value
    if (!root || `${root.clientWidth}x${root.clientHeight}` === measuredSize) return
    measure()
    target = baseTarget()
    pos = target + userOffset
    vel = 0
    render()
  })
  if (rootEl.value) resizeObserver.observe(rootEl.value)
  // Web fonts can change line wrapping after the first measure
  document.fonts?.ready.then(() => {
    const offset = pos - target
    measure()
    target = baseTarget()
    pos = target + offset
    render()
  })
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (userTimer) clearTimeout(userTimer)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="rootEl" class="wheel" @wheel.prevent="onWheel">
    <div ref="leavingEl" class="wheel-leaving" aria-hidden="true" />
    <div ref="stageEl" class="wheel-stage">
      <div
        v-for="(line, i) in lyrics"
        :key="i"
        class="wheel-line"
        :class="{ 'is-active': i === activeIndex }"
        @click="onLineClick(i, line.time)"
      >
        <p class="lyric-text">
          <template v-if="line.segments">
            <template v-for="(seg, si) in line.segments" :key="si"><ruby v-if="seg.ruby">{{ seg.text }}<rp>(</rp><rt>{{ seg.ruby }}</rt><rp>)</rp></ruby><template v-else>{{ seg.text }}</template></template>
          </template>
          <template v-else>{{ line.text }}</template>
        </p>
        <p v-if="line.translation" class="lyric-translation">
          <template v-if="line.translationSegments">
            <template v-for="(seg, si) in line.translationSegments" :key="si"><ruby v-if="seg.ruby">{{ seg.text }}<rp>(</rp><rt>{{ seg.ruby }}</rt><rp>)</rp></ruby><template v-else>{{ seg.text }}</template></template>
          </template>
          <template v-else>{{ line.translation }}</template>
        </p>
      </div>
    </div>
    <p v-if="!lyrics.length" class="wheel-empty">
      ♪
    </p>
  </div>
</template>

<style scoped>
.wheel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
}

/* The previous song's frozen lines while they spin out on a track change */
.wheel-leaving {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Inset by the arc's left travel so lines curving back toward the hub stay inside the wheel */
.wheel-stage {
  position: absolute;
  inset: 0 0 0 var(--arc-room, 0px);
}

.wheel-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  padding-right: 2rem;
  transform-origin: 0 50%;
  will-change: transform, opacity, filter;
  cursor: pointer;
  visibility: hidden; /* until the first render places it */
}

.lyric-text {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.45;
  font-weight: 600;
  color: rgba(255,255,255,.4);
  transition: color .4s;
}

.lyric-translation {
  margin: .15em 0 0;
  font-size: .85rem;
  line-height: 1.45;
  color: rgba(255,255,255,.32);
  transition: color .4s;
}

.wheel-line.is-active .lyric-text {
  color: #fff;
  font-weight: 700;
}

.wheel-line.is-active .lyric-translation {
  color: rgba(255,255,255,.78);
}

@media (hover: hover) {
  .wheel-line:not(.is-active):hover .lyric-text { color: rgba(255,255,255,.7); }
  .wheel-line:not(.is-active):hover .lyric-translation { color: rgba(255,255,255,.55); }
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

.wheel-empty {
  position: absolute;
  top: 50%;
  left: 0;
  margin: 0;
  transform: translateY(-50%);
  font-size: 2rem;
  color: rgba(255,255,255,.18);
  /* Lyrics are briefly empty while a new track's file loads; don't flash the placeholder then */
  animation: wheel-empty-in 300ms ease 450ms backwards;
}

@keyframes wheel-empty-in {
  from { opacity: 0; }
}
</style>
