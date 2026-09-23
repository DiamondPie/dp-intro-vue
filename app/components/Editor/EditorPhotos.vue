<script setup lang="ts">
// Edit-mode counterpart of AboutSection/PhotoGrid.vue. The live grid is a CSS
// masonry (`columns-*`); editing uses a plain grid instead so cards keep a
// predictable order and size while dragging.
interface Photo {
  id: string
  src: string
  caption: { en: string, zh: string }
}

const { t } = useI18n()
const { list: photos, grid, add, remove } = useEditorList<Photo>('photos')

function addPhoto() {
  add({ src: '', caption: { en: '', zh: '' } })
}

const isBlank = (value: string) => value.trim().length === 0
</script>

<template>
  <div ref="grid" class="!mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="(photo, index) in photos"
      :key="photo.id"
      class="editor-card rounded-2xl overflow-hidden relative flex flex-col bg-[var(--content-1)]"
    >
      <div class="relative aspect-[4/3]">
        <img
          v-if="!isBlank(photo.src)"
          alt=""
          class="absolute inset-0 w-full h-full object-cover opacity-100"
          :src="photo.src"
          loading="lazy"
        >
        <EditorCardControls class="absolute top-2 right-2" @delete="remove(index)" />
      </div>
      <div class="p-3 flex flex-col gap-1 text-sm font-medium">
        <EditorInput v-model="photo.caption.en" tag="en" :placeholder="t('editor.photo_caption')" />
        <EditorInput v-model="photo.caption.zh" tag="zh" :placeholder="t('editor.photo_caption')" />
        <div class="text-xs mt-1" style="color: var(--text-secondary)">
          <EditorInput v-model="photo.src" tag="src" mono placeholder="https://" :invalid="isBlank(photo.src)" />
        </div>
      </div>
    </div>

    <EditorAddCard class="min-h-[12rem]" :label="t('editor.add_photo')" @click="addPhoto" />
  </div>
</template>
