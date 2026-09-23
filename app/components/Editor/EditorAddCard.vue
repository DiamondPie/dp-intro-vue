<script setup lang="ts">
// Dashed "+ add" placeholder that closes every editable grid. Size it from the
// parent via `class` (it falls through to the button); it deliberately lacks
// `.editor-card` so Sortable never treats it as a list item.
defineProps<{ label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="editor-add-card rounded-2xl flex flex-col items-center justify-center gap-2 font-mono text-sm"
    @click="$emit('click')"
  >
    <Icon name="mdi:plus" class="text-3xl" />
    {{ label }}
  </button>
</template>

<style scoped>
.editor-add-card {
  color: var(--text-secondary);
  border: 1px dashed var(--border-color-2);
  background: transparent;
  transition: color var(--transition-base), border-color var(--transition-base), background var(--transition-base);
}

.editor-add-card:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: color-mix(in oklab, var(--accent-primary), transparent 92%);
}
</style>
