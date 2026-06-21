<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center items-end">
    <!-- SVG liquid-glass distortion filter -->
    <svg class="absolute overflow-hidden" style="width:0;height:0;" aria-hidden="true">
      <defs>
        <filter id="nav-dock-distort" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022 0.018"
            numOctaves="3"
            seed="5"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>

    <!-- Bottom page-fade: blurs scrolling content beneath the dock -->
    <div
      class="fixed bottom-0 inset-x-0 h-20 pointer-events-none"
      :style="fadeDivStyle"
    />

    <!-- Dock: glass pill + specular highlights -->
    <div
      ref="dockEl"
      class="relative z-10 pointer-events-auto mb-4"
      :style="dockWrapStyle"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <!-- Glass pill: no fixed height — content (aspect-square icons) drives it -->
      <div
        class="flex items-center px-3 py-2 gap-1 rounded-full"
        style="
          background: rgba(255, 255, 255, 0.06);
          box-shadow:
            0 4px 30px rgba(0, 0, 0, 0.55),
            0 1px 0 rgba(255, 255, 255, 0.15) inset;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        "
      >
        <!-- Nav icons -->
        <div
          v-for="(item, i) in navItems"
          :key="item.target"
          :ref="el => setRef(i, el)"
          class="relative flex items-center justify-center cursor-pointer"
          :style="wrapStyle(i)"
          @mouseenter="hoveredItem = item.target"
          @mouseleave="hoveredItem = null"
        >
          <!-- Tooltip: outer div centers via flexbox (no transform conflict with Transition) -->
          <div
            class="absolute pointer-events-none"
            style="bottom: calc(100% + 6px); left: 0; right: 0; display: flex; justify-content: center;"
          >
            <Transition name="dock-tip">
              <div v-if="hoveredItem === item.target" class="flex flex-col items-center select-none">
                <div
                  class="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  style="background: rgba(255, 255, 255, 0.95); color: #111;"
                >
                  {{ $t(item.labelKey) }}
                </div>
                <!-- Arrow: CSS triangle pointing down toward the icon -->
                <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(255, 255, 255, 0.95);" />
              </div>
            </Transition>
          </div>

          <button
            class="flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 w-full h-full transition-[color,background-color] duration-200"
            :aria-label="item.target"
            @click="scrollTo(item.target)"
          >
            <Icon
              :name="item.icon"
              class="pointer-events-none"
              style="width: 50%; height: 50%;"
            />
          </button>
        </div>

        <!-- Vertical separator -->
        <div class="self-stretch w-px mx-1 my-2.5 bg-white/15 flex-shrink-0" />

        <!-- Theme toggle (placeholder — no-op) -->
        <div
          :ref="el => setRef(navItems.length, el)"
          class="relative flex items-center justify-center cursor-pointer"
          :style="wrapStyle(navItems.length)"
          @mouseenter="hoveredItem = '__theme__'"
          @mouseleave="hoveredItem = null"
        >
          <div
            class="absolute pointer-events-none"
            style="bottom: calc(100% + 6px); left: 0; right: 0; display: flex; justify-content: center;"
          >
            <Transition name="dock-tip">
              <div v-if="hoveredItem === '__theme__'" class="flex flex-col items-center select-none">
                <div
                  class="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                  style="background: rgba(255, 255, 255, 0.95); color: #111;"
                >
                  Theme
                </div>
                <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(255, 255, 255, 0.95);" />
              </div>
            </Transition>
          </div>

          <button
            class="flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 w-full h-full transition-[color,background-color] duration-200"
            aria-label="Toggle theme"
          >
            <Icon
              name="lucide:sun"
              class="pointer-events-none"
              style="width: 50%; height: 50%;"
            />
          </button>
        </div>
      </div>

      <!-- Specular highlight: curved top-half glow (simulates glass refraction) -->
      <div
        class="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
        style="background: linear-gradient(to bottom, rgba(255, 255, 255, 0.13), transparent);"
      />
      <!-- Specular highlight: sharp 1px top-edge line -->
      <div
        class="absolute top-px pointer-events-none"
        style="
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.65), transparent);
        "
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const BASE = 40   // px — resting icon slot size
const MAX  = 52   // px — peak size directly under cursor
const DIST = 120  // px — magnification falloff radius

const navItems = [
  { target: 'home',    icon: 'lucide:sprout',      labelKey: 'nav.home'    },
  { target: 'about',   icon: 'lucide:user-round',  labelKey: 'nav.about'   },
  { target: 'works',   icon: 'lucide:code-xml',    labelKey: 'nav.works'   },
  { target: 'friends', icon: 'lucide:users-round', labelKey: 'nav.friends' },
]

const mouseX      = ref(Infinity)
const hoveredItem = ref(null)
const iconEls     = ref([])
const dockEl      = ref(null)
const isMobile    = ref(false)
const dockVisible = ref(false)

// Touch tracking — not reactive, just internal state
let touchStartY     = 0
let touchStartX     = 0
let touchFromBottom = false

// ── Mobile detection ────────────────────────────────────────────────────────

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  // When switching back to desktop, reset so no stale hidden state carries over
  if (!isMobile.value) dockVisible.value = false
}

// ── Computed styles (mobile slide-in/out, otherwise no-op) ──────────────────

const fadeDivStyle = computed(() => ({
  background: 'var(--bg-primary)',
  WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
  maskImage: 'linear-gradient(to top, black, transparent)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  opacity: isMobile.value && !dockVisible.value ? '0' : '1',
  transition: 'opacity 0.35s ease',
}))

const dockWrapStyle = computed(() => {
  if (!isMobile.value) return {}
  return {
    transform:     dockVisible.value ? 'translateY(0)' : 'translateY(200%)',
    transition:    'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
    // Prevent hidden dock from intercepting taps while off-screen
    pointerEvents: dockVisible.value ? undefined : 'none',
  }
})

// ── Icon refs + magnification ────────────────────────────────────────────────

function setRef(i, el) {
  if (el) iconEls.value[i] = el
}

function onMouseMove(e) { mouseX.value = e.clientX }
function onMouseLeave()  { mouseX.value = Infinity }

function getSize(i) {
  if (mouseX.value === Infinity) return BASE
  const el = iconEls.value[i]
  if (!el) return BASE
  const { left, width } = el.getBoundingClientRect()
  const d = Math.abs(mouseX.value - (left + width / 2))
  if (d >= DIST) return BASE
  return BASE + (MAX - BASE) * (1 - d / DIST)
}

function wrapStyle(i) {
  const s = getSize(i)
  return {
    width:      `${s}px`,
    height:     `${s}px`,
    transition: 'width 1s cubic-bezier(0.16,1,0.3,1), height 1s cubic-bezier(0.16,1,0.3,1)',
  }
}

function scrollTo(target) {
  const el = document.getElementById(target)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  // Auto-close dock on mobile after navigating
  if (isMobile.value) dockVisible.value = false
}

// ── Touch gesture handling ───────────────────────────────────────────────────

function onTouchStart(e) {
  const touch = e.touches[0]
  touchStartY     = touch.clientY
  touchStartX     = touch.clientX
  // Only arm the "show" gesture when the touch originates in the bottom quarter
  touchFromBottom = touchStartY > window.innerHeight * 0.75
}

function onTouchEnd(e) {
  if (!isMobile.value) return
  const touch  = e.changedTouches[0]
  const deltaY = touchStartY - touch.clientY          // positive = swipe up
  const deltaX = Math.abs(touch.clientX - touchStartX)

  // Swipe-up from bottom edge → show dock
  if (touchFromBottom && deltaY > 40) {
    dockVisible.value = true
    return
  }

  // Tap outside dock → hide dock
  const isTap = Math.abs(deltaY) < 10 && deltaX < 10
  if (isTap && dockVisible.value && dockEl.value && !dockEl.value.contains(e.target)) {
    dockVisible.value = false
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  checkMobile()
  window.addEventListener('resize',     checkMobile)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend',   onTouchEnd,   { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize',     checkMobile)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend',   onTouchEnd)
})
</script>

<style scoped>
.dock-tip-enter-active,
.dock-tip-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dock-tip-enter-from,
.dock-tip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.dock-tip-enter-to,
.dock-tip-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
