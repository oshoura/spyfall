<template>
  <div class="min-h-screen bg-gray-50 py-12 md:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <img src="/images/spyfall_logo.jpg" alt="Spyfall Logo" class="w-20 h-20 bg-stone-200 rounded-lg object-cover mb-6 mx-auto" />
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Party Lobby</h1>
      </div>
      
      <div v-if="errorMessage" class="bg-red-100 text-red-800 p-4 mb-8 rounded-lg text-center max-w-2xl mx-auto">
        {{ errorMessage }}
      </div>
      
      <!-- Party Code Section -->
      <div class="flex flex-col md:flex-row items-center justify-between bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-8 gap-4">
        <div @click="copyPartyCode" class="bg-gray-100 px-6 py-4 rounded-lg font-mono text-base cursor-pointer hover:bg-gray-200 transition-colors flex-grow md:flex-grow-0">
          {{ partyCode }}
        </div>
        <p class="text-gray-600 md:flex-grow md:text-center">Share this code with your friends to join! (Click to copy)</p>
      </div>

      <!-- Players List -->
      <div class="bg-white rounded-lg shadow p-4 md:p-8 mb-6">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Players ({{ players.length }})</h2>
        
        <div class="flex flex-col divide-y divide-gray-200">
          <div v-for="player in players" :key="player.id"
               class="flex justify-between items-center py-3">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {{ player.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <div class="flex items-center">
                  <span class="font-medium">{{ player.name }}</span>
                  <span v-if="player.id === gameState?.hostId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Host</span>
                  <span v-if="player.id === playerId" class="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                </div>
                <div class="flex mt-1 space-x-2">
                  <span v-if="player.hasVoted" class="text-xs text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Voted
                  </span>
                  <span v-if="player.votesReceived && player.votesReceived > 0" 
                        class="text-xs text-purple-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {{ player.votesReceived }} vote{{ player.votesReceived > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-xs px-3 py-1 rounded-full" 
                :class="{
                  'bg-green-500 text-white': player.ready,
                  'bg-gray-300 text-gray-700': !player.ready
                }">
              {{ player.ready ? 'Ready' : 'Not Ready' }}
            </div>
          </div>
        </div>
        
        <div class="mt-4 text-center">
          <p v-if="players.length < 3" class="text-orange-600 font-medium">
            Need {{ 3 - players.length }} more player{{ 3 - players.length > 1 ? 's' : '' }} to start the game
          </p>
          <p v-else-if="!allPlayersReady" class="text-blue-600 font-medium">
            Waiting for other players to ready up
          </p>
          <p v-else-if="!isHost" class="text-green-600 font-medium">
            All players are ready! Waiting for host to start the game.
          </p>
          <p class="text-gray-600 text-sm mt-2">
            (Minimum: 3 players, Maximum: 16 players)
          </p>
        </div>
      </div>

      <!-- Game Settings Accordion (Host Only) -->
      <div v-if="isHost" class="mb-8">
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem value="game-settings" class="border-none">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <AccordionTrigger class="text-2xl font-bold text-gray-800 py-4 px-6">
                Game Settings
              </AccordionTrigger>
              <AccordionContent class="p-6 border-t border-gray-200">
                <div class="mb-6">
                  <h3 class="text-lg font-medium mb-3 text-gray-800">Max Round Time (minutes)</h3>
                  <div class="flex flex-wrap gap-2">
                    <Button 
                      v-for="time in [0, 1, 2, 3, 4, 5, 8, 10]" 
                      :key="time"
                      :variant="roundTime === time ? 'orange' : 'outline'"
                      @click="setRoundTime(time)"
                      class="px-4"
                    >
                      {{ time === 0 ? 'No Limit' : time }}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-medium mb-3 text-gray-800">Location Packs</h3>
                  <div v-if="locationPacks.length === 0" class="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    Loading location packs...
                  </div>
                  <div v-else class="grid gap-4 md:grid-cols-2">
                    <div 
                      v-for="pack in locationPacks" 
                      :key="pack.id" 
                      class="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border"
                      :class="{ 'bg-orange-50 border-orange-500 border-2': pack.selected, 'bg-white border-gray-200': !pack.selected }"
                      @click="toggleLocationPack(pack.id)"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-800">{{ pack.name }}</h4>
                        <span class="text-sm text-gray-600">{{ pack.locationCount }} locations</span>
                      </div>
                      <p class="text-gray-600 text-sm">{{ pack.description }}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <Button 
          @click="toggleReady" 
          :variant="isReady ? 'outline' : 'orange'"
          size="lg"
          class="py-6 px-8 w-full md:w-48"
          :disabled="isLoading"
          :class="isReady ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : ''"
        >
          <span class="text-lg font-medium">{{ isReady ? 'Ready!' : 'Mark as Ready' }}</span>
        </Button>
        
        <Button
          v-if="isHost"
          variant="orange"
          size="lg"
          class="py-6 px-8 w-full md:w-48"
          @click="startGame"
          :disabled="!canStartGame || isLoading"
        >
          <span class="text-lg font-medium">{{ isLoading ? 'Starting...' : 'Start Game' }}</span>
        </Button>
      </div>
    </div>
  </div>
  
  <Toaster />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import socketService from '../services/socketService'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const { toast } = useToast()

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
const allPlayersReady = computed(() => {
  return players.value.length > 0 && players.value.every(player => player.ready)
})
const canStartGame = computed(() => {
  return isHost.value && 
         isReady.value && 
         players.value.length >= 3 && 
         players.value.every(player => player.ready);
})

// Round time in minutes - default to 2
const roundTime = ref(2)

// Add this to the computed properties
const locationPacks = computed(() => gameState.value?.locationPacks || [])

// Watch for game state changes
watch(() => gameState.value?.state, (newState) => {
  if (newState === 'playing') {
    router.push('/game')
  }
})

// Watch for round time changes from the server
watch(() => gameState.value?.roundTime, (newRoundTime) => {
  if (newRoundTime) {
    roundTime.value = newRoundTime;
  }
})

// Check if we have a game state on mount
onMounted(() => {
  if (!gameState.value) {
    router.push('/')
    return
  }
  
  // Set initial round time from game state if available
  if (gameState.value.roundTime) {
    roundTime.value = gameState.value.roundTime;
  }
})

const toggleReady = async () => {
  const loadingTimeout = setTimeout(() => isLoading.value = false, 200)
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await socketService.toggleReady()
    clearTimeout(loadingTimeout)
    isLoading.value = false
  } catch (error) {
    console.error('Error toggling ready status:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update ready status'
    clearTimeout(loadingTimeout)
    isLoading.value = false
  }
}

const startGame = async () => {
  if (!canStartGame.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Send the round time with the start game request
    await socketService.startGame({
      roundTime: roundTime.value,
      noMaxTime: roundTime.value === 0 // Add option for no max time
    })
    // Router will handle navigation when game state changes
  } catch (error) {
    console.error('Error starting game:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to start game'
  } finally {
    isLoading.value = false
  }
}

const copyPartyCode = () => {
  // Create a URL with the party code as a query parameter
  const url = `${window.location.origin}/play?code=${partyCode.value}`;
  
  navigator.clipboard.writeText(url)
    .then(() => {
      // Show toast instead of alert
      toast({
        title: "Copied to clipboard",
        description: "Invite link has been copied to your clipboard",
        duration: 3000,
      })
    })
    .catch(err => {
      console.error('Could not copy text: ', err)
      errorMessage.value = 'Failed to copy invite link to clipboard'
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

// Set round time
const setRoundTime = (minutes: number) => {
  // Simply update the local state without server communication
  roundTime.value = minutes;
};
</script>

<style scoped>
/* Custom styles for accordion */
:deep(.accordion-content) {
  padding-top: 0;
}
</style> 