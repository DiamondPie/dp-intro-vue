<template>
  <div class="relative">
    <div
      v-if="hoverAction"
      class="absolute pointer-events-none"
      style="bottom: calc(100% + 12px); left: 0; right: 0; display: flex; justify-content: center;"
    >
      <Transition name="dock-tip" mode="out-in">
        <div
          v-if="copied"
          key="copied"
          class="tip-box px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-white/90 select-none"
        >
          {{ $t(copiedKey) }}
        </div>
        <div
          v-else-if="hovered"
          key="hover"
          class="tip-box tip-hover-only px-3 py-1.5 rounded-lg text-xs font-medium text-center whitespace-nowrap text-white/90 select-none"
        >
          <div>{{ $t(hoverAction) }}</div>
          <div class="font-mono font-semibold" :style="`color: ${color}`">{{ copyUsername }}</div>
        </div>
      </Transition>
    </div>

    <component
      :is="href ? 'a' : 'button'"
      :href="href || undefined"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener noreferrer' : undefined"
      :aria-label="ariaLabel"
      class="social-pill rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
      :style="`--btn-color: ${color}; animation: 0.6s ease-out ${delay} 1 normal both running scaleIn;`"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="onClickHandle"
    >
      <div class="relative z-10 flex justify-center items-center">
        <div
          class="text-xl transition-transform duration-300"
          :style="`color: color-mix(in oklab, ${color} 80%, white); filter: drop-shadow(${shadow} 0px 0px 20px);`"
        >
          <Icon :name="icon" width="1em" height="1em" />
        </div>
      </div>
    </component>
  </div>
</template>

<script setup>
const props = defineProps({
  color: { type: String, required: true },
  shadow: { type: String, required: true },
  icon: { type: String, required: true },
  href: { type: String, default: undefined },
  external: { type: Boolean, default: false },
  delay: { type: String, required: true },
  ariaLabel: { type: String, required: true },
  hoverAction: { type: String, default: undefined },
  copyUsername: { type: String, default: undefined },
  copiedKey: { type: String, default: undefined },
})

const hovered = ref(false)
const copied = ref(false)
const touchDevice = ref(false)

onMounted(() => {
  touchDevice.value = window.matchMedia('(hover: none)').matches
})

function onMouseEnter() {
  if (touchDevice.value) return
  hovered.value = true
}

function onMouseLeave() {
  if (touchDevice.value) return
  hovered.value = false
  copied.value = false
}

async function onClickHandle() {
  if (!props.copyUsername) return
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  await navigator.clipboard.writeText(props.copyUsername)
  if (props.copiedKey) {
    copied.value = true
    if (touchDevice.value) {
      setTimeout(() => { copied.value = false }, 2000)
    }
  }
}
</script>

<style scoped>
.tip-box {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tip-box::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.1);
}

@media (hover: none) {
  .tip-hover-only {
    display: none;
  }
}

.dock-tip-enter-active {
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 2.2, 0.64, 1);
}

.dock-tip-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.dock-tip-enter-from,
.dock-tip-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.6);
}

.dock-tip-enter-to,
.dock-tip-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
