<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
  close: []
}>()
</script>

<template>
  <button class="track-drawer-tab" aria-label="Toggle playlist" @click="emit('toggle')">
    <Icon :name="isOpen ? 'mdi:close' : 'mdi:playlist-music'" />
  </button>
  <div
    class="track-drawer-overlay"
    :class="{ 'is-visible': isOpen }"
    @click="emit('close')"
  />
</template>

<style scoped>
/* Hidden on desktop; slides in on mobile */
.track-drawer-tab    { display: none; }
.track-drawer-overlay { display: none; }

@media (max-width: 640px) {
  .track-drawer-tab {
    display: flex;
    position: fixed;
    top: 1.25rem;
    left: 0;
    z-index: 20;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,.18);
    border: none;
    border-radius: 0 7px 7px 0;
    color: rgba(255,255,255,.85);
    cursor: pointer;
    font-size: 1.15rem;
    backdrop-filter: blur(8px);
    box-shadow: 2px 0 8px rgba(0,0,0,.35);
    transition: background .2s;
  }

  .track-drawer-tab:active {
    background: rgba(255,255,255,.28);
  }

  @media (hover: hover) {
    .track-drawer-tab:hover {
      background: rgba(255,255,255,.28);
    }
  }

  .track-drawer-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 9;
    background: rgba(0,0,0,.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .track-drawer-overlay.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
