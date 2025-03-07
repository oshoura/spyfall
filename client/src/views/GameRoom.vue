<template>
  <div class="game-room">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div class="game-header">
      <div class="timer">{{ formatTime(timeRemaining) }}</div>
      <div v-if="!isSpy" class="location">
        Location: <span class="location-name">{{ currentLocation }}</span>
      </div>
      <div v-else class="location spy">
        You are the spy! Try to figure out the location.
      </div>
    </div>

    <div class="game-content">
      <div class="players-list">
        <div
          v-for="player in players"
          :key="player.id"
          class="player-card"
          :class="{ 
            active: currentPlayer?.id === player.id && gamePhase === 'playing',
            'is-you': player.id === playerId
          }"
        >
          <div class="player-name">
            {{ player.name }}
            <span v-if="player.id === playerId" class="you-badge">You</span>
          </div>
          <div class="player-actions" v-if="gamePhase === 'voting'">
            <button
              @click="votePlayer(player.id)"
              :disabled="hasVoted || player.id === playerId || isLoading"
              class="vote-button"
            >
              Vote
            </button>
          </div>
        </div>
      </div>

      <div class="game-actions">
        <div v-if="gamePhase === 'playing'" class="question-section">
          <div v-if="currentPlayer?.id === playerId" class="your-turn">
            <h3>It's your turn!</h3>
            <p>Ask another player a question about the location.</p>
            <button @click="endTurn" class="button" :disabled="isLoading">
              {{ isLoading ? 'Ending Turn...' : 'End Turn' }}
            </button>
          </div>
          <div v-else class="waiting">
            <p>{{ currentPlayer?.name }}'s turn</p>
          </div>
        </div>

        <div v-if="gamePhase === 'voting'" class="voting-section">
          <h3>Time to vote!</h3>
          <p>Who do you think is the spy?</p>
          <div v-if="hasVoted" class="waiting">
            Waiting for other players to vote...
          </div>
        </div>
        
        <div v-if="gamePhase === 'results'" class="results-section">
          <h3>Voting Results</h3>
          
          <div v-if="votingResults" class="results-content">
            <p class="spy-reveal">
              The spy was: <strong>{{ players.find(p => p.id === votingResults?.spyId)?.name }}</strong>
            </p>
            
            <p class="location-reveal">
              The location was: <strong>{{ votingResults?.location }}</strong>
            </p>
            
            <p class="result-message" :class="{ 'spy-won': votingResults?.spyWon }">
              {{ votingResults?.spyWon ? 'The spy won!' : 'The spy was caught!' }}
            </p>
            
            <div class="next-actions" v-if="isHost">
              <button @click="nextRound" class="button" :disabled="isLoading">
                {{ isLoading ? 'Loading...' : 'Next Round' }}
              </button>
              <button @click="returnToLobby" class="button secondary" :disabled="isLoading">
                Return to Lobby
              </button>
            </div>
            <div v-else class="waiting">
              Waiting for host to start the next round...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="locations-reference" v-if="!isSpy && gamePhase !== 'results'">
      <h3>Possible Roles at {{ currentLocation }}</h3>
      <ul class="roles-list">
        <li v-for="role in locationRoles" :key="role">{{ role }}</li>
      </ul>
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

// Get game state from socket service
const gameState = computed(() => socketService.gameState.value)
const playerId = computed(() => socketService.playerId.value)

// Computed properties
const players = computed(() => gameState.value?.players || [])
const timeRemaining = computed(() => gameState.value?.timeRemaining || 0)
const currentLocation = computed(() => gameState.value?.location || '')
const isSpy = computed(() => gameState.value?.isSpy || false)
const gamePhase = computed(() => gameState.value?.state || 'playing')
const isHost = computed(() => gameState.value?.hostId === playerId.value)
const hasVoted = computed(() => {
  const player = players.value.find(p => p.id === playerId.value)
  return player?.hasVoted || false
})
const locationRoles = computed(() => gameState.value?.possibleRoles || [])
const votingResults = computed(() => gameState.value?.results)

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

// Format time
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

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

// Vote for a player
const votePlayer = async (playerId: string) => {
  if (hasVoted.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.submitVote(playerId)
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
</script>

<style scoped>
.game-room {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 2rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 1rem 2rem;
  border-radius: 8px;
}

.timer {
  font-size: 2rem;
  font-weight: bold;
  font-family: monospace;
}

.location {
  font-size: 1.5rem;
}

.location-name {
  font-weight: bold;
  color: #007bff;
}

.game-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.players-list {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
}

.player-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.player-card.active {
  border: 2px solid #007bff;
}

.game-actions {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.your-turn {
  animation: highlight 2s infinite;
}

@keyframes highlight {
  0% { background-color: #f8f9fa; }
  50% { background-color: #e3f2fd; }
  100% { background-color: #f8f9fa; }
}

.button {
  padding: 0.75rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.vote-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.vote-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.locations-reference {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.roles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

.roles-list li {
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.waiting {
  color: #6c757d;
  font-style: italic;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.location.spy {
  color: #dc3545;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.player-card.is-you {
  border: 2px solid #17a2b8;
}

.you-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.5rem;
  background-color: #17a2b8;
  color: white;
}

.results-section {
  text-align: center;
}

.results-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.spy-reveal, .location-reveal {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.result-message {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
  margin: 1.5rem 0;
}

.result-message.spy-won {
  color: #dc3545;
}

.next-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.button.secondary {
  background-color: #6c757d;
}

.button.secondary:hover {
  background-color: #5a6268;
}
</style> 