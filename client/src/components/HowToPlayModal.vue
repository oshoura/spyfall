<template>
  <DialogContent class="sm:max-w-[95%] md:max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="text-xl md:text-2xl font-bold text-stone-800">How to Play</DialogTitle>
      <DialogDescription class="text-sm md:text-base text-stone-600">Learn the rules of Spyfall in a few simple steps</DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 md:space-y-8 my-4 md:my-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2">
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Create or Join a Party</h3>
          <p class="text-stone-600 mb-4">One player creates a party and shares the unique code with friends. Others use this code to join the same game room.</p>
          <TutorialImages type="create-party" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Secret Roles</h3>
          <p class="text-stone-600 mb-4">One player is secretly assigned as the spy with no location knowledge, while all others learn the same secret location. The spy must figure out where everyone else is.</p>
          <TutorialImages type="location-packs" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Question & Uncover</h3>
          <p class="text-stone-600 mb-4">Regular players ask questions to identify the spy, while the spy tries to blend in without knowing the location. The spy wins by either guessing the location or avoiding detection.</p>
          <TutorialImages type="start-game" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Make Your Move</h3>
          <p class="text-stone-600 mb-4">Regular players must vote together to catch the spy, while the spy can win at any time by correctly guessing the secret location. Choose your strategy wisely!</p>
          <TutorialImages type="make-move" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Ask Questions</h3>
          <p class="text-stone-600 mb-4">Players take turns asking each other questions about the location. The spy must pretend to know where they are, while others try to identify the spy without revealing too much.</p>
          <TutorialImages type="asking-questions" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">6</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Vote for the Spy</h3>
          <p class="text-stone-600 mb-4">When players call for a vote, everyone votes on who they think is the spy. If the spy is caught, the other players win. If not, the spy wins!</p>
          <TutorialImages type="voting" />
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">7</div>
        <div>
          <h3 class="text-xl font-bold mb-2 text-stone-800">Play Multiple Rounds</h3>
          <p class="text-stone-600 mb-4">Play several rounds with different locations and a new spy each time. The player with the most points at the end wins!</p>
          <TutorialImages type="multiple-rounds" />
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t grid md:grid-cols-2 gap-6">
        <div class="bg-orange-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold mb-4 text-orange-800">For the Spy</h3>
          <ul class="space-y-2 text-stone-700 list-disc pl-5">
            <li>Listen carefully to other players' questions and answers</li>
            <li>Ask vague questions that could apply to many locations</li>
            <li>If you figure out the location, start asking more specific questions</li>
            <li>Don't be afraid to guess the location if you're about to be caught</li>
          </ul>
        </div>
        <div class="bg-stone-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold mb-4 text-stone-800">For Other Players</h3>
          <ul class="space-y-2 text-stone-700 list-disc pl-5">
            <li>Ask questions that only someone at the location would know</li>
            <li>Be careful not to give away too much information</li>
            <li>Pay attention to suspicious answers or questions</li>
            <li>Coordinate with other players to trap the spy</li>
          </ul>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button asChild variant="default" class="bg-orange-500 hover:bg-orange-600 text-white">
        <RouterLink to="/play" class="w-full sm:w-auto text-lg font-bold py-6">
          Play Now
        </RouterLink>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import TutorialImages from './TutorialImages.vue';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
</script> 