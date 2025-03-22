<template>
  <div class="test-page">
    <button @click="requestFullscreen" class="fullscreen-button">
      Toggle Fullscreen
    </button>
    <div v-if="loading" class="loading">
      Loading prayer times...
    </div>
    <div v-else class="prayer-times-container">
      <h1>Prayer Times</h1>
      <div class="next-prayer">
        <h2>Next Prayer</h2>
        <div class="prayer-name">{{ nextPrayer.name }}</div>
        <div class="countdown">{{ countdownDisplay }}</div>
      </div>
      <div class="all-prayers">
        <div v-for="(time, prayer) in prayerTimes" :key="prayer" 
             :class="['prayer-card', nextPrayer.name.toLowerCase() === prayer.toLowerCase() ? 'next' : '']">
          <div class="prayer-name">{{ formatPrayerName(prayer) }}</div>
          <div class="prayer-time">{{ time }}</div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Hi from Omar</h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestPage',
  data() {
    return {
      loading: true,
      prayerTimes: {},
      nextPrayer: { name: '', time: null },
      countdown: 0,
      countdownDisplay: '',
      countdownInterval: null,
      showModal: false,
      modalTimeout: null
    }
  },
  async mounted() {
    await this.fetchPrayerTimes();
    this.findNextPrayer();
    this.startCountdown();
    this.showGreetingModal();
    setTimeout(() => {
      this.requestFullscreen();
    }, 1000);
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout);
    }
  },
  methods: {
    showGreetingModal() {
      setTimeout(() => {
        this.showModal = true;
        this.modalTimeout = setTimeout(() => {
          this.showModal = false;
        }, 10000);
      }, 3000);
    },
    requestFullscreen() {
      console.log('requesting fullscreen');
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    },
    async fetchPrayerTimes() {
      try {
        const response = await fetch(
          "https://api.aladhan.com/v1/timings/01-01-2025?latitude=51.5194682&longitude=-0.1360365&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ",
          { headers: { accept: "application/json" } }
        );
        const data = await response.json();
        this.prayerTimes = data.data.timings;
        this.loading = false;
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        this.loading = false;
      }
    },
    formatPrayerName(name) {
      const formatted = {
        'Fajr': 'Fajr',
        'Dhuhr': 'Dhuhr',
        'Asr': 'Asr',
        'Maghrib': 'Maghrib',
        'Isha': 'Isha',
        'Sunrise': 'Sunrise',
        'Sunset': 'Sunset',
        'Imsak': 'Imsak',
        'Midnight': 'Midnight',
        'Firstthird': 'First Third',
        'Lastthird': 'Last Third'
      };
      return formatted[name] || name;
    },
    findNextPrayer() {
      const now = new Date();
      const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      let nextPrayer = null;
      let minDiff = Infinity;

      for (const prayer of prayers) {
        if (this.prayerTimes[prayer]) {
          const [hours, minutes] = this.prayerTimes[prayer].split(':').map(Number);
          const prayerTime = new Date();
          prayerTime.setHours(hours, minutes, 0, 0);
          
          // If prayer time has passed today, set it for tomorrow
          if (prayerTime < now) {
            prayerTime.setDate(prayerTime.getDate() + 1);
          }
          
          const diff = prayerTime - now;
          if (diff < minDiff) {
            minDiff = diff;
            nextPrayer = { name: prayer, time: prayerTime };
          }
        }
      }

      this.nextPrayer = nextPrayer;
      this.countdown = minDiff;
    },
    startCountdown() {
      this.updateCountdownDisplay();
      this.countdownInterval = setInterval(() => {
        const now = new Date();
        this.countdown = this.nextPrayer.time - now;
        
        if (this.countdown <= 0) {
          // Find next prayer when current countdown ends
          this.findNextPrayer();
        }
        
        this.updateCountdownDisplay();
      }, 1000);
    },
    updateCountdownDisplay() {
      const hours = Math.floor(this.countdown / (1000 * 60 * 60));
      const minutes = Math.floor((this.countdown % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((this.countdown % (1000 * 60)) / 1000);
      
      this.countdownDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style scoped>
.test-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  padding: 2rem;
  position: relative;
}

.fullscreen-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  z-index: 10;
}

.fullscreen-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading {
  font-size: 2rem;
  text-align: center;
}

.prayer-times-container {
  width: 100%;
  max-width: 1000px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 3rem;
}

.next-prayer {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.next-prayer h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.next-prayer .prayer-name {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.countdown {
  font-size: 5rem;
  font-family: monospace;
  letter-spacing: 2px;
}

.all-prayers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.prayer-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.prayer-card.next {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.prayer-card .prayer-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.prayer-card .prayer-time {
  font-size: 1.5rem;
  font-weight: bold;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #2a5298, #1e3c72);
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: white;
  max-width: 400px;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-content h2 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}
</style> 