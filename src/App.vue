<template>
  <div
    class="flex flex-col items-center min-h-screen min-w-screen bg-gray-900 text-white px-2"
  >
    <p>An experiment to generate graphics using AI language models.</p>
    <div class="flex flex-col items-center space-y-4 w-full max-w-6xl">
      <!-- Generation Type Toggle -->
      <div class="flex space-x-4 mb-4">
        <button
          @click="generationType = 'sprite'"
          :class="[
            'px-4 py-2 rounded-md transition',
            generationType === 'sprite'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          Sprite Generator
        </button>
        <button
          @click="generationType = 'svg'"
          :class="[
            'px-4 py-2 rounded-md transition',
            generationType === 'svg'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          SVG Generator
        </button>
      </div>

      <!-- Generator Components -->
      <div class="w-full">
        <template v-if="generationType === 'sprite'">
          <div class="relative flex flex-col md:flex-row items-center space-x-4 gap-4">
            <GameContainer />
            <SpriteGenerator />
          </div>
        </template>
        <template v-else>
          <SvgGenerator />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameContainer from './components/GameContainer.vue'
import SpriteGenerator from './components/SpriteGenerator.vue'
import SvgGenerator from './components/SvgGenerator.vue'

const generationType = ref<'sprite' | 'svg'>('sprite')
</script>

<style>
.app {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  background-color: #242424;
}
</style>
