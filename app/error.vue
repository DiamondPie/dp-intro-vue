<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.status ?? 404)
const is403 = computed(() => statusCode.value === 403)

useHead({
  title: computed(() => `${statusCode.value} — DiamondPie`),
  style: [{ id: 'error-page-overflow', innerHTML: 'html,body{overflow:hidden!important}' }],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap'
    }
  ]
})

const promptPath = ref('~')
const promptFilename = ref('')
const logTime = ref('')

onMounted(() => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  logTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  const pathname = window.location.pathname
  const parts = pathname.split('/').filter(Boolean)
  let dir = '/'
  let filename = is403.value ? 'restricted_data.bin' : 'index.html'

  if (parts.length > 0) {
    const last = parts[parts.length - 1]!
    const looksLikeFile = last.includes('.') || !pathname.endsWith('/')
    if (looksLikeFile && last.includes('.')) {
      filename = last
      dir = '/' + parts.slice(0, -1).join('/')
      if (dir !== '/') dir += '/'
    } else if (looksLikeFile) {
      filename = last
      dir = '/' + parts.slice(0, -1).join('/')
      if (dir !== '/') dir += '/'
    } else {
      dir = '/' + parts.join('/') + '/'
      filename = is403.value ? '.env' : 'index.html'
    }
  }

  promptPath.value = '~' + (dir === '/' ? '' : dir.replace(/\/$/, ''))
  promptFilename.value = filename
})

function goHome() {
  clearError({ redirect: '/' })
}

function goBack() {
  window.history.back()
}
</script>

<template>
  <div class="scanlines" aria-hidden="true" />

  <div
    class="relative z-10 flex h-screen items-center justify-center gap-[10vw] overflow-hidden p-10 max-[700px]:flex-col max-[700px]:gap-[10vh] max-[700px]:text-center"
  >
    <!-- Glitch error number -->
    <div class="shrink-0">
      <div class="error-num" :data-code="statusCode">{{ statusCode }}</div>
    </div>

    <!-- Terminal panel -->
    <div class="terminal-panel max-w-[520px]">

      <!-- Prompt: command line -->
      <div class="prompt-line animate-fadeInUp mb-4 opacity-70" style="animation-delay: 0.1s">
        <span style="color: var(--color-cyan)">user@diamondpie</span
        ><span style="color: var(--color-gray-500)">:</span
        ><span style="color: var(--color-purple)">{{ promptPath }}</span
        ><span style="color: var(--color-gray-500)">$</span>
        <span class="ml-2">
          <template v-if="!is403">find . -name <span style="color: var(--color-pink)">"{{ promptFilename }}"</span></template>
          <template v-else>sudo cat <span style="color: var(--color-pink)">"{{ promptFilename }}"</span></template>
        </span>
      </div>

      <!-- Prompt: sudo password (403 only) -->
      <div
        v-if="is403"
        class="prompt-line animate-fadeInUp -mt-2.5 mb-6 opacity-70"
        style="animation-delay: 0.2s"
      >
        <span style="color: var(--color-gray-500)">[sudo] password for user: </span>
      </div>

      <!-- Title -->
      <h1
        class="title-line animate-fadeInUp mb-5 leading-[1.1]"
        :style="{ animationDelay: is403 ? '0.3s' : '0.2s' }"
      >
        <span style="color: var(--text-secondary)">&gt;</span
        ><span v-if="!is403">PageNotFound</span
        ><span v-else>AccessDenied</span>
      </h1>

      <!-- Comment -->
      <p
        class="comment-line animate-fadeInUp mb-6"
        :style="{ animationDelay: is403 ? '0.4s' : '0.5s' }"
      >
        <span class="mr-2">//</span>
        <span v-if="!is403">The path you're looking for doesn't exist 👀</span>
        <span v-else>You don't have the required clearance for this sector 🛑</span>
      </p>

      <!-- Log block -->
      <div
        class="log-block animate-fadeInUp mb-7 rounded-md border leading-loose max-[700px]:text-left"
        :style="{
          background: 'var(--content-1)',
          borderColor: 'var(--border-color-1)',
          animationDelay: is403 ? '0.5s' : '0.6s'
        }"
      >
        <template v-if="!is403">
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-red)">[ERROR]</span>
            <span>Route mismatched: returning 404</span>
          </div>
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-pink)">[WARN]</span>
            <span>&nbsp;No fallback handler registered for this path</span>
          </div>
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-cyan)">[INFO]</span>
            <span>&nbsp;Suggestion: navigate back to home <span style="color: var(--color-purple)">~</span></span>
          </div>
          <div class="mt-0.5 flex gap-3">
            <span class="shrink-0">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span style="color: var(--color-gray-500)">exit code <span style="color: var(--color-red)">1</span>&nbsp; ■</span>
          </div>
        </template>

        <template v-else>
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-red)">[ERROR]</span>
            <span>EACCES: Permission denied.</span>
          </div>
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-pink)">[WARN]</span>
            <span>User is not in the sudoers file.</span>
          </div>
          <div class="flex gap-3">
            <span class="shrink-0" style="color: var(--color-gray-500)">{{ logTime }}</span>
            <span style="color: var(--color-pink)">[WARN]</span>
            <span>Connection forcibly closed.</span>
          </div>
          <div class="mt-0.5 flex gap-3">
            <span class="shrink-0">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span style="color: var(--color-gray-500)">exit code <span style="color: var(--color-red)">13</span>&nbsp; ■</span>
          </div>
        </template>
      </div>

      <!-- Action buttons -->
      <div
        class="animate-fadeInUp flex flex-wrap gap-3 max-[700px]:justify-center"
        :style="{ animationDelay: is403 ? '0.65s' : '0.75s' }"
      >
        <a class="home primary" href="/" @click.prevent="goHome">
          ~ (home)
          <span class="arrow ml-2 inline-block transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="display: block">
              <g fill="none">
                <path d="M24 0v24H0V0z" />
                <path fill="currentColor" d="m15.06 5.283 5.657 5.657a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 0 1-2.122-2.122l3.096-3.096H4.5a1.5 1.5 0 0 1 0-3h11.535L12.94 7.404a1.5 1.5 0 0 1 2.122-2.121Z" />
              </g>
            </svg>
          </span>
        </a>
        <a class="home" href="#" @click.prevent="goBack">← go back</a>
      </div>

    </div>
  </div>
</template>

<!-- Extend :root with tokens absent from main.css -->
<style>
:root {
  --color-pink: #f0a8c0;
  --color-red:  #e05c5c;
}
</style>

<style scoped>
/* ── Scanlines overlay ── */
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.05) 3px,
    rgba(0, 0, 0, 0.05) 4px
  );
  pointer-events: none;
  z-index: 100;
}

/* ── Glitch error number ── */
.error-num {
  font-family: 'Space Mono', Courier, monospace;
  font-weight: 900;
  font-size: clamp(90px, 13vw, 168px);
  line-height: 1;
  letter-spacing: -4px;
  color: var(--text-primary);
  position: relative;
  display: inline-block;
  user-select: none;
}

.error-num::before,
.error-num::after {
  content: attr(data-code);
  position: absolute;
  top: 0;
  left: 0;
}

.error-num::before {
  color: var(--color-cyan);
  clip-path: polygon(0 15%, 100% 15%, 100% 38%, 0 38%);
  animation: glitch-a 3.5s infinite steps(1);
}

.error-num::after {
  color: var(--color-pink);
  clip-path: polygon(0 62%, 100% 62%, 100% 82%, 0 82%);
  animation: glitch-b 3.5s infinite steps(1);
}

@keyframes glitch-a {
  0%, 88%, 100% { transform: translate(0); opacity: 0; }
  90% { transform: translate(-5px, 2px); opacity: 1; }
  93% { transform: translate(4px, -1px); opacity: 1; }
  95% { opacity: 0; }
}

@keyframes glitch-b {
  0%, 83%, 100% { transform: translate(0); opacity: 0; }
  85% { transform: translate(5px, 1px); opacity: 1; }
  88% { transform: translate(-3px, -2px); opacity: 1; }
  90% { opacity: 0; }
}

/* ── Terminal text — clamp sizes not expressible in Tailwind ── */
.terminal-panel {
  font-family: 'Google Sans Code', monospace;
  font-size: clamp(0.65rem, 1.2vw, 0.875rem);
}

.title-line {
  font-size: clamp(1.8rem, 4.5vw, 3.75rem);
  font-weight: 800;
  color: var(--text-primary);
}

.comment-line {
  font-size: clamp(0.65rem, 1.2vw, 0.875rem);
  letter-spacing: 0.02em;
  color: var(--color-gray-500);
  cursor: default;
  transition: color 0.2s;
}

.log-block {
  padding: 14px 18px;
  font-size: clamp(0.6rem, 1vw, 0.75rem);
}

/* ── Pill buttons ── */
.home {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 9999px;
  background: var(--content-1);
  border: 1px solid var(--border-color-1);
  color: var(--text-primary);
  font-family: 'Google Sans Code', monospace;
  font-size: clamp(0.7rem, 1.1vw, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.home:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.18);
}

.home.primary {
  background: var(--text-primary);
  color: var(--color-black);
  border-color: var(--text-primary);
}

.home.primary:hover {
  background: #ccc;
  border-color: #ccc;
}

.home:hover .arrow {
  transform: translateX(4px);
}
</style>
