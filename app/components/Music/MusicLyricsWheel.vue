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
const SPIN_OUT_MS = 500
const USER_SCROLL_HOLD = 2500 // ms before a manual wheel scroll springs back to the active line

const rootEl = ref<HTMLElement | null>(null)

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
  lineEls = [...root.querySelectorAll<HTMLElement>('.wheel-line')]
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

/** Arc position that should face the viewer for the current line. */
function baseTarget(): number {
  if (!centers.length) return 0
  const i = props.currentIndex
  if (i < 0) return centers[0]! - radius * 0.35 // before the first line: it waits just below the front
  return centers[Math.min(i, centers.length - 1)]!
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
 * Called just before this component is removed (leaving the immersive layout). Returns a function
 * that keeps spinning a frozen copy of the wheel counter-clockwise until every line has left
 * through the top; the copy's lines are matched to ours by order.
 */
function prepareSpinOut(): (copyRoot: HTMLElement) => Promise<void> {
  const hs = heights
  const cs = centers
  const r = radius
  const from = pos
  const to = pos + 2 * HIDE_ANGLE * r // the lowest visible line ends up past the top
  // Only the lines on screen now take part: turning the rim would otherwise pull later lines up
  // from below, leaving them visible when the copy is removed
  const onScreen = cs.map((_, i) => i).filter(i => Math.abs((cs[i]! - from) / r) <= HIDE_ANGLE)
  return (copyRoot) => {
    const all = [...copyRoot.querySelectorAll<HTMLElement>('.wheel-line')]
    const els = onScreen.map(i => all[i]).filter((el): el is HTMLElement => !!el)
    if (!els.length || prefersReducedMotion()) return Promise.resolve()
    const subHs = onScreen.map(i => hs[i]!)
    const subCs = onScreen.map(i => cs[i]!)
    return new Promise((resolve) => {
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / SPIN_OUT_MS)
        placeLines(els, subHs, subCs, r, from + (to - from) * easeInQuad(p))
        if (p < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }
}

defineExpose({ prepareSpinOut })

function onWheel(e: WheelEvent) {
  if (!centers.length) return
  entrance = null
  const min = centers[0]! - target
  const max = centers[centers.length - 1]! - target
  userOffset = Math.min(max, Math.max(min, userOffset + e.deltaY))
  settle()
  if (userTimer) clearTimeout(userTimer)
  userTimer = setTimeout(() => {
    userOffset = 0
    settle()
  }, USER_SCROLL_HOLD)
}

watch(() => props.currentIndex, () => {
  target = baseTarget()
  settle()
})

// New track: new lines, so re-measure and roll them in
watch(() => props.lyrics, () => {
  nextTick(enterFromStart)
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
    <div class="wheel-stage">
      <div
        v-for="(line, i) in lyrics"
        :key="i"
        class="wheel-line"
        :class="{ 'is-active': i === currentIndex }"
        @click="emit('seek', line.time)"
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
}
</style>
