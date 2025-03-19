<template>
  <div class="py-12 md:py-16 bg-stone-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-stone-800">How to Play</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">1</div>
          <h3 class="text-lg md:text-xl font-bold mb-2 text-stone-800">Create a Party</h3>
          <p class="text-stone-600">Create a game room and invite your friends using a unique code</p>
        </div>
        <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">2</div>
          <h3 class="text-lg md:text-xl font-bold mb-2 text-stone-800">Secret Roles</h3>
          <p class="text-stone-600">One player is secretly assigned as the spy with no location knowledge, while all others learn the same secret location</p>
        </div>
        <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">3</div>
          <h3 class="text-lg md:text-xl font-bold mb-2 text-stone-800">Question & Uncover</h3>
          <p class="text-stone-600">Regular players ask questions to identify the spy, while the spy tries to blend in without knowing the location</p>
        </div>
        <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-3 md:mb-4">4</div>
          <h3 class="text-lg md:text-xl font-bold mb-2 text-stone-800">Make Your Move</h3>
          <p class="text-stone-600">Regular players vote to catch the spy, while the spy can win by correctly guessing the location</p>
        </div>
      </div>
      <div class="text-center mt-8 md:mt-10">
        <slot></slot>
      </div>
    </div>
  </div>
</template> 