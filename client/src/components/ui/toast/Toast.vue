<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ToastRoot, type ToastRootEmits, useForwardPropsEmits } from 'reka-ui'
import { computed } from 'vue'
import { type ToastProps, toastVariants } from '.'

const props = defineProps<ToastProps>()

const emits = defineEmits<ToastRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Function to explicitly close the toast by emitting the update event
function handleClose() {
  if (props.onOpenChange) {
    props.onOpenChange(false)
  }
}
</script>

<template>
  <ToastRoot
    v-bind="forwarded"
    :class="cn(toastVariants({ variant }), props.class)"
    @update:open="onOpenChange"
    @click="handleClose"
  >
    <slot />
  </ToastRoot>
</template>
