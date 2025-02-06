<template>
  <div class="flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-900 text-white px-2">
    <div class="relative flex flex-col md:flex-row items-center space-x-4 gap-4 w-full max-w-6xl">
      <GameContainer />
      <SpriteGenerator />
    </div>
  </div>
</template>

<script setup lang="ts">
import GameContainer from './components/GameContainer.vue'
import SpriteGenerator from './components/SpriteGenerator.vue'
</script>

<style>
.app {
  position: relative; /* Make sure overlays position relative to the app */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  background-color: #242424;
}
</style>
