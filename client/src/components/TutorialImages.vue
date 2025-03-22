<template>
  <div class="tutorial-images">
    <svg v-if="type === 'create-party'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Title -->
      <text x="400" y="100" text-anchor="middle" font-size="24" fill="#2c3e50">Join the Game</text>
      
      <!-- Left side - Create New Party -->
      <rect x="150" y="150" width="250" height="160" rx="8" fill="white" stroke="#dee2e6" />
      <text x="275" y="180" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">Create New Party</text>
      <rect x="170" y="200" width="210" height="40" rx="4" fill="#f8f9fa" stroke="#dee2e6" />
      <text x="190" y="225" font-size="16" fill="#6c757d">Your Name</text>
      <rect x="170" y="250" width="210" height="40" rx="4" fill="#f97316" />
      <text x="275" y="275" text-anchor="middle" font-size="16" fill="white">Create Party</text>
      
      <!-- Right side - Join Party -->
      <rect x="410" y="150" width="250" height="160" rx="8" fill="white" stroke="#dee2e6" />
      <text x="535" y="180" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">Join Party</text>
      <rect x="430" y="200" width="210" height="40" rx="4" fill="#f8f9fa" stroke="#dee2e6" />
      <text x="450" y="225" font-size="16" fill="#6c757d">Party Code</text>
      <rect x="430" y="250" width="210" height="40" rx="4" fill="#f97316" />
      <text x="535" y="275" text-anchor="middle" font-size="16" fill="white">Join Party</text>
    </svg>

    <svg v-else-if="type === 'location-packs'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="20" width="600" height="350" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Game Settings -->
      <text x="400" y="50" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">Game Settings</text>
      
      <!-- Max Round Time -->
      <text x="150" y="90" font-size="16" font-weight="bold" fill="#2c3e50">Max Round Time (minutes)</text>
      
      <!-- Time options -->
      <rect x="150" y="110" width="80" height="40" rx="4" fill="white" stroke="#dee2e6" />
      <text x="190" y="135" text-anchor="middle" font-size="14" fill="#2c3e50">No Limit</text>
      
      <rect x="240" y="110" width="40" height="40" rx="4" fill="white" stroke="#dee2e6" />
      <text x="260" y="135" text-anchor="middle" font-size="14" fill="#2c3e50">1</text>
      
      <rect x="290" y="110" width="40" height="40" rx="4" fill="#f97316" />
      <text x="310" y="135" text-anchor="middle" font-size="14" fill="white">2</text>
      
      <rect x="340" y="110" width="40" height="40" rx="4" fill="white" stroke="#dee2e6" />
      <text x="360" y="135" text-anchor="middle" font-size="14" fill="#2c3e50">3</text>
      
      <!-- Location Packs as cards that match the join game cards -->
      <text x="150" y="180" font-size="16" font-weight="bold" fill="#2c3e50">Location Packs</text>
      
      <!-- Basic Pack 1 -->
      <rect x="150" y="200" width="250" height="160" rx="8" fill="#fff8f0" stroke="#f97316" stroke-width="2" />
      <text x="275" y="230" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">Basic Pack 1</text>
      <text x="275" y="260" text-anchor="middle" font-size="14" fill="#6c757d">26 locations</text>
      <text x="275" y="290" text-anchor="middle" font-size="12" fill="#64748b">Straightforward, everyday locations</text>
      
      <!-- Basic Pack 2 -->
      <rect x="410" y="200" width="250" height="160" rx="8" fill="white" stroke="#dee2e6" />
      <text x="535" y="230" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">Basic Pack 2</text>
      <text x="535" y="260" text-anchor="middle" font-size="14" fill="#6c757d">27 locations</text>
      <text x="535" y="290" text-anchor="middle" font-size="12" fill="#64748b">Public, entertainment settings</text>
    </svg>

    <svg v-else-if="type === 'start-game'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Party Lobby -->
      <text x="400" y="80" text-anchor="middle" font-size="24" font-weight="bold" fill="#2c3e50">Party Lobby</text>
      
      <!-- Share code -->
      <rect x="150" y="100" width="500" height="60" rx="4" fill="#f8f9fa" />
      <rect x="170" y="115" width="100" height="30" rx="4" fill="white" stroke="#dee2e6" />
      <text x="220" y="135" text-anchor="middle" font-size="16" fill="#2c3e50">P87MJY</text>
      <text x="350" y="135" font-size="14" fill="#2c3e50">Share this code with your friends to join!</text>
      
      <!-- Players list -->
      <rect x="150" y="170" width="500" height="160" rx="4" fill="#f8f9fa" />
      <text x="180" y="195" font-size="16" font-weight="bold" fill="#2c3e50">Players (1)</text>
      
      <!-- Player entry as a 250x160 card -->
      <rect x="275" y="210" width="250" height="100" rx="8" fill="white" stroke="#dee2e6" />
      <circle cx="305" cy="245" r="15" fill="#cbd5e1" />
      <text x="305" y="250" text-anchor="middle" font-size="16" fill="#2c3e50">J</text>
      <text x="340" y="250" font-size="16" fill="#2c3e50">Jamie</text>
      <rect x="395" y="235" width="50" height="20" rx="999" fill="#f97316" />
      <text x="420" y="250" text-anchor="middle" font-size="12" fill="white">Host</text>
      <rect x="455" y="235" width="60" height="20" rx="999" fill="#6b7280" />
      <text x="485" y="250" text-anchor="middle" font-size="12" fill="white">Not Ready</text>
      
      <!-- Need more players message -->
      <text x="400" y="335" text-anchor="middle" font-size="16" fill="#f97316">Need 2 more players to start the game</text>
    </svg>

    <svg v-else-if="type === 'asking-questions'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Round info -->
      <text x="180" y="80" font-size="20" font-weight="bold" fill="#2c3e50">Round 1</text>
      <rect x="500" y="70" width="120" height="30" rx="999" fill="white" stroke="#6b7280" />
      <text x="560" y="90" text-anchor="middle" font-size="14" fill="#6b7280">Hide Identity</text>
      
      <!-- Timer -->
      <text x="400" y="130" text-anchor="middle" font-size="24" fill="#2c3e50">1:57</text>
      
      <!-- Location (for non-spy) -->
      <text x="400" y="170" text-anchor="middle" font-size="16" fill="#2c3e50">Location: <tspan fill="#f97316" font-weight="bold">Hotel</tspan></text>
      
      <!-- Players as cards -->
      <rect x="150" y="190" width="500" height="160" rx="4" fill="#f8f9fa" />
      <text x="180" y="215" font-size="16" font-weight="bold" fill="#2c3e50">Players</text>
      
      <!-- Player entry as a 250x100 card with blue border -->
      <rect x="275" y="230" width="250" height="100" rx="8" fill="white" stroke="#3b82f6" stroke-width="2" />
      <circle cx="305" cy="270" r="15" fill="#cbd5e1" />
      <text x="305" y="275" text-anchor="middle" font-size="16" fill="#2c3e50">S</text>
      <text x="340" y="275" font-size="16" fill="#2c3e50">Sarah</text>
      <rect x="395" y="260" width="50" height="20" rx="999" fill="#3b82f6" />
      <text x="420" y="275" text-anchor="middle" font-size="12" fill="white">You</text>
      <rect x="455" y="260" width="50" height="20" rx="999" fill="#f97316" />
      <text x="480" y="275" text-anchor="middle" font-size="12" fill="white">Host</text>
    </svg>

    <svg v-else-if="type === 'voting'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Round info -->
      <text x="180" y="80" font-size="20" font-weight="bold" fill="#2c3e50">Round 1</text>
      <rect x="500" y="70" width="120" height="30" rx="999" fill="white" stroke="#6b7280" />
      <text x="560" y="90" text-anchor="middle" font-size="14" fill="#6b7280">Hide Identity</text>
      
      <!-- Timer -->
      <text x="400" y="130" text-anchor="middle" font-size="24" fill="#2c3e50">1:49</text>
      
      <!-- Players list -->
      <rect x="150" y="170" width="500" height="160" rx="4" fill="#f8f9fa" />
      <text x="180" y="195" font-size="16" font-weight="bold" fill="#2c3e50">Players</text>
      <text x="400" y="220" text-anchor="middle" font-size="14" fill="#64748b">You can vote for a player to maintain your cover</text>
      
      <!-- Player entry as a 250x100 card -->
      <rect x="275" y="235" width="250" height="100" rx="8" fill="white" stroke="#dee2e6" />
      <circle cx="305" cy="275" r="15" fill="#cbd5e1" />
      <text x="305" y="280" text-anchor="middle" font-size="16" fill="#2c3e50">J</text>
      <text x="340" y="280" font-size="16" fill="#2c3e50">Jamie</text>
      <rect x="395" y="265" width="50" height="20" rx="999" fill="#f97316" />
      <text x="420" y="280" text-anchor="middle" font-size="12" fill="white">Host</text>
      <rect x="530" y="265" width="70" height="30" rx="4" fill="#dc2626" />
      <text x="565" y="285" text-anchor="middle" font-size="14" fill="white">Vote</text>
    </svg>

    <svg v-else-if="type === 'multiple-rounds'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <!-- Results Dialog -->
      <rect x="150" y="50" width="500" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Result header -->
      <text x="400" y="90" text-anchor="middle" font-size="24" font-weight="bold" fill="#22c55e">The Spy Was Caught!</text>
      <text x="400" y="120" text-anchor="middle" font-size="16" fill="#64748b">Round 1 has ended</text>
      
      <!-- Location details -->
      <rect x="200" y="150" width="400" height="60" rx="8" fill="#f8f9fa" />
      <text x="400" y="180" text-anchor="middle" font-size="16" fill="#64748b">The location was</text>
      <text x="400" y="200" text-anchor="middle" font-size="24" font-weight="bold" fill="#2c3e50">Hotel</text>
      
      <!-- Spy details as a card -->
      <rect x="275" y="220" width="250" height="100" rx="8" fill="#fff8f0" stroke="#dee2e6" />
      <text x="315" y="265" font-size="16" fill="#64748b">The spy was</text>
      <text x="390" y="265" font-size="18" font-weight="bold" fill="#2c3e50">Michael</text>
      <rect x="455" y="255" width="50" height="20" rx="999" fill="#f97316" />
      <text x="480" y="270" text-anchor="middle" font-size="14" fill="white">Spy</text>
      
      <!-- Return to Lobby button -->
      <rect x="320" y="330" width="160" height="40" rx="4" fill="#f97316" />
      <text x="400" y="355" text-anchor="middle" font-size="16" fill="white">Return to Lobby</text>
    </svg>

    <svg v-else-if="type === 'make-move'" viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="400" fill="#f8f9fa" />
      <rect x="100" y="50" width="600" height="300" rx="8" fill="white" stroke="#dee2e6" />
      
      <!-- Round info for spy -->
      <text x="180" y="80" font-size="20" font-weight="bold" fill="#2c3e50">Round 1</text>
      <rect x="500" y="70" width="120" height="30" rx="999" fill="white" stroke="#6b7280" />
      <text x="560" y="90" text-anchor="middle" font-size="14" fill="#6b7280">Hide Identity</text>
      
      <!-- Timer -->
      <text x="400" y="130" text-anchor="middle" font-size="24" fill="#2c3e50">1:49</text>
      
      <!-- Spy message -->
      <text x="400" y="170" text-anchor="middle" font-size="20" font-weight="bold" fill="#f97316">You are the spy! Try to figure out the location.</text>
      
      <!-- Possible Locations section -->
      <rect x="150" y="190" width="500" height="160" rx="4" fill="#f8f9fa" />
      <text x="180" y="215" font-size="16" font-weight="bold" fill="#2c3e50">Possible Locations</text>
      <rect x="500" y="200" width="140" height="30" rx="4" fill="#dc2626" />
      <text x="570" y="220" text-anchor="middle" font-size="14" fill="white">Guess Location</text>
      
      <!-- Location tiles as 2 card rows that match card style -->
      <rect x="180" y="235" width="210" height="50" rx="8" fill="white" stroke="#dee2e6" />
      <rect x="410" y="235" width="210" height="50" rx="8" fill="white" stroke="#dee2e6" />
      <rect x="180" y="295" width="210" height="50" rx="8" fill="white" stroke="#dee2e6" />
      <rect x="410" y="295" width="210" height="50" rx="8" fill="white" stroke="#dee2e6" />
    </svg>

    <svg v-else viewBox="0 0 800 400" class="tutorial-svg" width="100%" preserveAspectRatio="xMidYMid meet">
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
  display: flex;
  justify-content: center;
}

.tutorial-svg {
  width: 100%;
  min-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
}
</style> 