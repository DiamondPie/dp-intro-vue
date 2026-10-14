<template>
  <!--
    Fixed announcement banner. Stays visible until the visitor clicks the
    cross; the dismissal is remembered in localStorage under a key tied to
    NOTICE_ID, so bumping NOTICE_ID re-shows the banner for a new notice.
    Rendered only after mount (localStorage is client-only) to avoid an
    SSR flash for visitors who already dismissed it.
    To post a notice: set NOTICE_ID / NOTICE_DATE below and fill in
    notice.body (and optionally notice.apology) in the locale files.
    Leave NOTICE_ID empty when there is no active notice.
  -->
  <Transition name="notice">
    <div
      v-if="visible"
      role="alert"
      class="notice-banner fixed top-4 inset-x-4 z-[60] mx-auto max-w-3xl flex items-start gap-4 rounded-2xl pl-4 pr-3 py-3.5 backdrop-blur-md"
    >
      <span class="notice-icon shrink-0 flex items-center justify-center w-9 h-9 rounded-full">
        <Icon name="mdi:alert-circle-outline" class="text-xl" width="1em" height="1em" />
      </span>
      <div class="flex-1 min-w-0">
        <span class="notice-date inline-flex items-center gap-1 mb-1 font-mono">
          <Icon name="mdi:clock-outline" width="1em" height="1em" />
          {{ $t('notice.updated', { date: NOTICE_DATE }) }}
        </span>
        <p class="notice-text font-medium">{{ $t('notice.body') }}</p>
        <p v-if="$t('notice.apology')" class="notice-text notice-sub mt-1">{{ $t('notice.apology') }}</p>
      </div>
      <button
        type="button"
        :aria-label="$t('notice.close')"
        class="notice-close shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
        @click="dismiss"
      >
        <Icon name="mdi:close" class="text-lg" width="1em" height="1em" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
// Empty = no active notice; the banner never renders.
const NOTICE_ID = ''
const NOTICE_DATE = ''
const STORAGE_KEY = `notice-dismissed:${NOTICE_ID}`

const visible = ref(false)

onMounted(() => {
  if (!NOTICE_ID) return
  let dismissed = false
  try {
    dismissed = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // Storage unavailable (private mode / blocked) — just show the banner
  }
  visible.value = !dismissed
})

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Storage unavailable — dismissal lasts for this page view only
  }
}
</script>

<style scoped>
.notice-banner {
  color: #fff;
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.95), rgba(183, 28, 28, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 12px 32px -8px rgba(220, 38, 38, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.notice-icon {
  background: rgba(255, 255, 255, 0.16);
}

.notice-date {
  font-size: 0.7rem;
  line-height: 1.4;
  color: #fff;
}

/* Override the global `p` colour / size / line-height from main.css */
.notice-text {
  color: #fff;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.notice-sub {
  font-size: 0.8125rem;
}

.notice-close {
  color: #fff;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.notice-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(90deg);
}

.notice-enter-active,
.notice-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
