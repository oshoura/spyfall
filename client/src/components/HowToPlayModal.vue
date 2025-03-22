<template>
  <DialogContent class="sm:max-w-[95%] md:max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="text-xl md:text-2xl font-bold text-stone-800">How to Play</DialogTitle>
      <DialogDescription class="text-sm md:text-base text-stone-600">Learn the rules of Spyfall in a few simple steps</DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 md:space-y-8 my-4 md:my-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2">
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Create or Join a Party</h3>
          <p class="text-stone-600 mb-4">One player creates a party and shares the unique code with friends.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="create-party" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Choose Game Settings</h3>
          <p class="text-stone-600 mb-4">The host can set round time and select location packs with different themed settings.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="location-packs" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Gather Your Players</h3>
          <p class="text-stone-600 mb-4">You need at least 3 players to start (maximum 16). All players must mark themselves ready.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="start-game" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Start the Round</h3>
          <p class="text-stone-600 mb-4">Everyone except one player (the spy) learns the location. The spy must figure it out secretly.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="asking-questions" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Ask Questions</h3>
          <p class="text-stone-600 mb-4">Players take turns asking questions. Non-spies avoid revealing too much, while the spy tries to blend in.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="asking-questions" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">6</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Spy Strategy</h3>
          <p class="text-stone-600 mb-4">As the spy, mark locations you suspect and make a guess at any time. Win by guessing correctly!</p>
          <div class="w-full max-w-full">
            <TutorialImages type="make-move" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">7</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">Vote for the Spy</h3>
          <p class="text-stone-600 mb-4">Players vote for who they think is the spy. If identified correctly, non-spy players win.</p>
          <div class="w-full max-w-full">
            <TutorialImages type="voting" />
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <div class="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">8</div>
        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2 text-stone-800">End of Round</h3>
          <p class="text-stone-600 mb-4">See who was the spy and what the location was. Return to lobby for another round!</p>
          <div class="w-full max-w-full">
            <TutorialImages type="multiple-rounds" />
          </div>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t grid md:grid-cols-2 gap-6">
        <div class="bg-orange-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold mb-4 text-orange-800">For the Spy</h3>
          <ul class="space-y-2 text-stone-700 list-disc pl-5">
            <li>Listen to other players' questions and answers</li>
            <li>Ask vague questions applicable to many locations</li>
            <li>Mark locations to track your suspicions</li>
            <li>Guess when confident or survive until time runs out</li>
          </ul>
        </div>
        <div class="bg-stone-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold mb-4 text-stone-800">For Other Players</h3>
          <ul class="space-y-2 text-stone-700 list-disc pl-5">
            <li>Ask questions someone at the location would know</li>
            <li>Be careful not to reveal too much information</li>
            <li>Pay attention to suspicious answers</li>
            <li>Mark suspicious players and coordinate voting</li>
          </ul>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <RouterLink to="/play" class="inline-block">
        <Button variant="default" class="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-8">
          Play Now
        </Button>
      </RouterLink>
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