<template>
  <div class="tutorial-images">
    <svg v-if="type === 'create-party'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      <text x="400" y="100" text-anchor="middle" font-size="24" fill="#2c3e50">Spyfall</text>
      <rect x="200" y="150" width="400" height="50" rx="4" fill="#f8f9fa" stroke="#dee2e6" />
      <text x="220" y="180" font-size="14" fill="#6c757d">Enter your name</text>
      <rect x="200" y="220" width="400" height="50" rx="4" fill="#007bff" />
      <text x="400" y="250" text-anchor="middle" font-size="16" fill="white">Create Party</text>
    </svg>

    <svg v-else-if="type === 'location-packs'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      <text x="400" y="80" text-anchor="middle" font-size="18" fill="#2c3e50">Location Packs</text>
      
      <rect x="150" y="100" width="220" height="100" rx="4" fill="#f8fff9" stroke="#28a745" stroke-width="2" />
      <text x="260" y="130" text-anchor="middle" font-size="16" fill="#2c3e50">Basic Locations</text>
      <text x="260" y="160" text-anchor="middle" font-size="12" fill="#6c757d">12 locations</text>
      
      <rect x="430" y="100" width="220" height="100" rx="4" fill="white" stroke="#dee2e6" />
      <text x="540" y="130" text-anchor="middle" font-size="16" fill="#2c3e50">Advanced Locations</text>
      <text x="540" y="160" text-anchor="middle" font-size="12" fill="#6c757d">12 locations</text>
      
      <rect x="150" y="220" width="220" height="100" rx="4" fill="white" stroke="#dee2e6" />
      <text x="260" y="250" text-anchor="middle" font-size="16" fill="#2c3e50">Tourist Attractions</text>
      <text x="260" y="280" text-anchor="middle" font-size="12" fill="#6c757d">12 locations</text>
    </svg>

    <svg v-else-if="type === 'start-game'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      <text x="400" y="80" text-anchor="middle" font-size="18" fill="#2c3e50">Party Lobby</text>
      
      <rect x="150" y="100" width="500" height="150" rx="4" fill="#f8f9fa" />
      <text x="400" y="130" text-anchor="middle" font-size="16" fill="#2c3e50">Players (4)</text>
      
      <rect x="180" y="150" width="440" height="30" rx="4" fill="white" />
      <text x="220" y="170" font-size="14" fill="#2c3e50">Player 1</text>
      <rect x="500" y="155" width="80" height="20" rx="999" fill="#28a745" />
      <text x="540" y="170" text-anchor="middle" font-size="12" fill="white">Ready</text>
      
      <rect x="180" y="190" width="440" height="30" rx="4" fill="white" />
      <text x="220" y="210" font-size="14" fill="#2c3e50">Player 2</text>
      <rect x="500" y="195" width="80" height="20" rx="999" fill="#28a745" />
      <text x="540" y="210" text-anchor="middle" font-size="12" fill="white">Ready</text>
      
      <rect x="300" y="280" width="200" height="40" rx="4" fill="#007bff" />
      <text x="400" y="305" text-anchor="middle" font-size="16" fill="white">Start Game</text>
    </svg>

    <svg v-else-if="type === 'asking-questions'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <rect x="150" y="70" width="500" height="40" rx="4" fill="#f8f9fa" />
      <text x="180" y="95" font-size="18" fill="#2c3e50">7:45</text>
      <text x="500" y="95" font-size="18" fill="#2c3e50">Location: <tspan fill="#007bff">Hospital</tspan></text>
      
      <rect x="150" y="130" width="150" height="200" rx="4" fill="#f8f9fa" />
      <rect x="160" y="150" width="130" height="30" rx="4" fill="white" stroke="#007bff" stroke-width="2" />
      <text x="180" y="170" font-size="14" fill="#2c3e50">Player 1</text>
      
      <rect x="160" y="190" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="210" font-size="14" fill="#2c3e50">Player 2</text>
      
      <rect x="160" y="230" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="250" font-size="14" fill="#2c3e50">Player 3</text>
      
      <rect x="160" y="270" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="290" font-size="14" fill="#2c3e50">Player 4</text>
      
      <rect x="320" y="130" width="330" height="200" rx="4" fill="#f8f9fa" />
      <text x="485" y="180" text-anchor="middle" font-size="18" fill="#2c3e50">It's your turn!</text>
      <text x="485" y="210" text-anchor="middle" font-size="14" fill="#6c757d">Ask another player a question about the location.</text>
      <rect x="400" y="240" width="170" height="40" rx="4" fill="#007bff" />
      <text x="485" y="265" text-anchor="middle" font-size="16" fill="white">End Turn</text>
    </svg>

    <svg v-else-if="type === 'voting'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <rect x="150" y="70" width="500" height="40" rx="4" fill="#f8f9fa" />
      <text x="180" y="95" font-size="18" fill="#2c3e50">0:00</text>
      <text x="500" y="95" font-size="18" fill="#2c3e50">Location: <tspan fill="#007bff">Hospital</tspan></text>
      
      <rect x="150" y="130" width="150" height="200" rx="4" fill="#f8f9fa" />
      <rect x="160" y="150" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="170" font-size="14" fill="#2c3e50">Player 1</text>
      <rect x="240" y="155" width="40" height="20" rx="4" fill="#dc3545" />
      <text x="260" y="170" text-anchor="middle" font-size="12" fill="white">Vote</text>
      
      <rect x="160" y="190" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="210" font-size="14" fill="#2c3e50">Player 2</text>
      <rect x="240" y="195" width="40" height="20" rx="4" fill="#dc3545" />
      <text x="260" y="210" text-anchor="middle" font-size="12" fill="white">Vote</text>
      
      <rect x="160" y="230" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="250" font-size="14" fill="#2c3e50">Player 3</text>
      <rect x="240" y="235" width="40" height="20" rx="4" fill="#dc3545" />
      <text x="260" y="250" text-anchor="middle" font-size="12" fill="white">Vote</text>
      
      <rect x="160" y="270" width="130" height="30" rx="4" fill="white" />
      <text x="180" y="290" font-size="14" fill="#2c3e50">Player 4</text>
      <rect x="240" y="275" width="40" height="20" rx="4" fill="#dc3545" />
      <text x="260" y="290" text-anchor="middle" font-size="12" fill="white">Vote</text>
      
      <rect x="320" y="130" width="330" height="200" rx="4" fill="#f8f9fa" />
      <text x="485" y="180" text-anchor="middle" font-size="18" fill="#2c3e50">Time to vote!</text>
      <text x="485" y="210" text-anchor="middle" font-size="14" fill="#6c757d">Who do you think is the spy?</text>
    </svg>

    <svg v-else-if="type === 'multiple-rounds'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <text x="400" y="100" text-anchor="middle" font-size="24" fill="#2c3e50">Voting Results</text>
      
      <text x="400" y="150" text-anchor="middle" font-size="16" fill="#2c3e50">The spy was: <tspan font-weight="bold">Player 3</tspan></text>
      <text x="400" y="180" text-anchor="middle" font-size="16" fill="#2c3e50">The location was: <tspan font-weight="bold">Hospital</tspan></text>
      
      <text x="400" y="220" text-anchor="middle" font-size="20" font-weight="bold" fill="#28a745">The spy was caught!</text>
      
      <rect x="300" y="260" width="200" height="40" rx="4" fill="#007bff" />
      <text x="400" y="285" text-anchor="middle" font-size="16" fill="white">Next Round</text>
    </svg>

    <svg v-else-if="type === 'make-move'" viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <rect x="150" y="70" width="500" height="40" rx="4" fill="#f8f9fa" />
      <text x="180" y="95" font-size="18" fill="#2c3e50">3:20</text>
      <text x="500" y="95" font-size="18" fill="#2c3e50">Location: <tspan fill="#007bff">???</tspan></text>
      
      <rect x="150" y="130" width="500" height="100" rx="4" fill="#f8f9fa" />
      <text x="400" y="170" text-anchor="middle" font-size="18" fill="#2c3e50">You are the Spy!</text>
      <text x="400" y="200" text-anchor="middle" font-size="14" fill="#6c757d">Try to figure out the location or avoid detection</text>
      
      <rect x="150" y="240" width="240" height="90" rx="4" fill="#f8f9fa" />
      <text x="270" y="270" text-anchor="middle" font-size="16" fill="#2c3e50">Guess the Location</text>
      <rect x="200" y="290" width="140" height="30" rx="4" fill="#dc3545" />
      <text x="270" y="310" text-anchor="middle" font-size="14" fill="white">Make a Guess</text>
      
      <rect x="410" y="240" width="240" height="90" rx="4" fill="#f8f9fa" />
      <text x="530" y="270" text-anchor="middle" font-size="16" fill="#2c3e50">Vote for the Spy</text>
      <rect x="460" y="290" width="140" height="30" rx="4" fill="#007bff" />
      <text x="530" y="310" text-anchor="middle" font-size="14" fill="white">Call a Vote</text>
    </svg>

    <svg v-else viewBox="0 0 800 400" class="tutorial-svg">
      <rect width="800" height="400" fill="#f8f9fa" />
      <text x="400" y="200" text-anchor="middle" font-size="24" fill="#6c757d">Image placeholder</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'create-party' | 'location-packs' | 'start-game' | 'asking-questions' | 'voting' | 'multiple-rounds' | 'make-move'
}>();
</script>

<style scoped>
.tutorial-images {
  width: 100%;
}

.tutorial-svg {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 