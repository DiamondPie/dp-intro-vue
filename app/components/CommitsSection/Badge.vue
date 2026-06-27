<template>
  <span class="badge" :class="typeClass" :style="customStyle">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type:  { type: String, default: '' },
  color: { type: String, default: '' },
})

const typeClass = computed(() => {
  if (props.color) return 'badge-custom'
  if (props.type)  return `badge-${props.type}`
  return ''
})

const customStyle = computed(() =>
  props.color ? { '--badge-color': props.color } : {}
)
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Custom color: derive tinted background from the provided color */
.badge-custom {
  background: color-mix(in oklab, var(--badge-color), transparent 88%);
  color: var(--badge-color);
}

/* Presets */
.badge-new    { background: rgb(22  163  74 / 0.1); color: rgb(134 239 172); }
.badge-update { background: rgb(2   132 199 / 0.1); color: rgb(125 211 252); }
.badge-fix    { background: rgb(217 119   6 / 0.1); color: rgb(252 211  77); }
</style>
