<template>
  <!--
    Interactive command-line block. The terminal-like prompt is real input
    (`#cmd-input`) backed by the registry of supported commands; the
    headline below it (`#diamondpie`) is the typewriter target.

    `font-mono fw-800` (UnoCSS) → `font-mono font-extrabold` (Tailwind).

    The structure is exactly the original: a colourful prompt line, the
    title-line headline, a ISFJ/UoA badge row, a quote blockquote and the
    sub-text under it. This component intentionally renders only the
    "text column" of the hero — the buttons live in the parent.
  -->
  <div>
    <div
      class="mb-2 lg:mb-4 animate-fadeInUp font-mono text-xs lg:text-sm opacity-70"
      style="animation-delay: 0.1s;"
    >
      <span style="color: var(--color-cyan);">user@diamondpie</span><span style="color: var(--color-gray-500);">:</span><span style="color: var(--color-purple);">{{ $t('hero.terminal_path') }}</span><span style="color: var(--color-gray-500);">$</span><span class="cmd-line ml-2">
        <input
          id="cmd-input"
          class="cmd-editable"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          value="whoami"
          maxlength="16"
        >
        <span id="cmd-ghost" class="cmd-ghost" />
        <span id="cmd-parameter" class="cmd-parameter" />
        <span id="cmd-enter-hint" class="cmd-enter-hint">↵</span>
      </span>
    </div>

    <!-- Headline (typewriter target lives inside #diamondpie) -->
    <h1
      class="mb-4 lg:mb-6 animate-fadeInUp text-[var(--text-primary)] text-4xl lg:text-6xl font-mono font-extrabold title-line"
      style="animation-delay: 0.2s;"
    >
      <span class="text-[var(--text-secondary)]">&gt;</span><span id="diamondpie" data-content="DiamondPie" /><span class="text-[var(--accent-primary)] animate-blink">_</span>
    </h1>

    <p
      class="text-base lg:text-lg mb-2 lg:mb-4 animate-fadeInUp font-mono whitespace-nowrap"
      style="animation-delay: 0.3s; color: var(--text-primary);"
    >
      <span style="color: var(--text-secondary);">[</span>
      Student <span style="color: var(--text-secondary);">|</span>
      UoA <span style="color: var(--text-secondary);">|&nbsp;</span>
      <a href="https://www.16personalities.com/isfj-personality" target="_blank">ISFJ-A</a> <span style="color: var(--text-secondary);">]</span>
    </p>

    <blockquote
      class="text-base lg:text-lg font-mono mb-2 lg:mb-4 px-4 py-2 animate-fadeInUp"
      style="animation-delay: 0.4s; border-left: 3px solid var(--color-purple); color: var(--text-primary);"
    >
      "No sorrow in falling - even stars burn out."
    </blockquote>

    <p
      class="text-xs lg:text-sm font-mono mb-6 animate-fadeInUp hover:text-[var(--color-cyan)]"
      style="animation-delay: 0.5s; color: var(--color-gray-500); letter-spacing: 0.02em;"
    >
      <span style="margin-right: 0.5rem;">//</span>{{ $t('hero.subtext') }}
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  /**
   * Terminal Interactive Homepage
   * Handles: typewriter effect, editable command input, tab completion,
   * command execution, and content transitions for #diamondpie.
   */

  // ─── Command Registry ───────────────────────────────────────────────────────
  const COMMANDS = {
    whoami: {
      content: 'DiamondPie',
      parameter: '',
      special: null
    },
    touch: {
      content: 'Write often!',
      parameter: 'diamondpie',
      special: {
        // Show enter icon after full command typed; on Enter key → open mailto
        showEnterHint: true,
        onEnter: () => {
          window.location.href = 'mailto:mymail@gmail.com'
        }
      }
    },
    top: {
      content: 'Online Forever',
      parameter: '',
      special: null
    },
    sudo: {
      content: 'Permission Denied',
      parameter: 'su',
      special: null
    },
    kill: {
      content: "Please don't...",
      parameter: '-9 -1',
      special: {
        showEnterHint: true,
        onEnter() {
          sessionStorage.setItem('killed', '1')
          location.reload()
        }
      }
    },
    df: {
      content: 'Full of Love and Passion',
      parameter: '--conclude',
      special: null
    },
    rm: {
      content: "Please don't...",
      parameter: '-rf ~/*',
      special: {
        showEnterHint: true,
        onEnter() {
          sessionStorage.setItem('killed', '1')
          location.reload()
        }
      }
    },
    ping: {
      content: 'Avg=6.7ms',
      parameter: window.location.hostname,
      special: null
    },
    echo: {
      content: 'I love u too <3',
      parameter: '"I love you"',
      special: null
    },
    help: {
      content: 'Few Linux Commands Supported',
      parameter: '',
      special: null
    },
    man: {
      content: 'No Place for Manuals!',
      parameter: '',
      special: null
    }
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  let currentContent = ''       // text currently shown inside #diamondpie
  let typeTimer = null          // handle for ongoing typewriter timeout
  let deleteTimer = null        // handle for ongoing delete timeout
  let isAnimating = false       // guard: true while type/delete in progress
  let activeCommand = null      // the matched command key (string) or null
  let enterHintVisible = false  // whether the ↵ hint is currently shown

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function randomDelay(base = 60, jitter = 35) {
    return base + Math.random() * jitter
  }

  function matchCommands(input) {
    // Returns all command keys that start with `input`
    if (!input) return []
    return Object.keys(COMMANDS).filter((k) => k.startsWith(input))
  }

  function exactMatch(input) {
    return Object.prototype.hasOwnProperty.call(COMMANDS, input) ? input : null
  }

  // ─── #diamondpie content management ─────────────────────────────────────────
  const diamondEl = document.getElementById('diamondpie')

  function clearTimers() {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null }
    if (deleteTimer) { clearTimeout(deleteTimer); deleteTimer = null }
  }

  /**
   * Delete characters one by one from #diamondpie, then call onDone.
   */
  function deleteContent(onDone) {
    clearTimers()
    isAnimating = true

    function step() {
      const txt = diamondEl.textContent
      if (txt.length === 0) {
        isAnimating = false
        currentContent = ''
        onDone && onDone()
        return
      }
      diamondEl.textContent = txt.slice(0, -1)
      deleteTimer = setTimeout(step, randomDelay(45, 30))
    }
    step()
  }

  /**
   * Type `text` into #diamondpie character by character, then call onDone.
   */
  function typeContent(text, onDone) {
    clearTimers()
    isAnimating = true
    let i = 0

    function step() {
      if (i < text.length) {
        diamondEl.textContent += text[i]
        i++
        typeTimer = setTimeout(step, randomDelay(60, 35))
      } else {
        isAnimating = false
        currentContent = text
        onDone && onDone()
      }
    }
    step()
  }

  /**
   * Set #diamondpie data-content and trigger the appropriate transition.
   * - If new content is empty: delete existing chars.
   * - If new content is non-empty: delete existing chars (if any), then type new.
   */
  function setDiamondContent(newContent) {
    diamondEl.dataset.content = newContent

    if (newContent === '') {
      // Just delete
      deleteContent()
    } else {
      // Delete existing then type
      const startTyping = () => {
        setTimeout(() => typeContent(newContent), 200)
      }

      if (diamondEl.textContent.length > 0) {
        deleteContent(startTyping)
      } else {
        startTyping()
      }
    }
  }

  // ─── Editable command area ───────────────────────────────────────────────────
  const cmdInput      = document.getElementById('cmd-input')
  const cmdGhost      = document.getElementById('cmd-ghost')       // tab-completion ghost text
  const cmdParameter  = document.getElementById('cmd-parameter')   // faded parameter after full command
  const cmdEnterHint  = document.getElementById('cmd-enter-hint')  // ↵ icon

  function updateGhost(inputVal) {
    const matches = matchCommands(inputVal)
    if (inputVal && matches.length > 0) {
      // Show the remainder of the first match as ghost text
      const remainder = matches[0].slice(inputVal.length)
      cmdGhost.textContent = remainder
      cmdGhost.style.opacity = '0.35'
    } else {
      cmdGhost.textContent = ''
    }
  }

  function updateRedState(inputVal) {
    const matches = matchCommands(inputVal)
    if (inputVal && matches.length === 0) {
      cmdInput.classList.add('cmd-no-match')
    } else {
      cmdInput.classList.remove('cmd-no-match')
    }
  }

  function showParameter(cmd) {
    const param = COMMANDS[cmd].parameter
    if (param) {
      cmdParameter.textContent = ' ' + param
      cmdParameter.style.opacity = '0'
      // Fade in
      requestAnimationFrame(() => {
        cmdParameter.style.transition = 'opacity 0.4s ease'
        cmdParameter.style.opacity = '0.6'
      })
    } else {
      cmdParameter.textContent = ''
    }
  }

  function hideParameter() {
    cmdParameter.style.transition = 'opacity 0.2s ease'
    cmdParameter.style.opacity = '0'
    setTimeout(() => { cmdParameter.textContent = '' }, 220)
  }

  function showEnterHint() {
    if (enterHintVisible) return
    enterHintVisible = true
    cmdEnterHint.style.opacity = '0'
    cmdEnterHint.style.display = 'inline'
    requestAnimationFrame(() => {
      cmdEnterHint.style.transition = 'opacity 0.4s ease'
      cmdEnterHint.style.opacity = '0.7'
    })
  }

  function hideEnterHint() {
    if (!enterHintVisible) return
    enterHintVisible = false
    cmdEnterHint.style.transition = 'opacity 0.2s ease'
    cmdEnterHint.style.opacity = '0'
    setTimeout(() => { cmdEnterHint.style.display = 'none' }, 220)
  }

  function onCommandComplete(cmd) {
    activeCommand = cmd
    // Set content
    setDiamondContent(COMMANDS[cmd].content)
    // Show parameter hint
    showParameter(cmd)
    // Special behaviour
    if (COMMANDS[cmd].special?.showEnterHint) {
      showEnterHint()
    }

    document.querySelector('.title-line').classList.toggle('title-compact', cmd !== 'whoami')
  }

  function onCommandCleared() {
    activeCommand = null
    hideParameter()
    hideEnterHint()
    setDiamondContent('')
    document.querySelector('.title-line').classList.add('title-compact')
  }

  // ─── Initial typewriter on page load ─────────────────────────────────────────
  // Input event handler
  cmdInput.addEventListener('keydown', (e) => {
    const val = cmdInput.value

    // ── Tab completion ──
    if (e.key === 'Tab' || (!exactMatch(val) && e.key === 'Enter')) {
      e.preventDefault()
      const matches = matchCommands(val)
      if (matches.length > 0 && !activeCommand) {
        cmdInput.value = matches[0]
        cmdGhost.textContent = ''
        updateRedState(matches[0])
        // Check if now a full command
        const cmd = exactMatch(matches[0])
        if (cmd) onCommandComplete(cmd)
      }
      return
    }

    // ── Enter key ──
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeCommand && COMMANDS[activeCommand].special?.onEnter) {
        COMMANDS[activeCommand].special.onEnter()
      }
      return
    }

    // ── Backspace ──
    if (e.key === 'Backspace') {
      if (activeCommand) {
        // When user starts deleting the completed command, clear content
        onCommandCleared()
      }
      // Allow default deletion
      // After deletion we'll re-evaluate in `input` event
      return
    }

    // ── Block space ──
    if (e.key === ' ') {
      e.preventDefault()
      return
    }
  })

  cmdInput.addEventListener('input', (e) => {
    if (activeCommand) {
      const before = cmdInput.dataset.lastValue ?? ''
      cmdInput.value = before
      return
    }
    cmdInput.dataset.lastValue = cmdInput.value
  })

  cmdInput.addEventListener('input', () => {
    // Strip any spaces that might have slipped through
    cmdInput.value = cmdInput.value.replace(/\s/g, '')

    const val = cmdInput.value

    if (!val) {
      // Empty input
      cmdGhost.textContent = ''
      cmdInput.classList.remove('cmd-no-match')
      if (activeCommand) onCommandCleared()
      return
    }

    const cmd = exactMatch(val)
    if (cmd && !activeCommand) {
      onCommandComplete(cmd)
      cmdGhost.textContent = '' // no ghost needed
      updateRedState(val)
      return
    }

    if (!activeCommand) {
      updateGhost(val)
      updateRedState(val)
    }
  })

  cmdInput.closest('div').addEventListener('click', function (e) {
    e.preventDefault()
    cmdInput.focus()
    const len = cmdInput.value.length
    if (cmdInput.setSelectionRange === undefined) {
      cmdInput.value = cmdInput.value
    } else {
      cmdInput.setSelectionRange(len, len)
    }
  })
  cmdInput.addEventListener('mousedown', (e) => e.preventDefault())
  // Set default command value
  cmdInput.value = 'whoami'
  activeCommand = 'whoami'

  // Initial type of "DiamondPie" after 1.2s delay (matches original)
  setTimeout(() => {
    typeContent('DiamondPie')
  }, 1200)
})
</script>

<style scoped>
/* ── Inline flex row that holds the whole "command line" ── */
.cmd-line {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-family: inherit;
  font-size: inherit;
}

/* ── The real (invisible-border) input ── */
.cmd-editable {
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font: inherit;
  field-sizing: content;
  color: var(--text-primary);
  caret-color: var(--text-primary);
  min-width: 1ch;
}

/* ── Ghost completion text (right of the caret) ── */
.cmd-ghost {
  color: var(--text-primary);
  opacity: 0.6;
  pointer-events: none;
  white-space: pre;
}

/* ── Parameter hint (faded, after the command) ── */
.cmd-parameter {
  color: var(--text-secondary);
  opacity: 0;
  pointer-events: none;
  white-space: pre;
}

/* ── Enter hint ↵ ── */
.cmd-enter-hint {
  display: none;
  font-weight: bold;
  margin-left: 0.5em;
  opacity: 0;
  color: var(--color-cyan, #22d3ee);
  font-size: 0.85em;
  pointer-events: none;
}

/* ── No-match: text turns red via CSS animation ── */
@keyframes cmdTurnRed {
  from { color: var(--text-primary); }
  to   { color: #f87171; }
}

.cmd-editable.cmd-no-match {
  animation: cmdTurnRed 0.35s ease forwards;
}

.cmd-editable:not(.cmd-no-match) {
  color: var(--text-primary);
}

/* ── Headline shrink when the user runs a non-whoami command ── */
.title-line {
  transition: font-size 0.3s ease;
}

.title-line.title-compact {
  font-size: clamp(1.5rem, 2.2vw, 2rem);
}
</style>