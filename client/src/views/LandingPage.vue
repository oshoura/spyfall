<template>
  <div class="min-h-screen bg-gray-50 py-12 md:py-16">
    <AppHeader />
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <img src="/images/spyfall_logo.jpg" alt="Spyfall Logo" class="w-20 h-20 bg-stone-200 rounded-lg object-cover mb-6 mx-auto" />
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Join the Game</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Create a new party or join an existing one to start playing Spyfall with your friends.</p>
      </div>
      
      <div v-if="errorMessage" class="bg-red-100 text-red-800 p-4 mb-8 rounded-lg text-center max-w-2xl mx-auto">
        {{ errorMessage }}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div v-if="showCreateParty" class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Create New Party</h2>
          <div class="space-y-4">
            <Input
              id="create-name"
              v-model="createPlayerName"
              type="text"
              placeholder="Your Name"
              :disabled="isLoading"
              class="text-base py-6 px-4"
            />
            <Button 
              variant="orange" 
              class="w-full py-6" 
              @click="createParty" 
              :disabled="isLoading"
            >
              <span class="text-lg font-medium">{{ isLoading ? 'Creating...' : 'Create Party' }}</span>
            </Button>
          </div>
        </div>
        
        <div class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all" :class="{ 'md:col-span-2': !showCreateParty }">
          <div class="flex items-center gap-2 mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Join Party</h2>
            <button 
              v-if="partyCodeFromQuery"
              @click="partyCodeFromQuery = false"
              class="text-gray-400 hover:text-gray-600"
              title="Edit party code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
          </div>
          <div class="space-y-4">
            <Input
              id="party-code"
              v-model="partyCode"
              type="text"
              placeholder="Party Code"
              :disabled="isLoading || partyCodeFromQuery"
              class="text-base py-6 px-4"
            />
            <Input
              id="join-name"
              v-model="joinPlayerName"
              type="text"
              placeholder="Your Name"
              :disabled="isLoading"
              class="text-base py-6 px-4"
            />
            <Button 
              variant="orange" 
              class="w-full py-6" 
              @click="joinParty" 
              :disabled="isLoading"
            >
              <span class="text-lg font-medium">{{ isLoading ? 'Joining...' : 'Join Party' }}</span>
            </Button>
            
            <div v-if="!showCreateParty" class="text-center pt-4">
              <Button variant="ghost" @click="switchToCreateMode" class="text-gray-600 hover:text-orange-600">
                Or Create a New Party
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="!showCreateParty" class="text-center mt-10">
        <Button asChild variant="ghost" class="text-gray-600 hover:text-orange-600">
          <RouterLink to="/">
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Home
            </span>
          </RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AppHeader from '@/components/AppHeader.vue'
import socketService from '../services/socketService'

const router = useRouter()
const route = useRoute()
const createPlayerName = ref('')
const joinPlayerName = ref('')
const partyCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const partyCodeFromQuery = ref(false)
const showCreateParty = ref(true)

// Check for party code in URL query parameter on mount
onMounted(() => {
  const codeParam = route.query.code
  if (codeParam && typeof codeParam === 'string') {
    partyCode.value = codeParam
    partyCodeFromQuery.value = true
    showCreateParty.value = false
    document.getElementById('join-name')?.focus()
  }
})

const switchToCreateMode = () => {
  showCreateParty.value = true
  partyCode.value = '' // Optionally clear the code
  joinPlayerName.value = '' // Optionally clear the name
  partyCodeFromQuery.value = false
  errorMessage.value = '' // Clear any previous error
  nextTick(() => document.getElementById('create-name')?.focus()) 
}

const createParty = async () => {
  if (!createPlayerName.value) {
    errorMessage.value = 'Please enter your name'
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { gameId } = await socketService.createGame(createPlayerName.value)
    console.log('Game created with ID:', gameId)
    
    router.push('/lobby')
  } catch (error) {
    console.error('Error creating game:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create game'
  } finally {
    isLoading.value = false
  }
}

const joinParty = async () => {
  if (!joinPlayerName.value || !partyCode.value) {
    errorMessage.value = 'Please enter both your name and the party code'
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.joinGame(partyCode.value, joinPlayerName.value)
    
    router.push('/lobby')
  } catch (error) {
    console.error('Error joining game:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to join game'
  } finally {
    isLoading.value = false
  }
}
</script> 