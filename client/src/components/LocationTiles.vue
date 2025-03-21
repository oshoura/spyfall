<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    <div 
      v-for="location in locations" 
      :key="location.name"
      class="location-tile relative rounded-lg overflow-hidden cursor-pointer group"
      :class="{
        'ring-2 ring-green-500 bg-green-50': location.status === 'starred',
        'ring-2 ring-red-500 bg-red-50': location.status === 'scratched',
      }"
      @click="toggleLocationStatus(location)"
    >
      <div class="aspect-square">
        <img 
          :src="props.getLocationImage ? props.getLocationImage(location.name) : getDefaultImage(location.name)" 
          :alt="location.name"
          class="w-full h-full object-cover"
          :class="{ 'opacity-50': location.status === 'scratched' }"
        />
      </div>
      
      <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end p-2">
        <span class="text-sm font-medium text-white">{{ location.name }}</span>
      </div>
      
      <!-- Status indicators -->
      <div class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1" v-if="location.status === 'starred'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      
      <div class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1" v-if="location.status === 'scratched'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props
interface Props {
  allLocations: string[];
  getLocationImage?: (locationName: string) => string;
}

const props = defineProps<Props>();

// Location status type
type LocationStatus = 'normal' | 'scratched' | 'starred';

// Location type
interface Location {
  name: string;
  status: LocationStatus;
}

// State
const locations = ref<Location[]>([]);

// Initialize locations when props change
watch(() => props.allLocations, (newLocations) => {
  locations.value = newLocations.map(name => ({
    name,
    status: 'normal'
  }));
}, { immediate: true });

// Toggle location status
const toggleLocationStatus = (location: Location) => {
  if (location.status === 'normal') {
    location.status = 'starred';
  } else if (location.status === 'starred') {
    location.status = 'scratched';
  } else {
    location.status = 'normal';
  }
};

// Default image function if no getLocationImage is provided
const getDefaultImage = (locationName: string): string => {
  const sanitizedName = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `/images/locations/basic/${sanitizedName}.png`;
};

// Get sorted locations for selection
const getSortedLocationsForSelection = computed(() => {
  return [...locations.value].sort((a, b) => {
    // Sort by status: starred first, normal second, scratched last
    const statusOrder = { starred: 0, normal: 1, scratched: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
});

// Expose to parent component
defineExpose({
  getSortedLocationsForSelection
});
</script>

<style scoped>
.location-tile {
  transition: all 0.2s ease;
}

.location-tile:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 