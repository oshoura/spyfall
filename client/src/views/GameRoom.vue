<template>
  <div class="min-h-screen bg-gray-50 py-8 md:py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="errorMessage" class="bg-red-100 text-red-800 p-4 mb-6 rounded-lg text-center max-w-2xl mx-auto">
        {{ errorMessage }}
      </div>
      
      <!-- Game Header -->
      <div class="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="flex flex-col justify-between items-center gap-3">
          <div class="text-xl font-bold text-gray-800">Round {{ gameState?.round || 1 }}</div>
          
          <!-- Timer -->
          <div v-if="gameState?.roundTime && gameState.roundTime > 0" class="flex items-center gap-2 text-lg font-medium" :class="{ 'text-red-600': timeRemaining < 120 }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer"><path d="M10 2h4"></path><path d="M12 14v-4"></path><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"></path><path d="M9 17H4v5"></path></svg>
            <span>{{ formatTime(timeRemaining) }}</span>
          </div>
          <div v-else-if="gameState?.roundTime === 0" class="flex items-center gap-2 text-lg font-medium text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-infinity"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"></path></svg>
            <span>No Time Limit</span>
          </div>
          
          <div v-if="!isSpy" class="text-lg">
            Location: <span class="font-bold text-orange-600">{{ currentLocation }}</span>
          </div>
          <div v-else class="text-lg font-bold text-orange-600">
            You are the spy! Try to figure out the location.
          </div>
        </div>
      </div>

      <!-- Vertical Cards Layout -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <!-- Players List -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-gray-800">Players</h2>
          </div>
          
          <div v-if="voteCallers.length > 0" class="mb-3 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
            {{ voteCallers.length }} player(s) calling for a vote
          </div>
          
          <!-- Use PlayerMarker component for non-spies -->
          <div v-if="!isSpy && gamePhase === 'playing'">
            <p class="text-sm text-gray-600 mb-3">Click to star a player you suspect, click again to scratch them out, click a third time to reset.</p>
            <PlayerMarker 
              :gamePlayers="players" 
              :currentPlayerId="playerId || ''" 
              :hostId="gameState?.hostId || ''"
              :showVoteButton="true"
              @vote="votePlayer"
              ref="playerMarkerRef"
            />
          </div>
          
          <!-- Default player list for spies or other game phases -->
          <div v-else class="grid gap-2.5">
            <div
              v-for="player in players"
              :key="player.id"
              class="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100"
              :class="{ 
                'border-l-4 border-l-orange-500': currentPlayer?.id === player.id && gamePhase === 'playing',
                'border-l-4 border-l-blue-500': player.id === playerId,
                'border-l-4 border-l-yellow-400': voteCallers.includes(player.id)
              }"
            >
              <span class="flex items-center">
                {{ player.name }}
                <span v-if="player.id === playerId" class="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                <span v-if="player.id === gameState?.hostId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Host</span>
                <span v-if="voteCallers.includes(player.id)" class="ml-2 text-xs bg-yellow-400 text-gray-800 px-2 py-0.5 rounded-full">Vote</span>
              </span>
              <Button
                v-if="(gamePhase === 'voting' || (gamePhase === 'playing' && !isSpy)) && player.id !== playerId"
                @click="votePlayer(player.id)"
                :disabled="hasVoted || isLoading"
                variant="destructive"
                size="sm"
              >
                Vote
              </Button>
            </div>
          </div>
        </div>
          
        <!-- Voting Phase -->
        <div v-if="gamePhase === 'voting'" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <h3 class="text-lg font-bold mb-2 text-gray-800">Voting Time!</h3>
            <p class="mb-3 text-gray-600">Vote for who you think is the spy.</p>
          </div>
        </div>
        
        <!-- Results Phase -->
        <div v-if="gamePhase === 'results'" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <h3 class="text-lg font-bold mb-2 text-gray-800">Round Results</h3>
            
            <div v-if="votingResults.spyGuess" class="space-y-3">
              <p class="text-gray-600">
                The spy ({{ players.find(p => p.id === votingResults?.spyId)?.name }}) 
                guessed: <strong>{{ votingResults.spyGuess }}</strong>
              </p>
              <p class="text-lg font-bold my-4 text-center" :class="{ 'text-orange-600': votingResults.spyGuessedCorrectly, 'text-green-600': !votingResults.spyGuessedCorrectly }">
                {{ votingResults.spyGuessedCorrectly ? 'The spy guessed correctly!' : 'The spy guessed incorrectly!' }}
              </p>
              <p class="text-gray-600">
                The location was: <strong>{{ votingResults.location }}</strong>
              </p>
            </div>
            
            <div v-else class="space-y-3">
              <p class="text-gray-600">
                The spy was: <strong>{{ players.find(p => p.id === votingResults?.spyId)?.name }}</strong>
              </p>
              
              <p class="text-gray-600">
                The location was: <strong>{{ votingResults.location }}</strong>
              </p>
              
              <p class="text-lg font-bold my-4 text-center" :class="{ 'text-orange-600': votingResults.spyWon, 'text-green-600': !votingResults.spyWon }">
                {{ votingResults.spyWon ? 'The spy wins!' : 'The spy was caught!' }}
              </p>
            </div>
            
            <div class="mt-6">
              <Button 
                v-if="isHost"
                @click="nextRound" 
                variant="orange" 
                size="default" 
                class="w-full"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Loading...' : 'Next Round' }}
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Location Section (for non-spies) -->
        <div v-if="!isSpy && gamePhase === 'playing'" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 class="text-lg font-bold mb-3 text-gray-800">Location: {{ currentLocation }}</h2>
          <div class="flex justify-center">
            <img 
              v-if="locationImage" 
              :src="locationImage" 
              :alt="currentLocation"
              class="max-h-64 rounded-lg object-cover"
            />
          </div>
        </div>
        
        <!-- Possible Locations (for spies) -->
        <div v-if="isSpy && gamePhase === 'playing'" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-gray-800">Possible Locations</h2>
            <Button 
              @click="showSpyGuessModal = true" 
              variant="destructive" 
              size="sm"
              :disabled="isLoading"
            >
              Guess Location
            </Button>
          </div>
          <p class="text-sm text-gray-600 mb-3">Click to star locations you think are likely, click again to scratch them out, click a third time to reset.</p>
          <LocationTiles 
            :allLocations="allPossibleLocations" 
            ref="locationTilesRef"
          />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Spy Guess Modal -->
  <Dialog v-model:open="showSpyGuessModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Make Your Guess</DialogTitle>
        <DialogDescription>
          If you guess the correct location, you win the round!
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <h3 class="text-lg font-medium mb-3 text-gray-800">Select a location:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-2">
          <div 
            v-for="location in allPossibleLocations" 
            :key="location"
            class="location-option relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-orange-500"
            :class="{ 'ring-2 ring-orange-500': spyGuess === location }"
            @click="selectLocationForGuess(location)"
          >
            <img 
              :src="getLocationImage(location)" 
              :alt="location"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span class="text-white text-center font-medium px-2">{{ location }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button @click="showSpyGuessModal = false" variant="outline">Cancel</Button>
        <Button 
          @click="submitSpyGuess" 
          variant="destructive"
          :disabled="!spyGuess || isLoading"
        >
          Submit Guess
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <!-- Time's Up Modal -->
  <Dialog v-model:open="showTimeUpModal">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Time's Up!</DialogTitle>
        <DialogDescription>
          The round has ended. Time to vote for who you think is the spy!
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <p class="text-gray-600">Select a player to vote for:</p>
        <div class="grid gap-2 mt-4">
          <div
            v-for="player in players.filter(p => p.id !== playerId)"
            :key="player.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100"
            @click="votePlayer(player.id)"
          >
            <span>{{ player.name }}</span>
            <Button variant="destructive" size="sm">Vote</Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
  
  <Toaster />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import socketService from '../services/socketService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import LocationTiles from '@/components/LocationTiles.vue'
import PlayerMarker from '@/components/PlayerMarker.vue'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const currentPlayerId = ref('')
const showSpyGuessModal = ref(false)
const showTimeUpModal = ref(false)
const spyGuess = ref('')
const timeRemaining = ref(0)
const timerInterval = ref<number | null>(null)
const locationTilesRef = ref<InstanceType<typeof LocationTiles> | null>(null)
const playerMarkerRef = ref<InstanceType<typeof PlayerMarker> | null>(null)
const { toast } = useToast()

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

// Format time remaining in MM:SS format
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Start the timer
const startTimer = (durationInMinutes: number) => {
  // Don't start timer for "No Time Limit" option
  if (durationInMinutes <= 0) {
    timeRemaining.value = 0;
    return;
  }
  
  // Clear any existing timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  // Set initial time
  timeRemaining.value = durationInMinutes * 60;
  
  // Start the interval
  timerInterval.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      // Time's up
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
      
      // Only show the modal if we're still in the playing phase
      if (gamePhase.value === 'playing') {
        showTimeUpModal.value = true;
      }
    }
  }, 1000);
};

// Watch for game state changes
watch(() => gameState.value?.state, (newState) => {
  if (newState === 'lobby') {
    router.push('/lobby')
  }
})

// Watch for timer events from the server
watch(() => gameState.value?.timerStarted, (newTimerStarted, oldTimerStarted) => {
  if (newTimerStarted && newTimerStarted !== oldTimerStarted) {
    // Start the timer with the round time from the server
    const roundTimeMinutes = gameState.value?.roundTime || 5;
    startTimer(roundTimeMinutes);
    
    toast({
      title: "Round started",
      description: `You have ${roundTimeMinutes} minutes to play`,
      duration: 3000,
    });
  }
})

watch(() => gameState.value?.timerEnded, (newTimerEnded, oldTimerEnded) => {
  if (newTimerEnded && newTimerEnded !== oldTimerEnded) {
    // Stop the timer
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    
    // Set time remaining to 0
    timeRemaining.value = 0;
    
    // Show time's up notification
    toast({
      title: "Time's up!",
      description: "The round has ended",
      duration: 3000,
    });
    
    // Show the time's up modal if we're still in the playing phase
    if (gamePhase.value === 'playing') {
      showTimeUpModal.value = true;
    }
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
  
  // Start the timer if the game is already in progress
  if (gameState.value?.timerStarted && gameState.value?.roundTime) {
    // Calculate remaining time based on when the timer started
    const startTime = new Date(gameState.value.timerStarted).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const totalSeconds = gameState.value.roundTime * 60;
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    
    // Start the timer with the remaining time
    timeRemaining.value = remainingSeconds;
    
    timerInterval.value = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        // Time's up
        if (timerInterval.value) {
          clearInterval(timerInterval.value);
          timerInterval.value = null;
        }
      }
    }, 1000);
  }
  // If no timer has been started yet but we're in playing phase, start it now
  else if (gameState.value.state === 'playing' && gameState.value.roundTime !== undefined) {
    startTimer(gameState.value.roundTime);
  }
})

// Clean up the timer when the component is unmounted
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
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
    
    toast({
      title: "Turn ended",
      description: `It's now ${players.value[nextIndex].name}'s turn`,
      duration: 3000,
    })
  } catch (error) {
    console.error('Error ending turn:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to end turn'
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
    
    toast({
      title: "Vote submitted",
      description: "Your vote has been recorded",
      duration: 3000,
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit vote'
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

// Submit spy guess
const submitSpyGuess = async () => {
  if (!spyGuess.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const result = await socketService.makeSpyGuess(spyGuess.value)
    
    showSpyGuessModal.value = false
    spyGuess.value = ''
    
    toast({
      title: "Guess submitted",
      description: "Your guess has been submitted",
      duration: 3000,
    })
  } catch (error) {
    console.error('Error submitting spy guess:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit spy guess'
  } finally {
    isLoading.value = false
  }
}

// Select location for guess
const selectLocationForGuess = (locationName: string) => {
  spyGuess.value = locationName;
};

// Get location image
const getLocationImage = (locationName: string): string => {
  const sanitizedName = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `/images/locations/basic/${sanitizedName}.png`;
}

// Get all locations
const allLocations = computed(() => {
  // Return a simplified version to avoid type errors
  return [];
})

// Get sorted locations for selection
const sortedLocationsForSelection = computed(() => {
  if (!locationTilesRef.value) return [];
  return locationTilesRef.value.getSortedLocationsForSelection;
})

// Get all possible locations (this would need to be fetched from the server)
const allPossibleLocations = ref<string[]>([
  "Airplane",
  "Bank",
  "Beach",
  "Casino",
  "Circus",
  "Hospital",
  "Hotel",
  "Movie Studio",
  "Restaurant",
  "School",
  "Space Station",
  "Submarine",
  "Supermarket",
  "Theater",
  "University"
]);
</script> 