<script setup lang="ts">
// Drag handle + delete button shown in the corner of every editable card.
// `.editor-drag-handle` is the Sortable handle selector (see useEditorList).
defineEmits<{ delete: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <button
      type="button"
      class="editor-card-btn editor-drag-handle cursor-grab active:cursor-grabbing"
      :title="t('editor.drag')"
      :aria-label="t('editor.drag')"
    >
      <Icon name="mdi:drag" class="text-xl" />
    </button>
    <button
      type="button"
      class="editor-card-btn editor-card-btn-danger"
      :title="t('editor.delete')"
      :aria-label="t('editor.delete')"
      @click="$emit('delete')"
    >
      <Icon name="mdi:trash-can-outline" class="text-xl" />
    </button>
  </div>
</template>

<style scoped>
.editor-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: var(--radius-full);
  color: var(--text-primary);
  background: color-mix(in oklab, var(--color-black) 55%, transparent);
  border: 1px solid var(--border-color-1);
  backdrop-filter: blur(6px);
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.editor-card-btn:hover {
  border-color: var(--border-color-2);
  background: color-mix(in oklab, var(--color-black) 75%, transparent);
}

.editor-card-btn-danger:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
