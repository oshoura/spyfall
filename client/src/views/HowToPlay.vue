<template>
  <div class="min-h-screen bg-gray-50 pt-4">
    <!-- Header -->
    <AppHeader :show_play_button="true" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-stone-800 mb-4">How to Play Spyfall</h1>
        <p class="text-xl text-stone-600 max-w-3xl mx-auto">
          A thrilling social deduction game where one spy must figure out the secret location 
          while everyone else tries to catch them!
        </p>
      </div>

      <!-- Rules -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-stone-800 mb-6 text-center">Rules</h2>
        <div class="max-w-4xl mx-auto space-y-4 text-stone-700">
          <div class="flex items-start">
            <span class="font-bold mr-2">Roles:</span>
            <span class="text-lg">Everyone is assigned the same location and only the spy doesn't know it.</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold mr-2">Goal:</span>
            <span class="text-lg">Figure out who the spy is while the spy tries to blend in and find the location.</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold mr-2">Strategy:</span>
            <span class="text-lg">Ask each other questions about the location to expose the spy.</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold mr-2">Play:</span>
            <span class="text-lg">Ask specific questions that pressure the spy, but not so specific that you reveal the location.</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold mr-2">Winning:</span>
            <span class="text-lg">If you suspect the spy, vote for them. If you suspect the location, vote for it.</span>
          </div>
        </div>
      </div>

      <!-- Roles -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-stone-800 mb-6 text-center">Roles</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">🕵️</span>
              Spy
            </h3>
            <p class="text-stone-700 mb-4">
              <strong>You don't know the location!</strong> Your goal is to figure out where everyone is by listening to their questions and answers.
            </p>
            <ul class="text-stone-700 list-disc pl-5 space-y-2">
              <li>Ask vague questions that could apply anywhere</li>
              <li>Listen carefully to other players' responses</li>
              <li>Blend in without revealing you're the spy</li>
              <li>Win by correctly guessing the location</li>
            </ul>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">👥</span>
              Everyone Else
            </h3>
            <p class="text-stone-700 mb-4">
              <strong>You know the secret location!</strong> Your goal is to find the spy by asking questions that only someone at the location would know.
            </p>
            <ul class="text-stone-700 list-disc pl-5 space-y-2">
              <li>Ask specific questions about the location</li>
              <li>Answer questions without revealing too much</li>
              <li>Watch for suspicious or vague responses</li>
              <li>Win by correctly identifying the spy</li>
            </ul>
          </div>
        </div>
      </div>



      <!-- Strategy Tips -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-stone-800 mb-6 text-center">Strategy Tips</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">🕵️</span>
              Spy Strategy
            </h3>
            <ul class="space-y-2 text-stone-700 list-disc pl-5">
              <li><strong>Listen carefully</strong> to questions and answers to piece together clues about the location</li>
              <li><strong>Ask vague questions</strong> like "What's the weather like?" or "How busy is it here?"</li>
              <li><strong>Give believable answers</strong> that could work for many locations</li>
              <li><strong>Guess when confident</strong> - you win if you're right!</li>
              <li><strong>Stay calm</strong> and don't act suspicious when you can't answer a question</li>
            </ul>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">👥</span>
              Regular Player Strategy
            </h3>
            <ul class="space-y-2 text-stone-700 list-disc pl-5">
              <li><strong>Ask specific questions</strong> like "What's the most popular item here?" or "What time does it close?"</li>
              <li><strong>Answer carefully</strong> - give enough detail to prove you know the location, but not so much that you help the spy</li>
              <li><strong>Watch for vague answers</strong> or questions that could apply anywhere</li>
              <li><strong>Coordinate with others</strong> to identify who might be the spy</li>
              <li><strong>Vote together</strong> when you're confident about who the spy is</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Winning Conditions -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-stone-800 mb-6 text-center">How to Win</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">🕵️</span>
              The Spy Wins If:
            </h3>
            <ul class="text-stone-700 space-y-2 list-disc pl-5">
              <li><strong>Correctly guesses the location</strong> - Make a guess and be right!</li>
              <li><strong>Survives until time runs out</strong> - Don't get caught before the timer ends</li>
            </ul>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-stone-800 mb-4 flex items-center">
              <span class="text-2xl mr-3">👥</span>
              Regular Players Win If:
            </h3>
            <ul class="text-stone-700 space-y-2 list-disc pl-5">
              <li><strong>Successfully vote out the spy</strong> - Identify and vote for the correct person</li>
              <li><strong>The spy makes an incorrect guess</strong> - The spy guesses wrong and reveals themselves</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Pro Tips -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 class="text-2xl font-bold text-stone-800 mb-6 text-center flex items-center justify-center">
          <span class="text-3xl mr-3">💡</span>
          Pro Tips
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <ul class="space-y-2 text-stone-700 list-disc pl-5">
              <li><strong>Ask follow-up questions</strong> to dig deeper into suspicious answers</li>
              <li><strong>Pay attention to hesitation</strong> - spies often pause when they can't answer</li>
              <li><strong>Use the timer strategically</strong> - pressure can make spies slip up</li>
            </ul>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <ul class="space-y-2 text-stone-700 list-disc pl-5">
              <li><strong>Mix up your questions</strong> - don't always ask the same type</li>
              <li><strong>Work together</strong> - regular players should share suspicions</li>
              <li><strong>Have fun!</strong> The best games are when everyone gets into character</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center bg-white rounded-2xl shadow-lg p-12">
        <h2 class="text-3xl font-bold text-stone-800 mb-4">Ready to Play?</h2>
        <p class="text-xl text-stone-600 mb-8">Now that you know how to play, gather your friends and start your first game!</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/play" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
            Start Playing Now
          </RouterLink>
          <RouterLink to="/" class="bg-stone-200 hover:bg-stone-300 text-stone-800 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
            Back to Home
          </RouterLink>
        </div>
      </div>
    </main>


  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
</script>
