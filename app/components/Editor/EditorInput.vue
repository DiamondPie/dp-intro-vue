<script setup lang="ts">
// Block-level text field for the in-page editor: transparent, dashed underline,
// a small mono tag on the left (EN / ZH / href …). Sibling of
// Utils/InlineTerminalInput.vue — that one sizes to its content for inline
// use; this one fills its row so bilingual pairs line up on a card.
withDefaults(defineProps<{
  modelValue: string
  tag?: string
  placeholder?: string
  mono?: boolean
  invalid?: boolean
}>(), {
  tag: '',
  placeholder: '',
  mono: false,
  invalid: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="editor-field" :class="{ 'is-invalid': invalid }">
    <span v-if="tag" class="editor-field-tag font-mono">{{ tag }}</span>
    <input
      :value="modelValue"
      type="text"
      class="editor-field-input"
      :class="mono ? 'font-mono' : 'font-sans'"
      :placeholder="placeholder"
      :aria-label="tag || placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @input="onInput"
    >
  </label>
</template>

<style scoped>
.editor-field {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
  border-bottom: 1px dashed var(--border-color-2);
  transition: border-color var(--transition-fast);
}

.editor-field:focus-within {
  border-bottom-style: solid;
  border-bottom-color: var(--accent-primary);
}

.editor-field.is-invalid {
  border-bottom-color: var(--color-danger);
}

.editor-field-tag {
  flex: none;
  font-size: 0.625rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  user-select: none;
}

.editor-field:focus-within .editor-field-tag {
  color: var(--accent-primary);
}

.editor-field-input {
  flex: 1 1 auto;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.15rem 0;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  caret-color: var(--accent-primary);
}

.editor-field-input::placeholder {
  color: var(--text-tertiary);
}
</style>
