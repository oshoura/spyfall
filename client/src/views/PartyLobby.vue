<template>
  <div class="max-w-3xl mx-auto p-8">
    <h1 class="text-4xl text-center text-gray-800 mb-8">Party Lobby</h1>
    
    <div v-if="errorMessage" class="bg-red-100 text-red-800 p-3 mb-6 rounded-lg text-center">
      {{ errorMessage }}
    </div>
    
    <div class="text-center mb-8">
      <h2 class="text-2xl mb-2">Party Code: 
        <span class="bg-gray-100 px-4 py-2 rounded font-mono text-xl cursor-pointer hover:bg-gray-200 transition-colors" @click="copyPartyCode">{{ partyCode }}</span>
      </h2>
      <p class="text-gray-600 mt-2">Share this code with your friends to join! (Click to copy)</p>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg mb-8">
      <h2 class="text-2xl mb-4">Players ({{ players.length }})</h2>
      <div class="grid gap-4">
        <div v-for="player in players" :key="player.id" class="flex justify-between items-center p-4 bg-white rounded shadow-sm">
          <span class="flex items-center">
            {{ player.name }}
            <span v-if="player.id === gameState?.hostId" class="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Host</span>
            <span v-if="player.id === playerId" class="ml-2 text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full">You</span>
          </span>
          <span :class="{ 'bg-green-500 text-white': player.ready, 'bg-gray-300 text-gray-700': !player.ready }" class="px-3 py-1 rounded-full text-sm">
            {{ player.ready ? 'Ready' : 'Not Ready' }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg mb-8" v-if="isHost">
      <h2 class="text-2xl mb-4">Game Settings</h2>
      <div class="mb-4">
        <label class="block mb-2">Round Time (minutes):</label>
        <select v-model="roundTime" class="p-2 rounded border border-gray-300 w-full md:w-auto">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>
      
      <div class="mt-6">
        <h3 class="text-xl mb-3">Location Packs</h3>
        <div v-if="locationPacks.length === 0" class="text-gray-500 italic">
          Loading location packs...
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <div 
            v-for="pack in locationPacks" 
            :key="pack.id" 
            class="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
            :class="{ 'bg-green-50 border-2 border-green-500': pack.selected, 'bg-white border border-gray-200': !pack.selected }"
            @click="toggleLocationPack(pack.id)"
          >
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold">{{ pack.name }}</h4>
              <span class="text-sm text-gray-600">{{ pack.locationCount }} locations</span>
            </div>
            <p class="text-gray-600 text-sm">{{ pack.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <button 
        @click="toggleReady" 
        class="px-8 py-3 rounded font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        :class="{ 'bg-green-600 text-white hover:bg-green-700': isReady, 'bg-blue-600 text-white hover:bg-blue-700': !isReady }"
        :disabled="isLoading"
      >
        {{ isReady ? 'Ready!' : 'Mark as Ready' }}
      </button>
      <button
        v-if="isHost"
        @click="startGame"
        class="px-8 py-3 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="!canStartGame || isLoading"
      >
        {{ isLoading ? 'Starting...' : 'Start Game' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import socketService from '../services/socketService'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

// Get game state from socket service
const gameState = computed(() => socketService.gameState.value)
const playerId = computed(() => socketService.playerId.value)

// Computed properties
const partyCode = computed(() => gameState.value?.gameId || '')
const players = computed(() => gameState.value?.players || [])
const isHost = computed(() => gameState.value?.hostId === playerId.value)
const isReady = computed(() => {
  const player = players.value.find(p => p.id === playerId.value)
  return player?.ready || false
})
const canStartGame = computed(() => {
  return isHost.value && 
         players.value.length >= 3 && 
         players.value.every(player => player.ready)
})

// Round time in minutes
const roundTime = ref(8)

// Add this to the computed properties
const locationPacks = computed(() => gameState.value?.locationPacks || [])

// Watch for game state changes
watch(() => gameState.value?.state, (newState) => {
  if (newState === 'playing') {
    router.push('/game')
  }
})

// Check if we have a game state on mount
onMounted(() => {
  if (!gameState.value) {
    router.push('/')
  }
})

const toggleReady = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.toggleReady()
  } catch (error) {
    console.error('Error toggling ready status:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update ready status'
  } finally {
    isLoading.value = false
  }
}

const startGame = async () => {
  if (!canStartGame.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.startGame()
    // Router will handle navigation when game state changes
  } catch (error) {
    console.error('Error starting game:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to start game'
  } finally {
    isLoading.value = false
  }
}

const copyPartyCode = () => {
  navigator.clipboard.writeText(partyCode.value)
    .then(() => {
      alert('Party code copied to clipboard!')
    })
    .catch(err => {
      console.error('Could not copy text: ', err)
    })
}

// Add this method
const toggleLocationPack = async (packId: string) => {
  if (!isHost.value || isLoading.value) return;
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Get current selected packs
    const currentSelectedPacks = locationPacks.value
      .filter(pack => pack.selected)
      .map(pack => pack.id);
    
    // Toggle the selected pack
    let newSelectedPacks: string[];
    if (currentSelectedPacks.includes(packId)) {
      // Don't allow deselecting the last pack
      if (currentSelectedPacks.length <= 1) {
        return;
      }
      newSelectedPacks = currentSelectedPacks.filter(id => id !== packId);
    } else {
      newSelectedPacks = [...currentSelectedPacks, packId];
    }
    
    await socketService.setLocationPacks(newSelectedPacks);
  } catch (error) {
    console.error('Error setting location packs:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update location packs';
  } finally {
    isLoading.value = false;
  }
};
</script> 