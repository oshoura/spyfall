<template>
  <div class="game-room">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div class="game-header">
      <div class="round-info">Round {{ gameState?.round || 1 }}</div>
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
            'is-you': player.id === (playerId || ''),
            'vote-caller': voteCallers.includes(player.id)
          }"
        >
          <div class="player-name">
            {{ player.name }}
            <span v-if="player.id === playerId" class="you-badge">You</span>
            <span v-if="voteCallers.includes(player.id)" class="vote-caller-badge">Vote Caller</span>
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
          
          <div class="action-buttons">
            <div v-if="isSpy" class="spy-actions">
              <button @click="showSpyGuessModal = true" class="button spy-guess-button">
                Make a Guess
              </button>
            </div>
            <div v-else class="non-spy-actions">
              <button 
                @click="callForVote" 
                class="button vote-call-button"
                :disabled="isLoading || voteCallers.includes(playerId)"
              >
                {{ voteCallers.includes(playerId) ? 'Vote Called' : 'Call for Vote' }}
              </button>
              <div v-if="voteCallers.length > 0" class="vote-callers-info">
                {{ voteCallers.length }} player(s) called for a vote. 
                {{ voteCallers.length >= 2 ? 'Voting will start soon!' : 'Need one more vote call to start voting.' }}
              </div>
            </div>
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
          <h3>Round Results</h3>
          
          <div v-if="votingResults" class="results-content">
            <div v-if="votingResults.spyGuess" class="spy-guess-result">
              <p>
                The spy ({{ players.find(p => p.id === votingResults?.spyId)?.name }}) 
                guessed: <strong>{{ votingResults.spyGuess }}</strong>
              </p>
              <p class="result-message" :class="{ 'spy-won': votingResults.spyGuessedCorrectly }">
                {{ votingResults.spyGuessedCorrectly ? 'The spy guessed correctly and won!' : 'The spy guessed incorrectly and lost!' }}
              </p>
            </div>
            
            <div v-else class="voting-result">
              <p class="spy-reveal">
                The spy was: <strong>{{ players.find(p => p.id === votingResults?.spyId)?.name }}</strong>
              </p>
              
              <p class="location-reveal">
                The location was: <strong>{{ votingResults?.location }}</strong>
              </p>
              
              <p class="result-message" :class="{ 'spy-won': votingResults?.spyWon }">
                {{ votingResults?.spyWon ? 'The spy won!' : 'The spy was caught!' }}
              </p>
            </div>
            
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
      <h3>Location: {{ currentLocation }}</h3>
      <div class="location-image-container">
        <img 
          v-if="locationImage" 
          :src="locationImage" 
          :alt="currentLocation" 
          class="location-image"
        />
        <div v-else class="location-image-placeholder">
          No image available
        </div>
      </div>
    </div>
    
    <div v-if="showSpyGuessModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Make Your Guess</h3>
        <p>If you guess the correct location, you win! If not, you lose.</p>
        
        <input 
          v-model="spyGuess" 
          type="text" 
          placeholder="Enter location name" 
          class="input"
        />
        
        <div class="modal-actions">
          <button @click="submitSpyGuess" class="button" :disabled="!spyGuess || isLoading">
            {{ isLoading ? 'Submitting...' : 'Submit Guess' }}
          </button>
          <button @click="showSpyGuessModal = false" class="button secondary">
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
const timeRemaining = computed(() => gameState.value?.timeRemaining || 0)
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
  const currentPlayerId = playerId.value
  if (!currentPlayerId || voteCallers.value.includes(currentPlayerId)) return
  
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

function findPackForLocation(location: string): string {
  const packs = gameState.value?.locationPacks || [];
  
  // Since we don't have direct access to the full pack data on the client,
  // we'll use the selected packs from the game state
  for (const pack of packs) {
    if (pack.selected) {
      // We'll just return the first selected pack as a fallback
      // This is not perfect but should work for most cases
      return pack.id;
    }
  }
  
  return 'basic'; // Default to basic pack
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

.round-info {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
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

.player-card.vote-caller {
  border-left: 4px solid #ffc107;
}

.game-actions {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.your-turn {
  animation: highlight 2s infinite;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

@keyframes highlight {
  0% { background-color: #f8f9fa; }
  50% { background-color: #e3f2fd; }
  100% { background-color: #f8f9fa; }
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spy-actions, .non-spy-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.spy-guess-button {
  background-color: #dc3545;
}

.spy-guess-button:hover {
  background-color: #c82333;
}

.vote-call-button {
  background-color: #ffc107;
  color: #212529;
}

.vote-call-button:hover:not(:disabled) {
  background-color: #e0a800;
}

.vote-call-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
}

.vote-callers-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
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

.button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
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
  text-align: center;
}

.location-image-container {
  margin-top: 1rem;
  max-width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
}

.location-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.location-image-placeholder {
  color: #6c757d;
  font-style: italic;
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

.you-badge, .vote-caller-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

.you-badge {
  background-color: #17a2b8;
  color: white;
}

.vote-caller-badge {
  background-color: #ffc107;
  color: #212529;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #6c757d;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style> 