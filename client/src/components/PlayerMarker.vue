<template>
  <div class="grid gap-3">
    <div 
      v-for="player in players" 
      :key="player.id"
      class="player-marker flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer transition-all"
      :class="{
        'opacity-60 border-red-200': player.status === 'scratched',
        'bg-green-50 border-green-300': player.status === 'starred',
        'border-l-4 border-l-blue-500': player.id === currentPlayerId,
        'pointer-events-none': player.id === currentPlayerId
      }"
      @click="togglePlayerStatus(player)"
    >
      <div class="flex items-center">
        <span>{{ player.name }}</span>
        <span v-if="player.id === currentPlayerId" class="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
        <span v-if="player.id === hostId" class="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Host</span>
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
        >
          Vote
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
}

interface PlayerInput {
  id: string;
  name: string;
}

const props = defineProps<{
  gamePlayers: PlayerInput[];
  currentPlayerId: string;
  hostId: string;
  showVoteButton?: boolean;
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
    status: 'normal'
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