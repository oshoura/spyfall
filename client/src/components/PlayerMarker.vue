<template>
  <div class="grid gap-3">
    <div 
      v-for="player in players" 
      :key="player.id"
      class="player-marker flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer transition-all hover:shadow-md"
      :class="{
        'opacity-60 border-red-200': player.status === 'scratched',
        'bg-green-50 border-green-300': player.status === 'starred',
        'border-l-4 border-l-blue-500': player.id === currentPlayerId,
        'pointer-events-none': player.id === currentPlayerId,
        'bg-purple-50 border-purple-300': hasCurrentUserVotedFor(player.id)
      }"
      @click="togglePlayerStatus(player)"
    >
      <div class="flex items-center space-x-2">
        <div class="w-10 h-10 rounded-full flex items-center justify-center"
             :class="{ 
               'bg-blue-100 text-blue-700': player.status === 'normal' && !hasCurrentUserVotedFor(player.id),
               'bg-green-100 text-green-700': player.status === 'starred',
               'bg-red-100 text-red-700': player.status === 'scratched',
               'bg-purple-100 text-purple-700': hasCurrentUserVotedFor(player.id)
             }">
          <span class="font-bold">{{ player.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center">
            <span class="font-medium">{{ player.name }}</span>
            <span v-if="player.id === currentPlayerId" class="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
            <span v-if="player.id === hostId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Host</span>
            <span v-if="hasCurrentUserVotedFor(player.id)" class="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Your Vote</span>
          </div>
          <div class="flex mt-1 space-x-2">
            <span v-if="player.hasVoted" class="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Voted
            </span>
            <span v-if="showVotes && player.votesReceived && player.votesReceived > 0" 
                  class="text-xs text-purple-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {{ player.votesReceived }} vote{{ player.votesReceived > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <div v-if="player.status === 'scratched'" class="text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
        </div>
        <div v-if="player.status === 'starred'" class="text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <Button
          v-if="showVoteButton && player.id !== currentPlayerId"
          @click.stop="voteForPlayer(player.id)"
          variant="destructive"
          size="sm"
          :class="{ 'bg-purple-600 hover:bg-purple-700': hasCurrentUserVotedFor(player.id) }"
        >
          {{ hasCurrentUserVotedFor(player.id) ? 'Voted' : 'Vote' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  status: 'normal' | 'scratched' | 'starred';
  hasVoted?: boolean;
  votesReceived?: number;
  votedFor?: string;
}

interface PlayerInput {
  id: string;
  name: string;
  hasVoted?: boolean;
  votesReceived?: number;
  votedFor?: string;
}

const props = defineProps<{
  gamePlayers: PlayerInput[];
  currentPlayerId: string;
  hostId: string;
  showVoteButton?: boolean;
  showVotes?: boolean;
}>();

const emit = defineEmits<{
  (e: 'vote', playerId: string): void;
}>();

const players = ref<Player[]>([]);

onMounted(() => {
  // Initialize players with all provided players
  players.value = props.gamePlayers.map(player => ({
    id: player.id,
    name: player.name,
    status: 'normal',
    hasVoted: player.hasVoted,
    votesReceived: player.votesReceived,
    votedFor: player.votedFor
  }));
});

const togglePlayerStatus = (player: Player) => {
  // Don't allow toggling your own status
  if (player.id === props.currentPlayerId) return;
  
  // Cycle through statuses: normal -> starred -> scratched -> normal
  if (player.status === 'normal') {
    player.status = 'starred';
  } else if (player.status === 'starred') {
    player.status = 'scratched';
  } else {
    player.status = 'normal';
  }
};

const voteForPlayer = (playerId: string) => {
  emit('vote', playerId);
};

// Function to check if the current user has voted for a specific player
const hasCurrentUserVotedFor = (playerId: string): boolean => {
  const currentPlayer = players.value.find(player => player.id === props.currentPlayerId);
  return currentPlayer?.votedFor === playerId;
};

const getStarredPlayers = computed(() => {
  return players.value
    .filter(player => player.status === 'starred')
    .map(player => player.id);
});

const getNormalPlayers = computed(() => {
  return players.value
    .filter(player => player.status === 'normal')
    .map(player => player.id);
});

const getScratchedPlayers = computed(() => {
  return players.value
    .filter(player => player.status === 'scratched')
    .map(player => player.id);
});

// Method to get sorted players for the modal
const getSortedPlayersForSelection = computed(() => {
  // First starred, then normal, then scratched
  return [
    ...players.value.filter(player => player.status === 'starred'),
    ...players.value.filter(player => player.status === 'normal'),
    ...players.value.filter(player => player.status === 'scratched')
  ];
});

defineExpose({
  getSortedPlayersForSelection
});
</script>

<style scoped>
.player-marker {
  transition: all 0.2s ease;
}

.player-marker:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 