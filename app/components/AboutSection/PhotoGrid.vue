<template>
  <ClientOnly v-if="editor.enabled.value">
    <LazyEditorPhotos />
  </ClientOnly>
  <div v-else class="!mt-8 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
    <a
      v-for="photo in photos"
      :key="photo.id"
      :href="photo.src"
      target="_blank"
      rel="noopener noreferrer"
      class="relative block group overflow-hidden rounded-2xl break-inside-avoid cursor-zoom-in"
    >
      <img
        alt=""
        class="w-full h-[60%] object-cover duration-[600ms] group-hover:scale-105 ease-in-out opacity-100"
        :src="photo.src"
        loading="lazy"
      >
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
      >
        <p class="text-white/90 text-sm font-medium">{{ pick(photo.caption) }}</p>
      </div>
    </a>
  </div>
</template>

<script setup>
const { photos, pick } = useSiteContent()
const editor = useEditor()
</script>