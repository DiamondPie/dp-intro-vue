<template>
  <div class="group-item">
    <button type="button" class="group-header" @click="isOpen = !isOpen">
      <CommitsSectionBadge :type="type">{{ label }}</CommitsSectionBadge>
      <svg
        class="chevron"
        :class="{ 'chevron-open': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div class="group-content" :class="{ open: isOpen }">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  label:       { type: String,  required: true },
  type:        { type: String,  default: 'new' },
  defaultOpen: { type: Boolean, default: false },
})

const isOpen = ref(props.defaultOpen)
</script>

<style scoped>
.group-item {
  border-bottom: 1px solid var(--border-color-1);
}

.group-header {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  user-select: none;
  text-align: left;
}

.chevron {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-left: auto;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-open {
  transform: rotate(180deg);
}

.group-content {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  margin: 0;
  transition:
    max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    opacity    0.35s ease 0.05s,
    margin     0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-content.open {
  max-height: 1000px;
  opacity: 1;
  margin: 0 0 0.25rem;
}

</style>
