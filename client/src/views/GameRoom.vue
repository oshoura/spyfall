<template>
  <div class="min-h-screen bg-gray-50 py-6 md:py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="errorMessage" class="bg-red-100 text-red-800 p-4 mb-6 rounded-lg text-center">
        {{ errorMessage }}
      </div>
      
      <!-- Game Header -->
      <div class="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="flex flex-col justify-between items-center gap-3">
          <div class="flex items-center justify-between w-full">
            <div class="text-xl font-bold text-gray-800">Round {{ gameState?.round || 1 }}</div>
            <div class="flex items-center gap-2">
              <Button 
                @click="toggleInfoVisibility" 
                variant="ghost" 
                size="sm"
                class="flex items-center gap-1"
                :title="infoHidden ? 'Show sensitive identity information' : 'Hide sensitive identity information'"
              >
                <span v-if="infoHidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                </span>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </span>
                <span class="text-xs">{{ infoHidden ? 'Show Identity' : 'Hide Identity' }}</span>
              </Button>
              <Button 
                v-if="isHost && isPlayingPhase" 
                @click="endRoundEarly" 
                variant="destructive" 
                size="sm"
              >
                End Round
              </Button>
            </div>
          </div>
          
          <!-- Timer -->
          <div v-if="gameState?.roundTime && gameState.roundTime > 0" class="flex items-center gap-2 text-lg font-medium" :class="timerStyle">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer"><path d="M10 2h4"></path><path d="M12 14v-4"></path><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"></path><path d="M9 17H4v5"></path></svg>
            <span>{{ formatTime(timeRemaining) }}</span>
          </div>
          <div v-else-if="gameState?.roundTime === 0" class="flex items-center gap-2 text-lg font-medium text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-infinity"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"></path></svg>
            <span>No Time Limit</span>
          </div>
          
          <div v-if="!isSpy && !infoHidden" class="text-lg">
            Location: <span class="font-bold text-orange-600">{{ currentLocation }}</span>
          </div>
          <div v-else-if="isSpy && !infoHidden" class="text-lg font-bold text-orange-600">
            You are the spy! Try to figure out the location.
          </div>
          <div v-else class="text-lg font-medium text-gray-400">
            <span class="italic">[ Information hidden ]</span>
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
          
          <!-- Use PlayerMarker component for players during playing/voting phases -->
          <div v-if="canVote">
            <p class="text-sm text-gray-600 mb-3">
              <span v-if="!isSpy && !infoHidden">Click to mark players as suspicious. Click the vote button next to a player to vote for them as the spy.</span>
              <span v-else-if="isSpy && !infoHidden">You can vote for a player to maintain your cover, but be careful who you choose!</span>
              <span v-else>Click to mark players or vote for them.</span>
            </p>
            <PlayerMarker 
              :gamePlayers="players" 
              :currentPlayerId="currentPlayerId || ''" 
              :hostId="gameState?.hostId || ''"
              :showVoteButton="true"
              :showVotes="showVoteCounts"
              @vote="votePlayer"
              ref="playerMarkerRef"
            />
          </div>
          
          <!-- Default player list for other phases -->
          <div v-else class="grid gap-3">
            <div 
              v-for="player in players" 
              :key="player.id"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:shadow-md"
              :class="{ 
                'border-l-4 border-l-blue-500': player.id === currentPlayerId,
                'bg-purple-50 border-purple-300': currentPlayer?.votedFor === player.id
              }"
            >
              <div class="flex items-center space-x-2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" 
                     :class="{
                       'bg-blue-100 text-blue-700': currentPlayer?.votedFor !== player.id,
                       'bg-purple-100 text-purple-700': currentPlayer?.votedFor === player.id
                     }">
                  <span class="font-bold">{{ player.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center">
                    <span class="font-medium">{{ player.name }}</span>
                    <span v-if="player.id === currentPlayerId" class="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                    <span v-if="player.id === gameState?.hostId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Host</span>
                    <span v-if="currentPlayer?.votedFor === player.id" class="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Your Vote</span>
                  </div>
                  <!-- Show vote count more prominently during any phase if votes are present -->
                  <div v-if="player.votesReceived" 
                       class="mt-1 flex items-center">
                    <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">
                      {{ player.votesReceived }} vote{{ player.votesReceived > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                v-if="player.id !== currentPlayerId && canVote"
                @click="votePlayer(player.id)" 
                variant="destructive" 
                size="sm"
                :class="currentPlayer?.votedFor === player.id ? 'bg-purple-600 hover:bg-purple-700' : ''"
              >
                {{ currentPlayer?.votedFor === player.id ? 'Change Vote' : 'Vote' }}
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Possible Locations for Spies -->
        <div v-if="isSpy && !infoHidden" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-gray-800">Possible Locations</h2>
            <Button 
              v-if="isSpy" 
              @click="handleSpyGuessClick" 
              variant="destructive" 
              size="sm"
            >
              Guess Location
            </Button>
          </div>
          <p class="text-sm text-gray-600 mb-3">Click to star locations you think are likely, click again to scratch them out, click a third time to reset.</p>
          <LocationTiles 
            :allLocations="allPossibleLocations" 
            :getLocationImage="getLocationImage"
            ref="locationTilesRef"
          />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal for spy to guess location -->
  <Dialog v-model:open="showSpyGuessModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Guess the Location</DialogTitle>
        <DialogDescription>
          If you guess correctly, you win! Choose wisely.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="flex flex-col gap-2">
          <Label for="location-search" class="text-left">Search locations:</Label>
          <div class="relative">
            <input 
              id="location-search"
              v-model="locationSearch"
              type="text"
              placeholder="Type to search..."
              class="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              ref="searchInputRef"
              @keydown.escape="clearSearch"
              autocomplete="off"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <button 
              v-if="locationSearch" 
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto p-1">
          <button 
            v-for="location in filteredLocationsForSelection"
            :key="location.name"
            @click="selectLocationForGuess(location.name)"
            class="location-tile"
            :class="{ 'selected': spyGuess === location.name }"
            type="button"
          >
            <div class="location-image">
              <img 
                :src="getLocationImage(location.name)" 
                :alt="location.name" 
                @error="handleImageError"
              />
            </div>
            <div class="location-name">
              {{ location.name }}
            </div>
          </button>
        </div>
        <div v-if="filteredLocationsForSelection.length === 0" class="text-center py-4 text-gray-500">
          No locations found matching your search.
        </div>
      </div>
      <DialogFooter>
        <Button @click="showSpyGuessModal = false" variant="outline">Cancel</Button>
        <Button @click="submitSpyGuess" variant="orange" :disabled="!spyGuess || isLoading">Confirm Guess</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <!-- Modal for round results -->
  <Dialog v-model:open="showRoundResultsModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-xl">
          <span v-if="votingResults?.spyWon" class="text-orange-600">The Spy Won!</span>
          <span v-else class="text-green-600">The Spy Was Caught!</span>
        </DialogTitle>
        <DialogDescription class="text-base">
          Round {{ gameState?.round || 1 }} has ended
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="votingResults" class="py-4 space-y-6">
        <!-- Location reveal -->
        <div class="flex items-center justify-center gap-4 p-4 rounded-lg bg-gray-50">
          <div class="text-center flex-1">
            <div class="text-sm text-gray-500 mb-1">The location was</div>
            <div class="text-lg font-bold text-gray-800">{{ votingResults.location }}</div>
          </div>
          <img 
            v-if="!isSpy" 
            :src="getLocationImage(votingResults.location)"
            class="w-24 h-24 object-cover rounded-lg"
            :alt="votingResults.location"
          />
        </div>
        
        <!-- Spy identity -->
        <div class="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-100">
          <div>
            <div class="text-sm text-gray-500 mb-1">The spy was</div>
            <div class="text-base font-medium">{{ getPlayerName(votingResults.spyId) }}</div>
          </div>
          <div class="text-sm bg-orange-500 text-white px-3 py-1 rounded-full">Spy</div>
        </div>
        
        <!-- Time-up scenario -->
        <div v-if="votingResults.reason === 'time-up'" class="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p class="text-blue-800">
            Time ran out! The spy wins by default.
          </p>
        </div>
        
        <!-- Host ended round early scenario -->
        <div v-else-if="votingResults.reason === 'host-ended'" class="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p class="text-blue-800">
            The host ended the round early. The spy wins by default.
          </p>
        </div>
        
        <!-- Spy guess scenario -->
        <div v-else-if="votingResults.spyGuess" class="p-4 rounded-lg" :class="votingResults.spyGuessedCorrectly ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'">
          <div class="text-sm mb-2" :class="votingResults.spyGuessedCorrectly ? 'text-orange-800' : 'text-green-800'">
            The spy guessed: <strong>{{ votingResults.spyGuess }}</strong>
          </div>
          <p v-if="votingResults.spyGuessedCorrectly" class="text-orange-800 font-medium">
            The spy's guess was correct! They win the round!
          </p>
          <p v-else class="text-green-800 font-medium">
            The spy's guess was wrong! Everyone else wins!
          </p>
        </div>
        
        <!-- Voting scenario -->
        <div v-else class="p-4 rounded-lg" :class="votingResults.spyWon ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-sm text-gray-500">Most voted player</div>
              <div class="text-base font-medium">{{ getPlayerName(votingResults.mostVotedId) }}</div>
            </div>
            <div v-if="votingResults.spyId === votingResults.mostVotedId" class="text-sm bg-green-500 text-white px-3 py-1 rounded-full">Correct!</div>
            <div v-else class="text-sm bg-red-500 text-white px-3 py-1 rounded-full">Incorrect!</div>
          </div>
          
          <p v-if="votingResults.spyWon" class="text-orange-800 mt-2 mb-4">
            The group voted for the wrong person! The spy remains hidden and wins the round!
          </p>
          <p v-else class="text-green-800 mt-2 mb-4">
            Great job! The group correctly identified the spy and wins the round!
          </p>
          
          <!-- Show vote distribution -->
          <div v-if="votingResults.votes" class="mt-4 pt-3 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Vote Breakdown</h4>
            <div class="space-y-2">
              <div 
                v-for="player in sortedPlayers" 
                :key="player.id" 
                class="flex justify-between items-center py-1 px-2 rounded"
                :class="player.id === votingResults.spyId ? 'bg-orange-50' : ''"
              >
                <div class="flex items-center">
                  <span>{{ player.name }}</span>
                  <span v-if="player.id === votingResults.spyId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Spy</span>
                </div>
                <div class="flex items-center">
                  <div v-if="getVoteCount(player.id) > 0" class="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    {{ getVoteCount(player.id) }} vote{{ getVoteCount(player.id) > 1 ? 's' : '' }}
                  </div>
                  <div v-else class="text-xs text-gray-500">No votes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button @click="returnToLobby" variant="orange" :disabled="isLoading">
          Return to Lobby
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <Toaster />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import socketService from '../services/socketService'
import type { Player } from '../services/socketService'
import { Button } from '@/components/ui/button'
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
import LocationTiles from '../components/LocationTiles.vue'
import PlayerMarker from '../components/PlayerMarker.vue'
import { Label } from '@/components/ui/label'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const currentPlayerId = computed(() => socketService.playerId.value)
const showSpyGuessModal = ref(false)
const showRoundResultsModal = ref(false)
const spyGuess = ref('')
const locationSearch = ref('')
const timeRemaining = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | undefined>(undefined)
const locationTilesRef = ref<InstanceType<typeof LocationTiles> | null>(null)
const playerMarkerRef = ref<InstanceType<typeof PlayerMarker> | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const { toast } = useToast()

// Get game state from socket service
const gameState = computed(() => socketService.gameState.value)
const playerId = computed(() => socketService.playerId.value)

// Computed properties
const players = computed<Player[]>(() => gameState.value?.players || [])
const currentLocation = computed(() => gameState.value?.location || '')
const isSpy = computed(() => gameState.value?.isSpy || false)
const gamePhase = computed(() => gameState.value?.state || 'playing')
const isHost = computed(() => gameState.value?.hostId === playerId.value)

// Helper computed properties for phase checks
const isPlayingPhase = computed(() => gamePhase.value === 'playing')
const isVotingPhase = computed(() => gamePhase.value === 'voting')
const isResultsPhase = computed(() => gamePhase.value === 'results')
const canVote = computed(() => isPlayingPhase.value || isVotingPhase.value)

// Add this interface for the voting results type
interface VotingResults {
  spyId: string;
  mostVotedId: string;
  spyWon: boolean;
  location: string;
  spyGuess?: string;
  spyGuessedCorrectly?: boolean;
  reason?: string;
  votes: Record<string, number>; // Record object with player IDs as keys and vote counts as values
}

// Helper function to convert the results from the server to our VotingResults type
const convertToVotingResults = (rawResults: any): VotingResults => {
  // Create a basic result structure with known properties
  const result: VotingResults = {
    spyId: rawResults.spyId,
    mostVotedId: rawResults.mostVotedId,
    spyWon: rawResults.spyWon,
    location: rawResults.location,
    votes: {}
  };
  
  // Add optional properties if they exist
  if (rawResults.spyGuess) result.spyGuess = rawResults.spyGuess;
  if (rawResults.spyGuessedCorrectly) result.spyGuessedCorrectly = rawResults.spyGuessedCorrectly;
  if (rawResults.reason) result.reason = rawResults.reason;
  
  // Convert votes from server format to a simple Record
  if (rawResults.votes) {
    // Handle both Map objects and plain objects
    if (typeof rawResults.votes === 'object') {
      // If votes is already a plain object, use it directly
      if (!(rawResults.votes instanceof Map)) {
        result.votes = rawResults.votes;
      } else {
        // If votes is a Map, convert it to a plain object
        rawResults.votes.forEach((value: number, key: string) => {
          result.votes[key] = value;
        });
      }
    }
  }
  
  return result;
};

// Update the computed property for votingResults
const votingResults = computed<VotingResults | null>(() => {
  if (!gameState.value?.results) return null;
  return convertToVotingResults(gameState.value.results);
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
      
      // Check if time is getting low (less than 30 seconds)
      if (timeRemaining.value === 30) {
        timeIsLow.value = true;
        toast({
          title: "Time is running out!",
          description: "Less than 30 seconds remaining",
          variant: "destructive"
        });
      }
    } else {
      // Time's up
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = undefined;
      }
      
      // Note: We don't need to do anything here as the server will send a time-up event
      // when the actual time is up, which may be slightly different from client time
    }
  }, 1000);
};

// Watch for state changes to fetch locations when entering spy_guessing state
watch(() => gameState.value?.state, (newState) => {
  if (newState === 'lobby') {
    router.push('/lobby')
  } else if (newState === 'results') {
    showRoundResultsModal.value = true;
    showSpyGuessModal.value = false;
  } else if (newState === 'spy_guessing' && isSpy.value) {
    // Fetch fresh list of locations when spy is guessing
    fetchPossibleLocations();
  }
})

// Watch for timer events from the server
watch(() => gameState.value?.timerStarted, (newTimerStarted, oldTimerStarted) => {
  if (newTimerStarted && newTimerStarted !== oldTimerStarted) {
    // Start the timer with the round time from the server
    const roundTimeMinutes = gameState.value?.roundTime || 2;
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
      timerInterval.value = undefined;
    }
    
    // Set time remaining to 0
    timeRemaining.value = 0;
    
    // Show time's up notification
    toast({
      title: "Time's up!",
      description: "The round has ended",
      duration: 3000,
    });
  }
})

// Watch for possibleLocations from server
watch(() => gameState.value?.possibleLocations, (newLocations) => {
  if (newLocations && newLocations.length > 0) {
    allPossibleLocations.value = newLocations;
  }
})

// Check if we have a game state on mount
onMounted(() => {
  if (!gameState.value || gameState.value.state === 'lobby') {
    router.push('/lobby')
    return
  }
  
  // Fetch possible locations for spy guessing
  fetchPossibleLocations();
  
  // Start the timer if the game is already in progress (don't set currentPlayerId)
  if (gameState.value?.timerStarted && gameState.value?.roundTime) {
    // Calculate remaining time based on when the timer started
    const startTime = new Date(gameState.value.timerStarted).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const totalSeconds = gameState.value.roundTime * 60;
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    
    // Start the timer with the remaining time
    timeRemaining.value = remainingSeconds;
    
    // If remaining time is less than 30 seconds, set timeIsLow
    if (remainingSeconds <= 30 && remainingSeconds > 0) {
      timeIsLow.value = true;
    }
    
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
        
        // Check if time is getting low (at exactly 30 seconds)
        if (timeRemaining.value === 30) {
          timeIsLow.value = true;
          toast({
            title: "Time is running out!",
            description: "Less than 30 seconds remaining",
            variant: "destructive"
          });
        }
      } else {
        // Time's up (client-side)
        if (timerInterval.value) {
          clearInterval(timerInterval.value);
          timerInterval.value = undefined;
        }
        // Note: We'll still wait for the server to confirm the round is over
      }
    }, 1000);
  }
  // If no timer has been started yet but we're in playing phase, start it now
  else if (gameState.value.state === 'playing' && gameState.value.roundTime !== undefined) {
    startTimer(gameState.value.roundTime);
  }
  
  // Listen for time-up events from the server
  if (socketService.socket) {
    socketService.socket.on('time-up', () => {
      // Clear any local timer
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = undefined;
      }
      
      toast({
        title: "Time's up!",
        description: "The round has ended",
        variant: "destructive"
      });
    });
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  // Remove event listeners
  if (socketService.socket) {
    socketService.socket.off('time-up');
  }
})

// Get the current player
const currentPlayer = computed(() => {
  return players.value.find(p => p.id === currentPlayerId.value);
})

// Vote for a player
const votePlayer = async (targetId: string) => {
  // Get current player info
  const currentPlayer = players.value.find(p => p.id === currentPlayerId.value);
  
  // Check if player is trying to vote for the same player again
  if (currentPlayer?.votedFor === targetId) {
    toast({
      title: "Already voted",
      description: "You've already voted for this player. Choose someone else to change your vote.",
      duration: 3000,
    });
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // If player already voted for someone else, show that they're changing their vote
    const isChangingVote = currentPlayer?.hasVoted;
    
    await socketService.submitVote(targetId);
    
    // Update the local player state to reflect the vote change
    // This will be properly updated by the server but we update it locally for immediate feedback
    if (currentPlayer) {
      currentPlayer.hasVoted = true;
      currentPlayer.votedFor = targetId;
    }
    
    toast({
      title: isChangingVote ? "Vote changed" : "Vote submitted",
      description: isChangingVote ? "Your vote has been changed" : "Your vote has been recorded",
      duration: 3000,
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to submit vote';
  } finally {
    isLoading.value = false;
  }
}

// Return to lobby
const returnToLobby = async () => {
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

// Submit spy guess
const submitSpyGuess = async () => {
  if (!spyGuess.value) return
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.makeSpyGuess(spyGuess.value)
    
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
  if (!locationName) return '';
  
  // Sanitize the location name for use in the file path
  const sanitizedName = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Get the location-to-pack mapping from the game state
  // Using type assertion to handle the new property that TypeScript doesn't know about yet
  const gameStateAny = gameState.value as any;
  const locationToPack = gameStateAny?.locationToPack || {};
  
  // Get the pack ID for this location
  let packId = locationToPack[locationName];
  
  // If no pack ID is found, fall back to the first selected pack
  if (!packId) {
    const packs = gameState.value?.locationPacks || [];
    const selectedPacks = packs.filter(pack => pack.selected).map(pack => pack.id);
    packId = selectedPacks.length > 0 ? selectedPacks[0] : 'basic1';
  }
  
  return `/images/locations/${packId}/${sanitizedName}.png`;
};

// Get all possible locations from the server
const allPossibleLocations = ref<string[]>([]);

// Fetch locations from the server
const fetchPossibleLocations = async () => {
  try {
    const result = await socketService.getPossibleLocations();
    allPossibleLocations.value = result.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Fallback to some default locations if fetch fails
    allPossibleLocations.value = [];
  }
};

// Get sorted locations for selection
const sortedLocationsForSelection = computed(() => {
  if (!locationTilesRef.value) return [];
  return locationTilesRef.value.getSortedLocationsForSelection;
});

// Filter locations based on search
const filteredLocationsForSelection = computed(() => {
  if (!locationSearch.value.trim()) {
    return sortedLocationsForSelection.value;
  }
  
  const searchTerm = locationSearch.value.toLowerCase().trim();
  return sortedLocationsForSelection.value.filter(location => 
    location.name.toLowerCase().includes(searchTerm)
  );
});

// Clear search function
const clearSearch = () => {
  locationSearch.value = '';
  searchInputRef.value?.focus();
};

// Focus search input when modal opens
watch(() => showSpyGuessModal.value, (isOpen) => {
  if (isOpen) {
    locationSearch.value = '';
    // Use nextTick to ensure the DOM has updated before focusing
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

// Voting results display functions
const getPlayerName = (id: string | undefined): string => {
  if (!id) return 'Unknown';
  const player = players.value.find(player => player.id === id);
  return player?.name || 'Unknown';
};

// Add this computed property to determine when to show vote counts
const showVoteCounts = computed(() => {
  // Show votes during playing and voting phases as well as results
  return true;
});

// Helper for vote counts in results modal
const getVoteCount = (playerId: string): number => {
  if (!votingResults.value?.votes || !playerId) return 0;
  return votingResults.value.votes[playerId] || 0;
};

// Sort players by vote count for results display
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => {
    const votesA = getVoteCount(a.id);
    const votesB = getVoteCount(b.id);
    return votesB - votesA; // Sort by descending vote count
  });
});

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/locations/placeholder.png';
};

// Update the computed properties section to add timer styling
const timerWarning = computed(() => timeIsLow.value)
const timerStyle = computed(() => {
  return timerWarning.value ? 'text-red-500 font-bold' : ''
})

// Add a new ref for tracking low time status
const timeIsLow = ref(false)

// End round early
const endRoundEarly = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await socketService.endRoundEarly()
  } catch (error) {
    console.error('Error ending round early:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to end round early'
  } finally {
    isLoading.value = false
  }
}

// Add a new ref for tracking identity visibility
const infoHidden = ref(localStorage.getItem('spyfall-identity-hidden') === 'true')

// Toggle identity visibility
const toggleInfoVisibility = () => {
  infoHidden.value = !infoHidden.value
  
  // If hiding identity and spy guess modal is open, close it
  if (infoHidden.value && showSpyGuessModal.value) {
    showSpyGuessModal.value = false
  }
}

// Handler for spy guess button that checks if info is hidden
const handleSpyGuessClick = () => {
  if (infoHidden.value) {
    // If info is hidden, tell the user they need to show info first
    toast({
      title: "Identity Hidden",
      description: "You need to show your identity information before making a guess",
      variant: "destructive",
      duration: 3000,
    })
  } else {
    showSpyGuessModal.value = true
  }
}
</script>

<style scoped>
.location-tile {
  display: flex;
  flex-direction: column;
  height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  transition: all 0.2s;
  background: white;
  padding: 0;
}

.location-tile:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.location-tile:focus {
  outline: none;
  ring: 2px solid #f97316;
}

.location-tile.selected {
  border-color: #f97316;
  background-color: #fff7ed;
  box-shadow: 0 0 0 1px #f97316;
}

.location-image {
  height: 60px;
  width: 100%;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1/1;
}

.location-name {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.375rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.1;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  margin: 0 auto;
}
</style> 