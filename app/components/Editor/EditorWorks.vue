<script setup lang="ts">
// Edit-mode counterpart of PathwaySection/Works.vue: the same card grid, but
// each card is a form bound straight onto the shared `siteContent` draft.
// Only ever rendered client-side, after `useEditor().init()` found a token.
import { useSortable } from '@vueuse/integrations/useSortable'
import { siteContent } from '~/composables/useSiteContent'

const { works } = useSiteContent()
const { t } = useI18n()

const grid = ref<HTMLElement | null>(null)
// Writable, not the read-only computed from useSiteContent: given a ref,
// useSortable copies the array and assigns the reordered copy back through
// `.value`, which a read-only computed drops silently (DOM moves, data doesn't).
// Always resolving through `siteContent` also survives the document being
// replaced by load / discard / save while this component is mounted.
const sortableWorks = computed({
  get: () => works.value,
  set: (list) => { siteContent.value.works = list },
})
useSortable(grid, sortableWorks, {
  handle: '.editor-drag-handle',
  draggable: '.editor-work-card',
  animation: 150,
  forceFallback: true, // mouse/touch events instead of native DnD: consistent ghost, works on mobile
  ghostClass: 'editor-sortable-ghost',
})

function addWork() {
  works.value.push({
    id: `work-${Date.now().toString(36)}`,
    href: '',
    image: '',
    title: { en: '', zh: '' },
    desc: { en: '', zh: '' },
  })
}

function removeWork(index: number) {
  works.value.splice(index, 1)
}

const isBlank = (value: string) => value.trim().length === 0
</script>

<template>
  <div ref="grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="(work, index) in works"
      :key="work.id"
      class="editor-work-card rounded-2xl overflow-hidden relative min-h-[20rem] md:aspect-[4/3] flex flex-col bg-[var(--content-1)]"
    >
      <div class="absolute inset-0 z-0">
        <img
          v-if="!isBlank(work.image)"
          alt=""
          class="w-full h-full object-cover opacity-100"
          :src="work.image"
          loading="lazy"
        >
      </div>

      <div class="relative z-10 flex items-center justify-end gap-1 p-3">
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
          @click="removeWork(index)"
        >
          <Icon name="mdi:trash-can-outline" class="text-xl" />
        </button>
      </div>

      <div class="relative z-10 mt-auto">
        <div class="absolute -left-[2px] -right-[2px] -bottom-[2px] -top-24 z-[-1] bg-gradient-to-t from-black/90 via-black/70" />
        <div class="p-6 flex flex-col gap-1.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xl font-bold">
            <EditorInput v-model="work.title.en" tag="en" :placeholder="t('editor.work_title')" />
            <EditorInput v-model="work.title.zh" tag="zh" :placeholder="t('editor.work_title')" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/80">
            <EditorInput v-model="work.desc.en" tag="en" :placeholder="t('editor.work_desc')" />
            <EditorInput v-model="work.desc.zh" tag="zh" :placeholder="t('editor.work_desc')" />
          </div>
          <div class="text-xs mt-1" style="color: var(--text-secondary)">
            <EditorInput v-model="work.href" tag="href" mono placeholder="https://" :invalid="isBlank(work.href)" />
            <EditorInput v-model="work.image" tag="img" mono placeholder="https://" :invalid="isBlank(work.image)" />
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="editor-add-card rounded-2xl min-h-[20rem] md:aspect-[4/3] flex flex-col items-center justify-center gap-2 font-mono text-sm"
      @click="addWork"
    >
      <Icon name="mdi:plus" class="text-3xl" />
      {{ t('editor.add_work') }}
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

.editor-sortable-ghost {
  opacity: 0.35;
  outline: 1px dashed var(--accent-primary);
}
</style>
