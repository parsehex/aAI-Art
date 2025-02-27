<template>
  <div
    id="game-container"
    class="relative mt-2 mx-auto border-2 border-gray-700 shadow-lg rounded-lg overflow-hidden w-full max-w-6xl"
  >
    <div ref="gameContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Game from '../game/config'

let game: Game

onMounted(() => {
  game = new Game()
})

onUnmounted(() => {
  game.destroy(true)
})
</script>

<style scoped>
#game-container {
  width: 50vw;
  max-width: 100%;
  height: 400px;
}
</style>
