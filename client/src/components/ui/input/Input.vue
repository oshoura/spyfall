<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  modelValue?: string
  type?: string
  class?: string
  disabled?: boolean
  error?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  class: '',
  disabled: false,
  error: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputClass = computed(() => {
  return cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
      'border-destructive': props.error
    },
    props.class
  )
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :class="inputClass"
    :disabled="disabled"
    @input="updateValue"
  />
</template> 