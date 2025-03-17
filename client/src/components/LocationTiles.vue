<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    <div 
      v-for="location in locations" 
      :key="location.name"
      class="location-tile relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all"
      :class="{
        'opacity-40': location.status === 'scratched',
        'ring-2 ring-orange-500': location.status === 'starred'
      }"
      @click="toggleLocationStatus(location)"
    >
      <img 
        :src="getLocationImage(location.name)" 
        :alt="location.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <span class="text-white text-center font-medium px-2">{{ location.name }}</span>
      </div>
      <div v-if="location.status === 'scratched'" class="absolute inset-0 flex items-center justify-center">
        <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
        <div class="w-full h-0.5 bg-red-500 transform -rotate-45"></div>
      </div>
      <div v-if="location.status === 'starred'" class="absolute top-1 right-1 text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface LocationItem {
  name: string;
  status: 'normal' | 'scratched' | 'starred';
}

const props = defineProps<{
  allLocations: string[];
}>();

const emit = defineEmits<{
  (e: 'select', location: string): void;
}>();

const locations = ref<LocationItem[]>([]);

onMounted(() => {
  // Initialize locations with all provided locations
  locations.value = props.allLocations.map(name => ({
    name,
    status: 'normal'
  }));
});

const toggleLocationStatus = (location: LocationItem) => {
  // Cycle through statuses: normal -> starred -> scratched -> normal
  if (location.status === 'normal') {
    location.status = 'starred';
  } else if (location.status === 'starred') {
    location.status = 'scratched';
  } else {
    location.status = 'normal';
  }
};

const getLocationImage = (locationName: string): string => {
  // Sanitize location name for URL
  const sanitizedName = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // For now, use a basic pack path - this could be improved with actual pack detection
  return `/images/locations/basic/${sanitizedName}.png`;
};

const getStarredLocations = computed(() => {
  return locations.value
    .filter(loc => loc.status === 'starred')
    .map(loc => loc.name);
});

const getNormalLocations = computed(() => {
  return locations.value
    .filter(loc => loc.status === 'normal')
    .map(loc => loc.name);
});

const getScratchedLocations = computed(() => {
  return locations.value
    .filter(loc => loc.status === 'scratched')
    .map(loc => loc.name);
});

// Method to get sorted locations for the modal
const getSortedLocationsForSelection = computed(() => {
  // First starred, then normal, then scratched
  return [
    ...locations.value.filter(loc => loc.status === 'starred'),
    ...locations.value.filter(loc => loc.status === 'normal'),
    ...locations.value.filter(loc => loc.status === 'scratched')
  ];
});

defineExpose({
  getSortedLocationsForSelection
});
</script>

<style scoped>
.location-tile {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 