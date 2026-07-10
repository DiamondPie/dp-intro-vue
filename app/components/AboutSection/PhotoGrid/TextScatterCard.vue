<template>
  <a
    :href="photo.src"
    target="_blank"
    rel="noopener noreferrer"
    class="relative block group overflow-hidden rounded-2xl break-inside-avoid cursor-zoom-in"
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
  >
    <img
      alt=""
      class="w-full h-[60%] object-cover duration-[600ms] group-hover:scale-105 ease-in-out"
      :src="photo.src"
      loading="lazy"
    >
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
    >
      <Transition name="caption-fade">
        <p v-if="hasPlayed" class="text-white/90 text-sm font-medium">{{ photo.caption }}</p>
      </Transition>
    </div>
    <div v-if="panelVisible" ref="overlayEl" class="scatter-overlay">
      <div ref="row0" class="scatter-row" />
      <div ref="row1" class="scatter-row" />
      <div ref="row2" class="scatter-row" />
    </div>
  </a>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  photo: { type: Object, required: true }
})

const { tm, rt } = useI18n()

const CHAR_STROKE_COLOR = '#ffffff'
const CHAR_GRADIENT_TOP = '#be32be'
const CHAR_GRADIENT_BOTTOM = '#7804c2'

const CONFIG = {
  FLOOR_Y: 130,
  FLOOR_Y_JITTER: 5,
  SCATTER_VELOCITY_MIN: 80,
  SCATTER_VELOCITY_MAX: 160,
  SCATTER_ANGLE_MIN: -100,
  SCATTER_ANGLE_MAX: -80,
  SCATTER_GRAVITY: 500,
  SCATTER_DURATION_CAP: 3,
  SCATTER_STAGGER_EACH: 0.15,
  TILT_ROTATION_MIN: 0,
  TILT_ROTATION_MAX: 180,
  SPIN_ROTATION_RANGE: 360,
  LAND_SETTLE_DURATION: 0.2,
  LAND_SETTLE_EASE: 'power2.out',
  DISAPPEAR_DELAY: 1,
  DISAPPEAR_DURATION: 0.35,
  DISAPPEAR_EASE: 'power1.in',
  ENTRANCE_ROTATION_MIN: 5,
  ENTRANCE_ROTATION_MAX: 15,
  ENTRANCE_SCALE_FROM: 1.8,
  ENTRANCE_ORIGIN_X_MIN: 0,
  ENTRANCE_ORIGIN_X_MAX: 50,
  ENTRANCE_ORIGIN_Y_MIN: 50,
  ENTRANCE_ORIGIN_Y_MAX: 80,
  ENTRANCE_DURATION: 0.4,
  ENTRANCE_STAGGER_EACH: 0.05,
  ENTRANCE_EASE: 'power2.out',
  WAIT_BEFORE_SCATTER: 0.5,
  GLOBAL_TIME_SCALE: 3,
  SEGMENT_INTERVAL: 0.6
}

const REFERENCE_ROW_INDEX = 1

const PUNCTUATION_REGEX = /\p{P}/u

const row0 = ref(null)
const row1 = ref(null)
const row2 = ref(null)
const rowEls = [row0, row1, row2]
const overlayEl = ref(null)

const panelVisible = ref(false)
const hasPlayed = ref(false)

const rowSplits = [null, null, null]
let isAnimating = false
let cancelRequested = false
let gsapApi = null
let activeResolve = null

let activeMainAnimation = null
let loadPromise = null

function isBackFacing(rotationX, rotationY) {
  return (rotationX > 90) !== (rotationY > 90)
}

function wrapCharFaces(chars) {
  chars.forEach((char) => {
    const text = char.textContent
    char.textContent = ''

    const front = document.createElement('span')
    front.className = 'char-face char-face--front'
    front.textContent = text

    const back = document.createElement('span')
    back.className = 'char-face char-face--back'
    back.textContent = text

    char.append(front, back)
  })
}

function loadFonts() {
  return Promise.all([
    new FontFace('TextScatterMedium', 'url(/fonts/text-scatter/medium.woff2)').load(),
    new FontFace('TextScatterBold', 'url(/fonts/text-scatter/bold.woff2)').load()
  ]).then(([medium, bold]) => {
    document.fonts.add(medium)
    document.fonts.add(bold)
  })
}

function loadResources() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import('gsap'),
      import('gsap/SplitText'),
      import('gsap/Physics2DPlugin'),
      loadFonts()
    ]).then(([{ gsap }, { SplitText }, { Physics2DPlugin }]) => {
      gsap.registerPlugin(SplitText, Physics2DPlugin)
      return { gsap, SplitText }
    })
  }
  return loadPromise
}

// Only after the page is fully loaded and the browser is idle 
// should gsap/SplitText/Physics2DPlugin and fonts be pre-fetched 
// (without animation), ensuring the cache is likely hit by the time 
// the user actually hovers over the screen. 
// This must begin only after the window's load event 
// (not the component's mounted event) is triggered to avoid 
// competing for bandwidth/main thread with critical resources 
// on the first screen, thus prolonging the first screen loading time.
let pageLoadListener = null

function prefetchOnIdle() {
  const run = () => {
    loadResources().then((api) => {
      gsapApi = api
    })
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run)
  } else {
    setTimeout(run, 0)
  }
}

onMounted(() => {
  if (document.readyState === 'complete') {
    prefetchOnIdle()
  } else {
    pageLoadListener = () => prefetchOnIdle()
    window.addEventListener('load', pageLoadListener, { once: true })
  }
})

function clearRow(rowIndex) {
  if (rowSplits[rowIndex]) {
    rowSplits[rowIndex].revert()
    rowSplits[rowIndex] = null
  }
  rowEls[rowIndex].value.textContent = ''
}

function setRowText(gsap, SplitText, rowIndex, text) {
  if (rowSplits[rowIndex]) {
    rowSplits[rowIndex].revert()
    rowSplits[rowIndex] = null
  }

  const rowEl = rowEls[rowIndex].value
  rowEl.textContent = text

  const split = SplitText.create(rowEl, {
    type: 'chars',
    charsClass: 'char',
    tag: 'span',
    smartWrap: true
  })
  gsap.set(split.chars, { transformPerspective: 600 })

  split.chars.forEach((char) => {
    if (PUNCTUATION_REGEX.test(char.textContent)) {
      char.classList.add('char--punct')
    }
  })

  wrapCharFaces(split.chars)

  rowSplits[rowIndex] = split
  return split
}

function scatter(gsap, chars, rowIndex, onAllSettled) {
  gsap.killTweensOf(chars)

  const referenceTop = rowEls[REFERENCE_ROW_INDEX].value.getBoundingClientRect().top
  const rowTop = rowEls[rowIndex].value.getBoundingClientRect().top
  const rowFloorY = CONFIG.FLOOR_Y + (referenceTop - rowTop)

  const floors = new Map(
    chars.map(char => [char, rowFloorY + gsap.utils.random(-CONFIG.FLOOR_Y_JITTER, CONFIG.FLOOR_Y_JITTER)])
  )
  const landed = new Set()
  let settledCount = 0

  const tween = gsap.to(chars, {
    duration: CONFIG.SCATTER_DURATION_CAP,
    physics2D: {
      velocity: () => gsap.utils.random(CONFIG.SCATTER_VELOCITY_MIN, CONFIG.SCATTER_VELOCITY_MAX),
      angle: () => gsap.utils.random(CONFIG.SCATTER_ANGLE_MIN, CONFIG.SCATTER_ANGLE_MAX),
      gravity: CONFIG.SCATTER_GRAVITY
    },
    rotationX: () => gsap.utils.random(CONFIG.TILT_ROTATION_MIN, CONFIG.TILT_ROTATION_MAX),
    rotationY: () => gsap.utils.random(CONFIG.TILT_ROTATION_MIN, CONFIG.TILT_ROTATION_MAX),
    rotation: () => gsap.utils.random(-CONFIG.SPIN_ROTATION_RANGE, CONFIG.SPIN_ROTATION_RANGE),
    ease: 'power1.out',
    stagger: { each: CONFIG.SCATTER_STAGGER_EACH, from: 'start' },
    onUpdate() {
      chars.forEach((char) => {
        if (landed.has(char)) return
        if (gsap.getProperty(char, 'y') >= floors.get(char)) {
          landed.add(char)
          tween.kill(char)
          gsap.set(char, { y: floors.get(char) })

          const isBack = isBackFacing(
            gsap.getProperty(char, 'rotationX'),
            gsap.getProperty(char, 'rotationY')
          )
          char.classList.add('char--landed', isBack ? 'char--face-back' : 'char--face-front')

          gsap.to(char, {
            rotationX: 0,
            rotationY: 0,
            duration: CONFIG.LAND_SETTLE_DURATION,
            ease: CONFIG.LAND_SETTLE_EASE
          }).timeScale(CONFIG.GLOBAL_TIME_SCALE)

          gsap.to(char, {
            scale: 0,
            delay: CONFIG.DISAPPEAR_DELAY,
            duration: CONFIG.DISAPPEAR_DURATION,
            ease: CONFIG.DISAPPEAR_EASE,
            onComplete: () => {
              settledCount += 1
              if (settledCount === chars.length) {
                tween.kill()
                onAllSettled()
              }
            }
          }).timeScale(CONFIG.GLOBAL_TIME_SCALE)
        }
      })
    },
    onComplete: onAllSettled
  }).timeScale(CONFIG.GLOBAL_TIME_SCALE)

  activeMainAnimation = tween
}

function playLine(gsap, SplitText, rowIndex, text) {
  return new Promise((resolve) => {
    activeResolve = resolve

    const split = setRowText(gsap, SplitText, rowIndex, text)
    const chars = split.chars

    gsap.set(chars, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      opacity: 0,
      scale: CONFIG.ENTRANCE_SCALE_FROM,
      rotation: () =>
        gsap.utils.random(CONFIG.ENTRANCE_ROTATION_MIN, CONFIG.ENTRANCE_ROTATION_MAX) *
        gsap.utils.random([-1, 1]),
      transformOrigin: () =>
        `${gsap.utils.random(CONFIG.ENTRANCE_ORIGIN_X_MIN, CONFIG.ENTRANCE_ORIGIN_X_MAX)}% ${gsap.utils.random(CONFIG.ENTRANCE_ORIGIN_Y_MIN, CONFIG.ENTRANCE_ORIGIN_Y_MAX)}%`
    })

    const tl = gsap.timeline({
      onComplete: () => {
        scatter(gsap, chars, rowIndex, () => {
          clearRow(rowIndex)
          activeResolve = null
          resolve()
        })
      }
    })
    activeMainAnimation = tl

    tl.to(chars, {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: CONFIG.ENTRANCE_DURATION,
      ease: CONFIG.ENTRANCE_EASE,
      stagger: { each: CONFIG.ENTRANCE_STAGGER_EACH, from: 'start' }
    })
    tl.to({}, { duration: CONFIG.WAIT_BEFORE_SCATTER })
  })
}

async function handleHover() {
  if (isAnimating || hasPlayed.value) return
  isAnimating = true
  cancelRequested = false

  try {
    panelVisible.value = true

    gsapApi = await loadResources()
    if (cancelRequested) return
    await nextTick()
    if (cancelRequested) return

    const { gsap, SplitText } = gsapApi
    const lines = tm('about.scatter_text').map(line => rt(line))
    for (let i = 0; i < lines.length; i++) {
      const result = await playLine(gsap, SplitText, i, lines[i])
      if (result === 'cancelled') return
    }
    hasPlayed.value = true
  } finally {
    if (!cancelRequested) {
      panelVisible.value = false
    }
    isAnimating = false
  }
}

function handleLeave() {
  if (!isAnimating || hasPlayed.value) return
  cancelRequested = true

  if (!gsapApi) {
    panelVisible.value = false
    isAnimating = false
    return
  }

  const { gsap } = gsapApi

  activeMainAnimation?.kill()
  activeMainAnimation = null

  rowEls.forEach((rowEl) => {
    if (rowEl.value) gsap.killTweensOf(rowEl.value.querySelectorAll('.char'))
  })

  const resolvePending = activeResolve
  activeResolve = null

  const finish = () => {
    rowSplits.forEach((_, i) => clearRow(i))
    panelVisible.value = false
    isAnimating = false
    resolvePending?.('cancelled')
  }

  if (overlayEl.value) {
    gsap.to(overlayEl.value, { opacity: 0, duration: 0.25, ease: 'power1.out', onComplete: finish })
  } else {
    finish()
  }
}

onBeforeUnmount(async () => {
  if (pageLoadListener) {
    window.removeEventListener('load', pageLoadListener)
    pageLoadListener = null
  }
  if (!loadPromise) return
  const { gsap } = await loadPromise
  rowSplits.forEach((split, i) => {
    if (!split) return
    gsap.killTweensOf(split.chars)
    split.revert()
    rowSplits[i] = null
  })
})
</script>

<style scoped>
.caption-fade-enter-active {
  transition: opacity 0.6s ease;
}

.caption-fade-enter-from {
  opacity: 0;
}

.scatter-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 1rem;
  pointer-events: none;
  z-index: 2;
  perspective: 1200px;
}

.scatter-row {
  min-height: 1.6em;
  font-size: clamp(0.9rem, 3vw, 1.6rem);
  font-weight: 900;
  color: #fff;
  text-align: center;
  transform-style: preserve-3d;
  line-height: 1;
}

:deep(.char) {
  display: inline-block;
  position: relative;
  will-change: transform;
  transform-style: preserve-3d;
  font-family: 'TextScatterBold', sans-serif;
  -webkit-text-stroke: 0.3px v-bind(CHAR_STROKE_COLOR);
}

:deep(.char--punct) {
  font-family: 'TextScatterMedium', sans-serif;
}

:deep(.char-face) {
  backface-visibility: hidden;
}

:deep(.char-face--front) {
  background-image: linear-gradient(to bottom, v-bind(CHAR_GRADIENT_TOP), v-bind(CHAR_GRADIENT_BOTTOM));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

:deep(.char-face--back) {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  color: v-bind(CHAR_STROKE_COLOR);
}

:deep(.char--landed .char-face--back) {
  transform: none;
}

:deep(.char--face-front .char-face--back),
:deep(.char--face-back .char-face--front) {
  visibility: hidden;
}
</style>
