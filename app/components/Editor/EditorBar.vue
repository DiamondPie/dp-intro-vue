<script setup lang="ts">
// Floating save bar for the in-page editor: dirty / validation state, explicit
// Save (no autosave — KV allows 1 write/s per key), publish progress from
// `/api/status` polling, and the exit control. Client-only via useEditor.
const editor = useEditor()
const { t } = useI18n()

const statusText = computed(() => {
  if (editor.loading.value) return t('editor.loading')
  const rev = editor.savedRevision.value ?? editor.revision.value
  switch (editor.phase.value) {
    case 'saving': return t('editor.saving')
    case 'publishing': return t('editor.publishing', { rev })
    case 'published': return t('editor.published', { rev })
    case 'no_hook': return t('editor.no_hook', { rev })
    case 'stalled': return t('editor.stalled', { rev })
    default: return t('editor.editing', { rev })
  }
})

const dotClass = computed(() => {
  if (editor.error.value || editor.phase.value === 'stalled') return 'is-danger'
  if (editor.phase.value === 'saving' || editor.phase.value === 'publishing') return 'is-busy'
  if (editor.dirty.value) return 'is-dirty'
  if (editor.phase.value === 'published') return 'is-ok'
  return ''
})

const errorText = computed(() => {
  const err = editor.error.value
  if (!err) return ''
  switch (err.kind) {
    case 'conflict': return t('editor.conflict')
    case 'unauthorized': return t('editor.unauthorized')
    case 'load': return t('editor.load_failed', { msg: err.message })
    default: return t('editor.save_failed', { msg: err.message })
  }
})

function exit() {
  editor.exit(t('editor.discard_confirm'))
}
</script>

<template>
  <div class="editor-bar fixed z-50 bottom-6 left-4 right-20 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-[calc(100vw-2rem)]">
    <div class="editor-bar-inner flex flex-col gap-2 px-4 py-3 rounded-2xl font-mono text-xs">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="editor-dot shrink-0" :class="dotClass" aria-hidden="true" />
        <span class="editor-status min-w-0 flex-1" style="color: var(--text-secondary)">{{ statusText }}</span>

        <span v-if="editor.problems.value.length" class="editor-chip is-danger">
          {{ t('editor.invalid', { n: editor.problems.value.length }) }}
        </span>
        <span v-else-if="editor.dirty.value" class="editor-chip">
          {{ t('editor.dirty') }}
        </span>

        <div class="flex items-center gap-1.5 ml-auto">
          <button
            v-if="editor.dirty.value"
            type="button"
            class="editor-btn"
            :disabled="editor.phase.value === 'saving'"
            @click="editor.discard()"
          >
            {{ t('editor.discard') }}
          </button>
          <button
            type="button"
            class="editor-btn editor-btn-primary"
            :disabled="!editor.canSave.value"
            @click="editor.save()"
          >
            <Icon v-if="editor.phase.value === 'saving'" name="mdi:loading" class="animate-spin" />
            <Icon v-else name="mdi:content-save-outline" />
            {{ t('editor.save') }}
          </button>
          <button
            type="button"
            class="editor-btn editor-btn-icon"
            :title="t('editor.exit')"
            :aria-label="t('editor.exit')"
            @click="exit"
          >
            <Icon name="mdi:close" />
          </button>
        </div>
      </div>

      <div v-if="errorText" class="flex items-center gap-3 flex-wrap" style="color: var(--color-danger)">
        <span class="min-w-0 flex-1">{{ errorText }}</span>
        <button
          v-if="editor.error.value?.kind === 'conflict' || editor.error.value?.kind === 'load'"
          type="button"
          class="editor-btn"
          @click="editor.reload()"
        >
          {{ t('editor.reload') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-bar-inner {
  background: color-mix(in oklab, var(--color-black) 80%, transparent);
  border: 1px solid var(--border-color-2);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-primary);
}

.editor-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  background: var(--text-tertiary);
  transition: background var(--transition-base);
}

.editor-dot.is-dirty { background: var(--accent-primary); }
.editor-dot.is-busy { background: var(--accent-secondary); animation: editor-pulse 1.2s ease-in-out infinite; }
.editor-dot.is-ok { background: var(--color-success); }
.editor-dot.is-danger { background: var(--color-danger); }

@keyframes editor-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.editor-chip {
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  color: var(--accent-primary);
  background: color-mix(in oklab, var(--accent-primary), transparent 88%);
  white-space: nowrap;
}

.editor-chip.is-danger {
  color: var(--color-danger);
  background: color-mix(in oklab, var(--color-danger), transparent 88%);
}

.editor-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color-1);
  background: var(--content-1);
  color: var(--text-primary);
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
}

.editor-btn:hover:not(:disabled) {
  background: var(--content-2);
  border-color: var(--border-color-2);
}

.editor-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.editor-btn-primary {
  background: color-mix(in oklab, var(--accent-primary), transparent 80%);
  border-color: color-mix(in oklab, var(--accent-primary), transparent 50%);
  color: var(--accent-primary);
}

.editor-btn-primary:hover:not(:disabled) {
  background: color-mix(in oklab, var(--accent-primary), transparent 65%);
  border-color: var(--accent-primary);
}

.editor-btn-icon {
  padding: 0.4rem;
}
</style>
