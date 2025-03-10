<template>
  <div class="party-lobby">
    <h1>Party Lobby</h1>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div class="party-info">
      <h2>Party Code: <span class="party-code" @click="copyPartyCode">{{ partyCode }}</span></h2>
      <p class="invite-text">Share this code with your friends to join! (Click to copy)</p>
    </div>

    <div class="players-section">
      <h2>Players ({{ players.length }})</h2>
      <div class="players-list">
        <div v-for="player in players" :key="player.id" class="player-card">
          <span class="player-name">
            {{ player.name }}
            <span v-if="player.id === gameState?.hostId" class="host-badge">Host</span>
            <span v-if="player.id === playerId" class="you-badge">You</span>
          </span>
          <span class="player-status" :class="{ ready: player.ready }">
            {{ player.ready ? 'Ready' : 'Not Ready' }}
          </span>
        </div>
      </div>
    </div>

    <div class="game-settings" v-if="isHost">
      <h2>Game Settings</h2>
      <div class="setting">
        <label>Round Time (minutes):</label>
        <select v-model="roundTime">
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>
      
      <div class="location-packs">
        <h3>Location Packs</h3>
        <div v-if="locationPacks.length === 0" class="loading-packs">
          Loading location packs...
        </div>
        <div v-else class="pack-list">
          <div 
            v-for="pack in locationPacks" 
            :key="pack.id" 
            class="pack-item"
            :class="{ selected: pack.selected }"
            @click="toggleLocationPack(pack.id)"
          >
            <div class="pack-header">
              <h4>{{ pack.name }}</h4>
              <span class="pack-count">{{ pack.locationCount }} locations</span>
            </div>
            <p class="pack-description">{{ pack.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button 
        @click="toggleReady" 
        class="button" 
        :class="{ ready: isReady }"
        :disabled="isLoading"
      >
        {{ isReady ? 'Ready!' : 'Mark as Ready' }}
      </button>
      <button
        v-if="isHost"
        @click="startGame"
        class="button start-button"
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

<style scoped>
.party-lobby {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.party-info {
  text-align: center;
  margin-bottom: 2rem;
}

.party-code {
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.party-code:hover {
  background-color: #e9ecef;
}

.invite-text {
  color: #6c757d;
  margin-top: 0.5rem;
}

.players-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.players-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.player-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.player-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: #dc3545;
  color: white;
  font-size: 0.875rem;
}

.player-status.ready {
  background-color: #28a745;
}

.game-settings {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.setting {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button:not(.ready) {
  background-color: #6c757d;
  color: white;
}

.button.ready {
  background-color: #28a745;
  color: white;
}

.start-button {
  background-color: #007bff;
  color: white;
}

.start-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.host-badge, .you-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

.host-badge {
  background-color: #ffc107;
  color: #212529;
}

.you-badge {
  background-color: #17a2b8;
  color: white;
}

.location-packs {
  margin-top: 1.5rem;
}

.pack-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.pack-item {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.pack-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pack-item.selected {
  border-color: #28a745;
  background-color: #f8fff9;
}

.pack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.pack-header h4 {
  margin: 0;
  color: #2c3e50;
}

.pack-count {
  font-size: 0.875rem;
  color: #6c757d;
}

.pack-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.loading-packs {
  text-align: center;
  padding: 1rem;
  color: #6c757d;
  font-style: italic;
}
</style> 