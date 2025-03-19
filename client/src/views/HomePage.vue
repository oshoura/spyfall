<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <header class="relative overflow-hidden bg-stone-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col items-center relative z-10">
        <!-- Logo -->
        <img src="/images/spyfall_logo.jpg" alt="Spyfall Logo" class="w-24 h-24 md:w-32 md:h-32 bg-stone-200 rounded-lg object-cover mb-8" />
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-3 md:mb-4 tracking-tight">Spyfall</h1>
        <p class="text-lg md:text-xl lg:text-2xl text-center text-stone-300 max-w-2xl mb-8 md:mb-10">Find the spy before the spy finds you</p>
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild variant="orange" size="lg" class="w-full">
            <RouterLink to="/play" class="text-lg font-bold py-6">
              Play Now
            </RouterLink>
          </Button>
          <Dialog v-model:open="headerDialogOpen">
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" class="border-white text-slate-700 border-2 hover:bg-white/10 hover:text-slate-100 w-full">
                <span class="text-lg font-bold py-6">How to Play</span>
              </Button>
            </DialogTrigger>
            <HowToPlayModal />
          </Dialog>
        </div>
      </div>
    </header>

    <!-- How to Play Section -->
    <div class="py-12 md:py-16 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800">How to Play</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">1</div>
            <h3 class="text-lg md:text-xl font-bold mb-2 text-gray-800">Create a Party</h3>
            <p class="text-gray-600">Create a game room and invite your friends using a unique code</p>
          </div>
          <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">2</div>
            <h3 class="text-lg md:text-xl font-bold mb-2 text-gray-800">Secret Roles</h3>
            <p class="text-gray-600">One player is secretly assigned as the spy with no location knowledge, while all others learn the same secret location</p>
          </div>
          <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">3</div>
            <h3 class="text-lg md:text-xl font-bold mb-2 text-gray-800">Question & Uncover</h3>
            <p class="text-gray-600">Regular players ask questions to identify the spy, while the spy tries to blend in without knowing the location</p>
          </div>
          <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">4</div>
            <h3 class="text-lg md:text-xl font-bold mb-2 text-gray-800">Make Your Move</h3>
            <p class="text-gray-600">Regular players vote to catch the spy, while the spy can win by correctly guessing the location</p>
          </div>
        </div>
        <div class="text-center mt-8 md:mt-10">
          <Dialog v-model:open="learnMoreDialogOpen">
            <DialogTrigger asChild>
              <Button variant="orange" size="lg">
                <span class="text-lg font-bold">Learn More</span>
              </Button>
            </DialogTrigger>
            <HowToPlayModal />
          </Dialog>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Play?</h2>
        <p class="text-base md:text-xl text-white/80 mb-6 md:mb-8">Gather your friends and start a game now!</p>
        <Button asChild variant="white" size="lg">
          <RouterLink to="/play" class="text-lg font-bold py-6">
            Play Spyfall
          </RouterLink>
        </Button>
        <p class="text-sm md:text-base text-white/70 mt-8 pt-8 border-t border-white/20">&copy; {{ new Date().getFullYear() }} Spyfall Game. All rights reserved.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog';
import HowToPlayModal from '@/components/HowToPlayModal.vue';

// Dialog state
const headerDialogOpen = ref(false);
const learnMoreDialogOpen = ref(false);
</script> 