<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <!-- Hero Section -->
    <header class="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 flex flex-col items-center">
        <img src="/images/spyfall_logo.jpg" alt="Spyfall Logo" class="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-xl mb-8 border-4 border-white" />
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 tracking-tight">Spyfall</h1>
        <p class="text-xl md:text-2xl text-center text-blue-100 max-w-2xl mb-10">The ultimate party game of deception and deduction</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/play" class="px-8 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            Play Now
          </router-link>
          <button @click="openHowToPlay" class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-200">
            How to Play
          </button>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute -bottom-6 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="w-full">
          <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </header>

    <!-- Features Section -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="text-5xl mb-4 text-blue-600">🎮</div>
          <h3 class="text-xl font-bold mb-2 text-gray-800">Easy to Learn</h3>
          <p class="text-gray-600">Simple rules that anyone can pick up in minutes</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="text-5xl mb-4 text-blue-600">👥</div>
          <h3 class="text-xl font-bold mb-2 text-gray-800">Multiplayer</h3>
          <p class="text-gray-600">Play with 3-8 friends online from anywhere</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="text-5xl mb-4 text-blue-600">🌍</div>
          <h3 class="text-xl font-bold mb-2 text-gray-800">Diverse Locations</h3>
          <p class="text-gray-600">Over 30 unique locations across different packs</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="text-5xl mb-4 text-blue-600">🕵️</div>
          <h3 class="text-xl font-bold mb-2 text-gray-800">Be the Spy</h3>
          <p class="text-gray-600">Blend in or catch the impostor among you</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p class="text-xl text-blue-100 mb-8">Gather your friends and start a game now!</p>
        <router-link to="/play" class="inline-block px-8 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
          Play Spyfall
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {{ new Date().getFullYear() }} Spyfall Game. All rights reserved.</p>
      </div>
    </footer>
  </div>
  
  <!-- How to Play Modal -->
  <Teleport to="body">
    <div 
      v-if="howToPlayOpen" 
      class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      @click.self="howToPlayOpen = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 class="text-2xl font-bold text-gray-800">How to Play</h2>
          <button @click="howToPlayOpen = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-8">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Create or Join a Party</h3>
              <p class="text-gray-600 mb-4">One player creates a party and shares the unique code with friends. Others use this code to join the same game room.</p>
              <TutorialImages type="create-party" />
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Select Location Packs</h3>
              <p class="text-gray-600 mb-4">The host can choose which location packs to include in the game: Basic, Advanced, or Tourist Attractions.</p>
              <TutorialImages type="location-packs" />
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Start the Game</h3>
              <p class="text-gray-600 mb-4">Once everyone is ready, the host starts the game. Each player is assigned a role - one player becomes the spy, while others learn the location.</p>
              <TutorialImages type="start-game" />
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Ask Questions</h3>
              <p class="text-gray-600 mb-4">Players take turns asking each other questions about the location. The spy must pretend to know where they are, while others try to identify the spy without revealing too much.</p>
              <TutorialImages type="asking-questions" />
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Vote for the Spy</h3>
              <p class="text-gray-600 mb-4">When players call for a vote, everyone votes on who they think is the spy. If the spy is caught, the other players win. If not, the spy wins!</p>
              <TutorialImages type="voting" />
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-gray-800">Play Multiple Rounds</h3>
              <p class="text-gray-600 mb-4">Play several rounds with different locations and a new spy each time. The player with the most points at the end wins!</p>
              <TutorialImages type="multiple-rounds" />
            </div>
          </div>
          
          <div class="mt-8 pt-8 border-t grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4 text-blue-800">For the Spy</h3>
              <ul class="space-y-2 text-gray-700 list-disc pl-5">
                <li>Listen carefully to other players' questions and answers</li>
                <li>Ask vague questions that could apply to many locations</li>
                <li>If you figure out the location, start asking more specific questions</li>
                <li>Don't be afraid to guess the location if you're about to be caught</li>
              </ul>
            </div>
            <div class="bg-indigo-50 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4 text-indigo-800">For Other Players</h3>
              <ul class="space-y-2 text-gray-700 list-disc pl-5">
                <li>Ask questions that only someone at the location would know</li>
                <li>Be careful not to give away too much information</li>
                <li>Pay attention to suspicious answers or questions</li>
                <li>Coordinate with other players to trap the spy</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-gray-50 p-6 border-t flex justify-center">
          <router-link to="/play" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition-all duration-200">
            Play Now
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TutorialImages from '../components/TutorialImages.vue';

const howToPlayOpen = ref(false);

function openHowToPlay() {
  howToPlayOpen.value = true;
}
</script> 