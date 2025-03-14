<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'orange' | 'white'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  class?: string
  disabled?: boolean
  type?: ButtonHTMLAttributes['type']
}>(), {
  variant: 'default',
  size: 'default',
  class: '',
  disabled: false,
  type: 'button'
})

const buttonClass = computed(() => {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': props.variant === 'default',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90': props.variant === 'destructive',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground': props.variant === 'outline',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': props.variant === 'secondary',
      'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
      'text-primary underline-offset-4 hover:underline': props.variant === 'link',
      'bg-orange-500 text-white hover:bg-orange-600 border-none': props.variant === 'orange',
      'bg-white text-orange-600 hover:bg-stone-100 border-none': props.variant === 'white',
      'h-10 px-4 py-2': props.size === 'default',
      'h-9 rounded-md px-3': props.size === 'sm',
      'h-11 rounded-md px-8': props.size === 'lg',
      'h-10 w-10': props.size === 'icon',
    },
    props.class
  )
})
</script>

<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled"
  >
    <slot />
  </button>
</template> 