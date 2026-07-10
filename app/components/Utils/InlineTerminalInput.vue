<script setup lang="ts">
// v-model-driven counterpart to HeroSection/CommandLine.vue's #cmd-input:
// a bare <input> styled to blend into surrounding text, sized to its own
// content via CSS `field-sizing`, with a `ch`-width fallback for browsers
// that don't support it yet.
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  ariaLabel?: string
}>(), {
  placeholder: '',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  enter: [event: KeyboardEvent]
}>()

const supportsFieldSizing = ref(true)

onMounted(() => {
  supportsFieldSizing.value = CSS.supports('field-sizing', 'content')
})

const fallbackWidth = computed(() => {
  const len = Math.max(props.modelValue.length, props.placeholder.length, 1)
  return `${len}ch`
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :value="modelValue"
    type="text"
    class="inline-terminal-input"
    :style="supportsFieldSizing ? undefined : { width: fallbackWidth }"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    @input="onInput"
    @keydown.enter="emit('enter', $event)"
  >
</template>
