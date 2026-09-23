<script setup lang="ts">
// Edit-mode counterpart of the friend grid in FriendsSection.vue. `desc` is
// rendered with v-html on the live site (site-owner content), so inline HTML
// is allowed there — the placeholder says so.
interface Friend {
  id: string
  href: string
  avatar: string
  name: string
  desc: { en: string, zh: string }
}

const { t } = useI18n()
const { list: friends, grid, add, remove } = useEditorList<Friend>('friends')

function addFriend() {
  add({ href: '', avatar: '', name: '', desc: { en: '', zh: '' } })
}

const isBlank = (value: string) => value.trim().length === 0
</script>

<template>
  <div ref="grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <div
      v-for="(friend, index) in friends"
      :key="friend.id"
      class="editor-card rounded-2xl p-4 relative flex flex-col gap-3 bg-[var(--content-1)]"
    >
      <div class="flex items-start gap-4">
        <div class="shrink-0 rounded-full w-12 h-12 bg-[var(--content-2)] overflow-hidden">
          <img
            v-if="!isBlank(friend.avatar)"
            alt=""
            class="w-[inherit] h-[inherit] object-cover opacity-100"
            :src="friend.avatar"
            loading="lazy"
          >
        </div>
        <div class="min-w-0 flex-1 text-sm font-bold">
          <EditorInput v-model="friend.name" tag="name" :placeholder="t('editor.friend_name')" :invalid="isBlank(friend.name)" />
        </div>
        <EditorCardControls @delete="remove(index)" />
      </div>
      <div class="flex flex-col gap-1 text-xs" style="color: var(--color-gray-400)">
        <EditorInput v-model="friend.desc.en" tag="en" :placeholder="t('editor.friend_desc')" />
        <EditorInput v-model="friend.desc.zh" tag="zh" :placeholder="t('editor.friend_desc')" />
      </div>
      <div class="flex flex-col gap-1 text-xs" style="color: var(--text-secondary)">
        <EditorInput v-model="friend.href" tag="href" mono placeholder="https://" :invalid="isBlank(friend.href)" />
        <EditorInput v-model="friend.avatar" tag="img" mono placeholder="https://" :invalid="isBlank(friend.avatar)" />
      </div>
    </div>

    <EditorAddCard class="min-h-[10rem]" :label="t('editor.add_friend')" @click="addFriend" />
  </div>
</template>
