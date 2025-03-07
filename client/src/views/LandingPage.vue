<template>
  <div class="landing-page">
    <h1>Spyfall</h1>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div class="actions">
      <div class="create-party">
        <h2>Create New Party</h2>
        <input
          v-model="playerName"
          type="text"
          placeholder="Enter your name"
          class="input"
          :disabled="isLoading"
        />
        <button 
          @click="createParty" 
          class="button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create Party' }}
        </button>
      </div>
      <div class="join-party">
        <h2>Join Party</h2>
        <input
          v-model="partyCode"
          type="text"
          placeholder="Enter party code"
          class="input"
          :disabled="isLoading"
        />
        <input
          v-model="playerName"
          type="text"
          placeholder="Enter your name"
          class="input"
          :disabled="isLoading"
        />
        <button 
          @click="joinParty" 
          class="button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Joining...' : 'Join Party' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import socketService from '../services/socketService'

const router = useRouter()
const playerName = ref('')
const partyCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const createParty = async () => {
  if (!playerName.value) {
    alert('Please enter your name')
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { gameId } = await socketService.createGame(playerName.value)
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
  if (!playerName.value || !partyCode.value) {
    alert('Please enter both your name and the party code')
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.joinGame(partyCode.value, playerName.value)
    
    router.push('/lobby')
  } catch (error) {
    console.error('Error joining game:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to join game'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.landing-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.create-party,
.join-party {
  flex: 1;
  min-width: 300px;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
}

.button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #0056b3;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style> 