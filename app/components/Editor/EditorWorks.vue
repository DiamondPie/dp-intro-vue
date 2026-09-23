<script setup lang="ts">
// Edit-mode counterpart of PathwaySection/Works.vue: the same card grid, but
// each card is a form bound straight onto the shared `siteContent` draft.
// Only ever rendered client-side, after `useEditor().init()` found a token.
interface Work {
  id: string
  href: string
  image: string
  title: { en: string, zh: string }
  desc: { en: string, zh: string }
}

const { t } = useI18n()
const { list: works, grid, add, remove } = useEditorList<Work>('works')

function addWork() {
  add({ href: '', image: '', title: { en: '', zh: '' }, desc: { en: '', zh: '' } })
}

const isBlank = (value: string) => value.trim().length === 0
</script>

<template>
  <div ref="grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="(work, index) in works"
      :key="work.id"
      class="editor-card rounded-2xl overflow-hidden relative min-h-[20rem] md:aspect-[4/3] flex flex-col bg-[var(--content-1)]"
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

      <EditorCardControls class="relative z-10 p-3" @delete="remove(index)" />

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

    <EditorAddCard class="min-h-[20rem] md:aspect-[4/3]" :label="t('editor.add_work')" @click="addWork" />
  </div>
</template>
