<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ language }}</span>
      <button
        class="copy-btn"
        :aria-label="copied ? 'Copied' : 'Copy'"
        @click="handleCopy"
      >
        <svg v-if="copied" class="code-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg v-else class="code-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
    </div>
    <div class="code-body">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <pre class="code-pre"><code v-html="highlighted" /></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  code:     { type: String, required: true },
  language: { type: String, default: 'code' },
})

const copied = ref(false)

async function handleCopy() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.code)
    } else {
      const el = document.createElement('textarea')
      el.value = props.code
      el.style.cssText = 'position:absolute;left:-999999px'
      document.body.prepend(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'new', 'await', 'async', 'import', 'export', 'from', 'default',
  'class', 'extends', 'typeof', 'instanceof', 'of', 'in', 'delete', 'void',
  'true', 'false', 'null', 'undefined',
  'def', 'print', 'pass', 'and', 'or', 'not', 'is', 'lambda', 'with', 'as',
])

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Character-by-character tokeniser — correctly handles strings/comments
// before keywords, so keywords inside strings are never highlighted.
const highlighted = computed(() => {
  const src = props.code
  const out = []
  let i = 0
  const n = src.length

  while (i < n) {
    const ch = src[i]

    // Line comment (// or #)
    if ((ch === '/' && src[i + 1] === '/') || ch === '#') {
      const end = src.indexOf('\n', i)
      const slice = end === -1 ? src.slice(i) : src.slice(i, end)
      out.push(`<span class="ch-comment">${esc(slice)}</span>`)
      i += slice.length
      continue
    }

    // String literal: ", ', `
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue }
        if (src[j] === q)    { j++;    break    }
        j++
      }
      out.push(`<span class="ch-string">${esc(src.slice(i, j))}</span>`)
      i = j
      continue
    }

    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1
      while (j < n && /[\w$]/.test(src[j])) j++
      const word = src.slice(i, j)
      out.push(KEYWORDS.has(word)
        ? `<span class="ch-keyword">${word}</span>`
        : esc(word))
      i = j
      continue
    }

    // Number
    if (/\d/.test(ch)) {
      let j = i + 1
      while (j < n && /[\d.]/.test(src[j])) j++
      out.push(`<span class="ch-number">${src.slice(i, j)}</span>`)
      i = j
      continue
    }

    out.push(esc(ch))
    i++
  }

  return out.join('')
})
</script>

<style scoped>
.code-block {
  border: 1px solid var(--border-color-1);
  border-radius: 0.75rem;
  overflow: hidden;
  font-family: "Google Sans Code", monospace;
  font-size: 0.8125rem;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem 0.375rem 0.875rem;
  border-bottom: 1px solid var(--border-color-1);
  background: var(--content-1);
}

.code-lang {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3125rem;
  border-radius: 0.375rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.copy-btn:hover {
  color: var(--text-primary);
  background: var(--content-2);
}

.code-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.code-body {
  padding: 1rem;
  background: var(--bg-primary);
  overflow-x: auto;
}

.code-pre {
  margin: 0;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre;
}

:deep(.ch-keyword) { color: var(--accent-secondary); }
:deep(.ch-string)  { color: var(--accent-primary); }
:deep(.ch-comment) { color: var(--text-tertiary); font-style: italic; }
:deep(.ch-number)  { color: var(--accent-tertiary); }
</style>
