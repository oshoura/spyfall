<template>
  <div class="max-w-3xl mx-auto p-8">
    <h1 class="text-4xl text-center text-gray-800 mb-8">Spyfall</h1>
    
    <div v-if="errorMessage" class="bg-red-100 text-red-800 p-3 mb-6 rounded-lg text-center">
      {{ errorMessage }}
    </div>
    
    <div class="flex flex-col md:flex-row gap-8 justify-center">
      <div class="flex-1 min-w-[300px] p-8 bg-gray-100 rounded-lg shadow-md hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
        <h2 class="text-2xl mb-6 text-gray-800">Create New Party</h2>
        <input
          v-model="createPlayerName"
          type="text"
          placeholder="Enter your name"
          class="w-full p-3 mb-4 border border-gray-300 rounded text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          :disabled="isLoading"
        />
        <button 
          @click="createParty" 
          class="w-full p-3 bg-blue-600 text-white border-none rounded text-base cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create Party' }}
        </button>
      </div>
      <div class="flex-1 min-w-[300px] p-8 bg-gray-100 rounded-lg shadow-md hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
        <h2 class="text-2xl mb-6 text-gray-800">Join Party</h2>
        <input
          v-model="partyCode"
          type="text"
          placeholder="Enter party code"
          class="w-full p-3 mb-4 border border-gray-300 rounded text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          :disabled="isLoading"
        />
        <input
          v-model="joinPlayerName"
          type="text"
          placeholder="Enter your name"
          class="w-full p-3 mb-4 border border-gray-300 rounded text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          :disabled="isLoading"
        />
        <button 
          @click="joinParty" 
          class="w-full p-3 bg-blue-600 text-white border-none rounded text-base cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Joining...' : 'Join Party' }}
        </button>
      </div>
    </div>
    
    <router-link to="/" class="inline-block mt-8 text-gray-500 hover:text-blue-600 transition-colors">← Back to Home</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import socketService from '../services/socketService'

const router = useRouter()
const createPlayerName = ref('')
const joinPlayerName = ref('')
const partyCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const createParty = async () => {
  if (!createPlayerName.value) {
    alert('Please enter your name')
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
    alert('Please enter both your name and the party code')
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