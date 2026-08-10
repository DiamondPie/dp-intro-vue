<template>
  <section id="friends" class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <div class="animate-fadeIn">
      <h2 class="lg:text-4xl text-2xl mb-8 flex items-center gap-4 uppercase">
        <span class="font-extrabold">{{ $t('friends.title') }}</span>
      </h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a
            v-for="(friend, index) in friends"
            :key="friend.href"
            :href="friend.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center rounded-2xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden bg-[var(--content-1)] hover:bg-[var(--content-1-hover)]"
            :style="`animation: 0.6s ease-out ${index * 0.1}s 1 normal both running scaleIn`"
          >
            <div class="relative z-10 flex items-center gap-4">
              <div
                class="shrink-0 rounded-full w-12 h-12 bg-[var(--content-1)] overflow-hidden"
              >
                <img
                  alt=""
                  class="w-[inherit] h-[inherit] object-cover transition-opacity duration-500 ease-in-out opacity-100"
                  :src="friend.avatar"
                  loading="lazy"
                >
              </div>
              <div class="flex flex-col min-w-0 gap-1">
                <h3 class="text-sm font-bold truncate">{{ friend.name }}</h3>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p v-if="friend.desc" class="text-xs" style="color: var(--color-gray-400)" v-html="friend.desc" />
              </div>
            </div>
          </a>
        </div>
        <FriendInvite />
      </div>
    </div>
  </section>
</template>

<script setup>
import FriendInvite from './FriendsSection/FriendInvite.vue'

const friends = [
  {
    href: 'https://github.com/diamondPiesdad',
    name: 'Void Magician',
    avatar: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/friends/void_magician.webp',
    desc: '<del>DiamondPiesDad</del>'
  },
  {
    href: 'https://github.com/70RCH',
    name: '70RCH',
    avatar: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/friends/70rch.webp',
  },
  {
    href: 'https://github.com/niuniu12341234',
    name: 'Niuniu12341234',
    avatar: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/friends/niuniu12341234.webp',
  }
]
</script>