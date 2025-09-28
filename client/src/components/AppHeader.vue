<template>
  <header class="bg-transparent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 text-stone-700 hover:text-stone-900" @click="onBackClick">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <span class="text-sm font-medium">Home</span>
      </RouterLink>
      <div v-if="show_play_button">
        <RouterLink to="/play">
          <Button variant="orange" size="sm">Play Now</Button>
        </RouterLink>
      </div>
    </div>
  </header>
  
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
const props = defineProps<{ show_play_button?: boolean, intercept_back?: boolean }>()
const emit = defineEmits<{ (e: 'back'): void }>()
const router = useRouter()

const onBackClick = (e: MouseEvent) => {
  if (props.intercept_back) {
    e.preventDefault()
    emit('back')
    return
  }
  // default navigates via RouterLink
}
</script>


