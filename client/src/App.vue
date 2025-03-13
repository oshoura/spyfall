<script setup lang="ts">
// No need for favicon setup as it's now in index.html
</script>

<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
  color: #2c3e50;
}

.app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}
</style>

