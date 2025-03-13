<template>
  <div class="max-w-7xl mx-auto p-8 grid gap-8">
    <div v-if="errorMessage" class="bg-red-100 text-red-800 p-3 mb-6 rounded-lg text-center">
      {{ errorMessage }}
    </div>
    
    <div class="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
      <div class="text-2xl font-bold text-gray-800">Round {{ gameState?.round || 1 }}</div>
      <div v-if="!isSpy" class="text-2xl">
        Location: <span class="font-bold text-blue-600">{{ currentLocation }}</span>
      </div>
      <div v-else class="text-2xl font-bold text-red-600 animate-pulse">
        You are the spy! Try to figure out the location.
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      <div class="bg-gray-100 p-6 rounded-lg grid gap-4">
        <div
          v-for="player in players"
          :key="player.id"
          class="flex justify-between items-center p-4 bg-white rounded shadow-sm"
          :class="{ 
            'border-2 border-blue-500': currentPlayer?.id === player.id && gamePhase === 'playing',
            'border-2 border-cyan-500': player.id === playerId,
            'border-l-4 border-l-yellow-400': voteCallers.includes(player.id)
          }"
        >
          <div class="flex items-center">
            {{ player.name }}
            <span v-if="player.id === playerId" class="ml-2 text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full">You</span>
            <span v-if="voteCallers.includes(player.id)" class="ml-2 text-xs bg-yellow-400 text-gray-800 px-2 py-0.5 rounded-full">Vote Caller</span>
          </div>
          <div v-if="gamePhase === 'voting'">
            <button
              @click="votePlayer(player.id)"
              :disabled="hasVoted || player.id === playerId || isLoading"
              class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Vote
            </button>
          </div>
        </div>
      </div>

      <div class="bg-gray-100 p-8 rounded-lg text-center">
        <div v-if="gamePhase === 'playing'" class="space-y-6">
          <div v-if="currentPlayer?.id === playerId" class="p-6 rounded-lg animate-[pulse_2s_infinite]">
            <h3 class="text-xl font-bold mb-2">It's your turn!</h3>
            <p class="mb-4">Ask another player a question about the location.</p>
            <button @click="endTurn" class="px-8 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transform hover:-translate-y-1 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none" :disabled="isLoading">
              {{ isLoading ? 'Ending Turn...' : 'End Turn' }}
            </button>
          </div>
          <div v-else class="text-gray-500 italic">
            <p>{{ currentPlayer?.name }}'s turn</p>
          </div>
          
          <div class="mt-8 flex flex-col gap-4 items-center">
            <div v-if="isSpy" class="flex flex-col gap-4 items-center">
              <button @click="showSpyGuessModal = true" class="px-8 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 transform hover:-translate-y-1 transition-all">
                Make a Guess
              </button>
            </div>
            <div v-else class="flex flex-col gap-4 items-center">
              <button 
                @click="callForVote" 
                class="px-8 py-3 bg-yellow-400 text-gray-800 rounded font-medium hover:bg-yellow-500 transform hover:-translate-y-1 transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="isLoading || (!!playerId && voteCallers.includes(playerId))"
              >
                {{ !!playerId && voteCallers.includes(playerId) ? 'Vote Called' : 'Call for Vote' }}
              </button>
              <div v-if="voteCallers.length > 0" class="mt-2 text-sm text-gray-500">
                {{ voteCallers.length }} player(s) called for a vote. 
                {{ voteCallers.length >= 2 ? 'Voting will start soon!' : 'Need one more vote call to start voting.' }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="gamePhase === 'voting'" class="space-y-4">
          <h3 class="text-xl font-bold">Time to vote!</h3>
          <p class="mb-4">Who do you think is the spy?</p>
          <div v-if="hasVoted" class="text-gray-500 italic">
            Waiting for other players to vote...
          </div>
        </div>
        
        <div v-if="gamePhase === 'results'" class="space-y-6">
          <h3 class="text-2xl font-bold">Round Results</h3>
          
          <div v-if="votingResults" class="bg-white p-6 rounded-lg mt-4">
            <div v-if="votingResults.spyGuess" class="space-y-4">
              <p>
                The spy ({{ players.find(p => p.id === votingResults?.spyId)?.name }}) 
                guessed: <strong>{{ votingResults.spyGuess }}</strong>
              </p>
              <p class="text-2xl font-bold my-6" :class="{ 'text-red-600': votingResults.spyGuessedCorrectly, 'text-green-600': !votingResults.spyGuessedCorrectly }">
                {{ votingResults.spyGuessedCorrectly ? 'The spy guessed correctly and won!' : 'The spy guessed incorrectly and lost!' }}
              </p>
            </div>
            
            <div v-else class="space-y-4">
              <p class="text-lg">
                The spy was: <strong>{{ players.find(p => p.id === votingResults?.spyId)?.name }}</strong>
              </p>
              
              <p class="text-lg">
                The location was: <strong>{{ votingResults?.location }}</strong>
              </p>
              
              <p class="text-2xl font-bold my-6" :class="{ 'text-red-600': votingResults?.spyWon, 'text-green-600': !votingResults?.spyWon }">
                {{ votingResults?.spyWon ? 'The spy won!' : 'The spy was caught!' }}
              </p>
            </div>
            
            <div class="flex gap-4 justify-center mt-6" v-if="isHost">
              <button @click="nextRound" class="px-8 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="isLoading">
                {{ isLoading ? 'Loading...' : 'Next Round' }}
              </button>
              <button @click="returnToLobby" class="px-8 py-3 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="isLoading">
                Return to Lobby
              </button>
            </div>
            <div v-else class="text-gray-500 italic mt-4">
              Waiting for host to start the next round...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg text-center" v-if="!isSpy && gamePhase !== 'results'">
      <h3 class="text-xl font-bold mb-4">Location: {{ currentLocation }}</h3>
      <div class="h-[300px] flex justify-center items-center bg-white rounded overflow-hidden">
        <img 
          v-if="locationImage" 
          :src="locationImage" 
          :alt="currentLocation" 
          class="max-w-full max-h-full object-contain"
        />
        <div v-else class="text-gray-500 italic">
          No image available
        </div>
      </div>
    </div>
    
    <div v-if="showSpyGuessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg w-[90%] max-w-[500px] shadow-lg">
        <h3 class="text-xl font-bold mb-4 text-gray-800">Make Your Guess</h3>
        <p class="mb-6 text-gray-600">If you guess the correct location, you win! If not, you lose.</p>
        
        <input 
          v-model="spyGuess" 
          type="text" 
          placeholder="Enter location name" 
          class="w-full p-3 mb-6 border border-gray-300 rounded text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        
        <div class="flex gap-4 justify-end">
          <button @click="submitSpyGuess" class="px-8 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="!spyGuess || isLoading">
            {{ isLoading ? 'Submitting...' : 'Submit Guess' }}
          </button>
          <button @click="showSpyGuessModal = false" class="px-8 py-3 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
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
const currentPlayerId = ref('')
const showSpyGuessModal = ref(false)
const spyGuess = ref('')

// Get game state from socket service
const gameState = computed(() => socketService.gameState.value)
const playerId = computed(() => socketService.playerId.value)

// Computed properties
const players = computed(() => gameState.value?.players || [])
const currentLocation = computed(() => gameState.value?.location || '')
const isSpy = computed(() => gameState.value?.isSpy || false)
const gamePhase = computed(() => gameState.value?.state || 'playing')
const isHost = computed(() => gameState.value?.hostId === playerId.value)
const hasVoted = computed(() => {
  const currentPlayerId = playerId.value;
  if (!currentPlayerId) return false;
  
  const player = players.value.find(p => p.id === currentPlayerId);
  return player?.hasVoted || false;
})
const votingResults = computed(() => gameState.value?.results)
const voteCallers = computed(() => {
  return gameState.value?.voteCallers || [];
})

const locationImage = computed(() => {
  if (!currentLocation.value || isSpy.value) return null;
  
  // Try to find the pack that contains this location
  const packId = findPackForLocation(currentLocation.value);
  
  const sanitizedName = currentLocation.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `/images/locations/${packId}/${sanitizedName}.png`;
});

// Watch for game state changes
watch(() => gameState.value?.state, (newState) => {
  if (newState === 'lobby') {
    router.push('/lobby')
  }
})

// Check if we have a game state on mount
onMounted(() => {
  if (!gameState.value || gameState.value.state === 'lobby') {
    router.push('/lobby')
    return
  }
  
  // Set the first player as the current player
  if (players.value.length > 0) {
    currentPlayerId.value = players.value[0].id
  }
})

// Get the current player
const currentPlayer = computed(() => {
  return players.value.find(p => p.id === currentPlayerId.value)
})

// End turn
const endTurn = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.endTurn()
    
    // Find next player
    const currentIndex = players.value.findIndex(p => p.id === currentPlayerId.value)
    const nextIndex = (currentIndex + 1) % players.value.length
    currentPlayerId.value = players.value[nextIndex].id
  } catch (error) {
    console.error('Error ending turn:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to end turn'
  } finally {
    isLoading.value = false
  }
}

// Call for a vote
const callForVote = async () => {
  if (!playerId.value || voteCallers.value.includes(playerId.value)) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { votingStarted } = await socketService.callForVote()
    
    if (votingStarted) {
      console.log('Voting has started!')
    } else {
      console.log('Vote call registered. Waiting for more players to call for a vote.')
    }
  } catch (error) {
    console.error('Error calling for vote:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to call for vote'
  } finally {
    isLoading.value = false
  }
}

// Submit spy guess
const submitSpyGuess = async () => {
  if (!spyGuess.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const result = await socketService.makeSpyGuess(spyGuess.value)
    
    showSpyGuessModal.value = false
    spyGuess.value = ''
    
    console.log('Spy guess result:', result)
  } catch (error) {
    console.error('Error submitting spy guess:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit spy guess'
  } finally {
    isLoading.value = false
  }
}

// Vote for a player
const votePlayer = async (targetId: string) => {
  if (hasVoted.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.submitVote(targetId)
  } catch (error) {
    console.error('Error submitting vote:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit vote'
  } finally {
    isLoading.value = false
  }
}

// Start next round
const nextRound = async () => {
  if (!isHost.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { gameOver } = await socketService.nextRound()
    
    if (gameOver) {
      // Handle game over
      await socketService.returnToLobby()
    }
  } catch (error) {
    console.error('Error starting next round:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to start next round'
  } finally {
    isLoading.value = false
  }
}

// Return to lobby
const returnToLobby = async () => {
  if (!isHost.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.returnToLobby()
  } catch (error) {
    console.error('Error returning to lobby:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to return to lobby'
  } finally {
    isLoading.value = false
  }
}

function findPackForLocation(_: string): string {
  // We're not actually using the location parameter in this implementation
  // but we need to keep it for the function signature
  // This comment acknowledges we're aware of the unused parameter
  
  const packs = gameState.value?.locationPacks || [];
  
  // Since we don't have direct access to the full pack data on the client,
  // we'll use the selected packs from the game state
  for (const pack of packs) {
    if (pack.selected) {
      return pack.id;
    }
  }
  
  return 'basic'; // Default to basic pack
}
</script> 