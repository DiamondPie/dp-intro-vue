<script setup lang="ts">
defineProps<{
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: 'none' | 'all' | 'one'
}>()

const emit = defineEmits<{
  prevTrack: []
  togglePlay: []
  nextTrack: []
  seek: [event: Event]
  setVolume: [event: Event]
  toggleMute: []
  toggleShuffle: []
  toggleRepeat: []
}>()

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '00:00'
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const volumePopupOpen = ref(false)
const muteContainerRef = ref<HTMLElement | null>(null)

function handleMuteClick() {
  if (window.innerWidth < 640) {
    volumePopupOpen.value = !volumePopupOpen.value
  }
  else {
    emit('toggleMute')
  }
}

function onDocumentClick(e: MouseEvent) {
  if (muteContainerRef.value && !muteContainerRef.value.contains(e.target as Node)) {
    volumePopupOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div class="relative z-[3] flex-shrink-0 px-6 pt-[0.7rem] pb-[1.6rem] backdrop-blur-md max-sm:z-20 max-sm:px-4 max-sm:pt-2 max-sm:pb-[0.8rem]">
    <div class="flex items-center gap-[0.3rem]">
      <button class="ctrl-btn" title="Previous" @click="emit('prevTrack')">
        <Icon name="mdi:skip-previous" />
      </button>
      <button
        class="ctrl-btn ctrl-btn--play"
        :title="isPlaying ? 'Pause' : 'Play'"
        @click="emit('togglePlay')"
      >
        <Icon :name="isPlaying ? 'mdi:pause' : 'mdi:play'" />
      </button>
      <button class="ctrl-btn" title="Next" @click="emit('nextTrack')">
        <Icon name="mdi:skip-next" />
      </button>

      <!-- Progress bar wrapper — on mobile also contains the time above the bar -->
      <div class="flex-1 min-w-0 flex flex-col gap-[0.15rem]">
        <!-- Time: mobile only, right-aligned above progress bar -->
        <span
          class="hidden max-sm:block self-end text-right pr-2 mb-[0.2rem] text-[0.7rem] whitespace-nowrap tabular-nums"
          style="color: rgba(255,255,255,.75)"
        >
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
        <!-- Progress bar -->
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
          <div class="progress-thumb" :style="{ left: `${progress * 100}%` }" />
          <input
            type="range"
            class="progress-input"
            min="0"
            :max="duration || 100"
            step="0.1"
            :value="currentTime"
            @input="emit('seek', $event)"
          >
        </div>
      </div>

      <!-- Time: desktop only -->
      <span
        class="flex-shrink-0 px-[0.35rem] text-[0.75rem] whitespace-nowrap tabular-nums max-sm:hidden"
        style="color: rgba(255,255,255,.75)"
      >
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>

      <!-- Volume area -->
      <div ref="muteContainerRef" class="relative flex-shrink-0 flex items-center">
        <button
          class="ctrl-btn"
          :title="isMuted ? 'Unmute' : 'Mute'"
          @click="handleMuteClick"
        >
          <Icon :name="isMuted ? 'mdi:volume-off' : 'mdi:volume-high'" />
        </button>

        <!-- Mobile: vertical volume popup -->
        <Transition name="vol-popup">
          <div
            v-if="volumePopupOpen"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 flex flex-col items-center gap-2 rounded-xl px-3 pt-3 pb-3"
            style="background: rgba(20,20,20,0.92)"
          >
            <span class="text-[0.65rem] tabular-nums" style="color: rgba(255,255,255,.7)">
              {{ Math.round(volume * 100) }}
            </span>
            <div class="vol-vertical-track">
              <div class="vol-vertical-fill" :style="{ height: `${volume * 100}%` }" />
              <div class="vol-vertical-thumb" :style="{ bottom: `${volume * 100}%` }" />
              <input
                type="range"
                class="vol-vertical-input"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="emit('setVolume', $event)"
              >
            </div>
          </div>
        </Transition>

        <!-- Desktop: horizontal volume track -->
        <div class="vol-track max-sm:hidden">
          <div class="vol-fill" :style="{ width: `${volume * 100}%` }" />
          <div class="vol-thumb" :style="{ left: `${volume * 100}%` }" />
          <input
            type="range"
            class="vol-input"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="emit('setVolume', $event)"
          >
        </div>
      </div>

      <!-- Shuffle & Repeat -->
      <button
        class="ctrl-btn ml-3 max-sm:ml-0"
        :class="{ 'is-on': shuffle }"
        title="Shuffle"
        @click="emit('toggleShuffle')"
      >
        <Icon name="mdi:shuffle" />
      </button>
      <button
        class="ctrl-btn"
        :class="{ 'is-on': repeat !== 'none' }"
        :title="repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'No repeat'"
        @click="emit('toggleRepeat')"
      >
        <Icon :name="repeat === 'one' ? 'mdi:repeat-once' : 'mdi:repeat'" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Custom slider track overlay pattern — requires absolute positioning + transparent input */
.progress-track,
.vol-track {
  position: relative;
  height: 4px;
  background: rgba(255,255,255,.18);
  border-radius: 2px;
  cursor: pointer;
}

.progress-track { width: 100%; }
.vol-track { width: 80px; flex-shrink: 0; }

.progress-fill,
.vol-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255,255,255,.85);
  border-radius: 2px;
  pointer-events: none;
  transition: width .1s linear;
}

.progress-thumb,
.vol-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0,0,0,.4);
  transition: left .1s linear;
}

.progress-input,
.vol-input {
  position: absolute;
  inset: -8px 0;
  opacity: 0;
  width: 100%;
  cursor: pointer;
  height: calc(100% + 16px);
}

/* Vertical volume track (mobile popup) */
.vol-vertical-track {
  position: relative;
  width: 4px;
  height: 100px;
  background: rgba(255,255,255,.18);
  border-radius: 2px;
  cursor: pointer;
}

.vol-vertical-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255,255,255,.85);
  border-radius: 2px;
  pointer-events: none;
  transition: height .1s linear;
}

.vol-vertical-thumb {
  position: absolute;
  left: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, 50%);
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0,0,0,.4);
  transition: bottom .1s linear;
}

.vol-vertical-input {
  position: absolute;
  top: -8px;
  left: -8px;
  opacity: 0;
  writing-mode: vertical-lr;
  direction: rtl;
  height: calc(100% + 16px);
  width: calc(100% + 16px);
  cursor: pointer;
}

.ctrl-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: none;
  border: none;
  color: rgba(255,255,255,.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  transition: color .15s, background .15s;
}

.ctrl-btn:hover {
  color: #fff;
  background: rgba(255,255,255,.09);
}

.ctrl-btn.is-on {
  color: #fff;
  background: rgba(255,255,255,.15);
}

.ctrl-btn--play {
  width: 46px;
  height: 46px;
  background: rgba(255,255,255,.14);
  font-size: 1.6rem;
}

.ctrl-btn--play:hover { background: rgba(255,255,255,.22); }

/* Vertical volume popup enter/leave transition */
.vol-popup-enter-active,
.vol-popup-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.vol-popup-enter-from,
.vol-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px) scale(0.95);
}
</style>
