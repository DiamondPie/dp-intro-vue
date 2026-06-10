<script setup lang="ts">
import DXTransitionBg from './DXTransitionBg.vue'
import DXTransitionHold from './DXTransitionHold.vue'
import DXTransitionSide from './DXTransitionSide.vue'
import DXTransitionSlide from './DXTransitionSlide.vue'
import DXTransitionSlideLong from './DXTransitionSlideLong.vue'

const props = withDefaults(defineProps<{
  loading: boolean
  duration?: number
  delay?: number
}>(), {
  duration: 600,
  delay: 100,
})
const durationFormatted = computed(() => `${props.duration}ms`)
const show = ref(false)
const leavable = ref(true)
const leaveRequested = ref(false)
watch(() => props.loading, (value) => {
  if (value) {
    show.value = true
    leavable.value = false
    leaveRequested.value = false
    setTimeout(() => {
      leavable.value = true
      if (leaveRequested.value) {
        show.value = false
        leaveRequested.value = false
      }
    }, props.duration + props.delay)
  }
  else if (leavable.value) {
    show.value = false
  }
  else {
    leaveRequested.value = true
  }
}, { immediate: true })
</script>

<template>
  <div class="dx-transition" :style="{ '--dx-transition-duration': durationFormatted }">
    <Transition>
      <div v-if="show" class="solid-bg" />
    </Transition>
    <DXTransitionBg class="bg-1" :loading="show" :duration />
    <DXTransitionBg class="bg-2" :loading="show" :duration />
    <Transition>
      <div v-if="show" class="items">
        <DXTransitionSlide class="slide-1" />
        <DXTransitionSlide class="slide-2" />
        <DXTransitionSlide class="slide-3" />
        <DXTransitionSlide class="slide-4" />
        <DXTransitionSlideLong class="slide-long-1" />
        <DXTransitionSlideLong class="slide-long-2" />
        <DXTransitionHold class="hold-1" />
        <DXTransitionHold class="hold-2" />
        <DXTransitionHold class="hold-3" />
        <DXTransitionHold class="hold-4" />
        <DXTransitionHold class="hold-5" />
      </div>
    </Transition>
    <DXTransitionSide class="side-1" :loading="show" :duration />
    <DXTransitionSide class="side-2" :loading="show" :duration />
    <Transition>
      <div v-if="show" class="center">
        <div class="wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11520 9280" fill="currentColor" stroke="none">
            <path d="M 3720 8478 L 7046 2682 L 8173 4639 L 6966 6740 H 5565 L 4565 8485 Z M 6538 6000 L 7323 4632 L 7049 4160 L 6000 6000 Z" />
            <path d="M 5257 7853 L 5672 7110 H 7178 L 8603 4633 L 7261 2293 L 7685 1565 L 9452 4635 L 7608 7850 Z" />
            <path d="M 3830 7700 L 2070 4633 L 3922 1410 H 6260 L 5845 2150 L 4337 2155 L 2917 4635 L 4250 6971 Z" />
            <path d="M 4471 6590 L 3350 4633 L 4547 2535 L 5948 2530 L 6962 780 L 7800 784 L 4471 6590 Z M 4474 5108 L 5520 3270 L 4976 3275 L 4198 4640 Z" />
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dx-transition {
  /* Map page design tokens to DX transition color variables */
  --dx-color-bg: var(--bg-primary);
  --dx-color-center: var(--accent-primary);
  --dx-color-items-1: var(--text-primary);
  --dx-color-items-2: var(--accent-primary);
  --dx-color-items-3: var(--accent-tertiary);
  --dx-color-items-4: var(--accent-secondary);
  --dx-color-side-1: color-mix(in oklab, var(--accent-primary), var(--color-black) 85%);
  --dx-color-side-2: color-mix(in oklab, var(--accent-primary), var(--color-black) 70%);

  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  overflow: hidden;
  z-index: 500;
  pointer-events: none;
  inset: 0;
  margin: 0;
  padding: 0;
}

.dx-transition > * {
  pointer-events: auto;
}

/* ── Solid background overlay ── */
.solid-bg {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: var(--dx-color-bg);
}

.solid-bg.v-enter-from {
  opacity: 0;
}

.solid-bg.v-enter-active {
  transition: opacity var(--dx-transition-duration, 600ms);
}

/* ── Center icon ── */
.center {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: min(50vw, 50vh);
  height: min(50vw, 50vh);
}

.center .wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.center .wrapper > * {
  color: var(--dx-color-center);
  width: 100%;
  height: 100%;
}

.center.v-enter-from {
  opacity: 0;
  scale: 0.9;
}

.center.v-leave-to {
  opacity: 0;
}

.center.v-leave-to .wrapper {
  transform: scale(13);
}

.center.v-enter-active {
  transition:
    opacity calc(var(--dx-transition-duration, 600ms) * 0.35) linear,
    scale var(--dx-transition-duration, 600ms) cubic-bezier(0, 0, 0, 1.1);
}

.center.v-leave-active {
  transition: all var(--dx-transition-duration, 600ms) cubic-bezier(0.3, 0, 0.7, 1);
}

.center.v-leave-active .wrapper {
  transition: all var(--dx-transition-duration, 600ms) cubic-bezier(1, -0.2, 0.2, 1);
}

/* ── Per-path staggered entrance: pieces converge from outside in ── */
.center .wrapper svg path {
  transform-box: fill-box;
  transform-origin: center;
}

/* Path 1 (base / outermost layer): zooms in from slightly enlarged */
.center.v-enter-active .wrapper svg path:nth-child(1) {
  animation: dx-logo-path1
    calc(var(--dx-transition-duration, 600ms) * 0.85)
    cubic-bezier(0.2, 0, 0.1, 1) both;
  animation-delay: calc(var(--dx-transition-duration, 600ms) * 0.22);
}

/* Path 2 (right side): slides in from the right */
.center.v-enter-active .wrapper svg path:nth-child(2) {
  animation: dx-logo-path2
    calc(var(--dx-transition-duration, 600ms) * 0.85)
    cubic-bezier(0.2, 0, 0.1, 1) both;
  animation-delay: calc(var(--dx-transition-duration, 600ms) * 0.3);
}

/* Path 3 (left side): slides in from the left — symmetric with path 2 */
.center.v-enter-active .wrapper svg path:nth-child(3) {
  animation: dx-logo-path3
    calc(var(--dx-transition-duration, 600ms) * 0.85)
    cubic-bezier(0.2, 0, 0.1, 1) both;
  animation-delay: calc(var(--dx-transition-duration, 600ms) * 0.3);
}

/* Path 4 (top / center highlight): descends into place last */
.center.v-enter-active .wrapper svg path:nth-child(4) {
  animation: dx-logo-path4
    calc(var(--dx-transition-duration, 600ms) * 0.85)
    cubic-bezier(0.2, 0, 0.1, 1) both;
  animation-delay: calc(var(--dx-transition-duration, 600ms) * 0.22);
}

@keyframes dx-logo-path1 {
  0%   { opacity: 0; transform: translateY(28%) scale(1.9) rotate(-20deg); }
  70%  { opacity: 1; transform: translateY(-2%) scale(0.97) rotate(2deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}

@keyframes dx-logo-path2 {
  0%   { opacity: 0; transform: translateX(55%) rotate(30deg); }
  70%  { opacity: 1; transform: translateX(-2%) rotate(-2deg); }
  100% { opacity: 1; transform: translateX(0) rotate(0deg); }
}

@keyframes dx-logo-path3 {
  0%   { opacity: 0; transform: translateX(-55%) rotate(-30deg); }
  70%  { opacity: 1; transform: translateX(2%) rotate(2deg); }
  100% { opacity: 1; transform: translateX(0) rotate(0deg); }
}

@keyframes dx-logo-path4 {
  0%   { opacity: 0; transform: translateY(-42%) scale(1.15) rotate(12deg); }
  70%  { opacity: 1; transform: translateY(3%) scale(0.99) rotate(-1deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}

/* ── Background panels ── */
.bg-2 {
  transform: rotate(180deg);
}

/* ── Side corner decorations ── */
.side-1 {
  top: 0;
  left: 0;
}

.side-2 {
  bottom: 0;
  right: 0;
  transform: rotate(180deg);
}

/* ── Rotating items container ── */
.items {
  width: calc(61vmax * max(100vw / 100vh, 100vh / 100vw));
  height: 100vmax;
  scale: calc(min(100vw / 100vh, 100vh / 100vw));
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  transform: rotate(45deg);
}

.items > *,
.items > * > * {
  position: absolute;
}

.items.v-enter-active,
.items.v-enter-active > * {
  transition: var(--dx-transition-duration, 600ms) cubic-bezier(0, 0, 0.1, 1);
  transition-property: transform, opacity;
}

.items.v-leave-active,
.items.v-leave-active > * {
  transition: var(--dx-transition-duration, 600ms) cubic-bezier(0.9, 0, 1, 1);
  transition-property: transform, opacity;
}

/* ── Slide notes ── */
.slide-1 {
  width: max(14vw, 14vh);
  color: var(--dx-color-items-1);
  right: -1%;
  bottom: min(-3.5vw, -3.5vh);
}
.items.v-enter-from .slide-1 { transform: translateY(max(44vw, 44vh)); }
.items.v-leave-to .slide-1   { transform: translateY(min(-102vw, -102vh)); }

.slide-2 {
  width: max(12vw, 12vh);
  color: var(--dx-color-items-1);
  left: 18%;
  top: min(-13.5vw, -13.5vh);
}
.items.v-enter-from .slide-2 { transform: translateY(max(122vw, 122vh)); }
.items.v-leave-to .slide-2   { transform: translateY(min(-38vw, -38vh)); }

.slide-3 {
  width: max(6.5vw, 6.5vh);
  color: var(--dx-color-items-2);
  right: 35%;
  top: max(2vw, 2vh);
}
.items.v-enter-from .slide-3 { transform: translateY(max(38vw, 38vh)); opacity: 0; }
.items.v-leave-to .slide-3   { transform: translateY(min(-44vw, -44vh)); }

.slide-4 {
  width: max(6.5vw, 6.5vh);
  color: var(--dx-color-items-3);
  left: 7%;
  top: max(21vw, 21vh);
}
.items.v-enter-from .slide-4 { transform: translateY(max(38vw, 38vh)); opacity: 0; }
.items.v-leave-to .slide-4   { transform: translateY(min(-44vw, -44vh)); }

.slide-long-1 {
  width: max(12vw, 12vh);
  color: var(--dx-color-items-2);
  left: 0;
  bottom: min(-18vw, -18vh);
}
.items.v-enter-from .slide-long-1 { transform: translateY(max(45vw, 45vh)); }
.items.v-leave-to .slide-long-1   { transform: translateY(min(-118vw, -118vh)); }

.slide-long-2 {
  width: max(6vw, 6vh);
  color: var(--dx-color-items-3);
  right: 29%;
  bottom: min(-5.5vw, -5.5vh);
}
.items.v-enter-from .slide-long-2 { transform: translateY(max(38vw, 38vh)); }
.items.v-leave-to .slide-long-2   { transform: translateY(min(-44vw, -44vh)); opacity: 0; }

/* ── Hold notes (color inherited from parent class via currentColor) ── */
.dx-transition-hold,
.dx-transition-hold-long {
  color: var(--dx-color-items-4);
}

.hold-1 {
  width: max(11vw, 11vh);
  left: 20%;
  bottom: min(-83vw, -83vh);
}
.items.v-enter-from .hold-1 { transform: translateY(max(-28vw, -28vh)); opacity: 0; }
.items.v-leave-to .hold-1   { transform: translateY(min(58vw, 58vh)); opacity: 0; }

.hold-2 {
  width: max(6.5vw, 6.5vh);
  left: 36%;
  bottom: min(-53.3vw, -53.3vh);
}
.items.v-enter-from .hold-2 { transform: translateY(max(-14vw, -14vh)); opacity: 0; }
.items.v-leave-to .hold-2   { transform: translateY(min(30vw, 30vh)); opacity: 0; }

.hold-3 {
  width: max(11vw, 7vh);
  right: 5%;
  bottom: min(-95vw, -95vh);
}
.items.v-enter-from .hold-3 { transform: translateY(max(-20vw, -20vh)); opacity: 0; }
.items.v-leave-to .hold-3   { transform: translateY(min(40vw, 40vh)); opacity: 0; }

.hold-4 {
  width: max(5.5vw, 5.5vh);
  right: 8%;
  top: min(-9vw, -9vh);
}
.items.v-enter-from .hold-4 { transform: translateY(max(-14vw, -14vh)); opacity: 0; }
.items.v-leave-to .hold-4   { transform: translateY(min(16vw, 16vh)); opacity: 0; }

.hold-5 {
  width: max(11vw, 11vh);
  right: 19%;
  top: min(-79vw, -79vh);
}
.items.v-enter-from .hold-5 { transform: translateY(max(-28vw, -28vh)); opacity: 0; }
.items.v-leave-to .hold-5   { transform: translateY(min(38vw, 38vh)); opacity: 0; }
</style>
