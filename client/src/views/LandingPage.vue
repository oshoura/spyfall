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
          v-model="createPlayerName"
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
          v-model="joinPlayerName"
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
    
    <router-link to="/" class="back-link">← Back to Home</router-link>
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
  letter-spacing: 1px;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.create-party:hover,
.join-party:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
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
  transition: background-color 0.2s, transform 0.2s;
}

.button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
  animation: fadeIn 0.3s;
}

.button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.back-link {
  display: inline-block;
  margin-top: 2rem;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #007bff;
}
</style> 