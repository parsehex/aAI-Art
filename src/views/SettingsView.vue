<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-white mb-6">Settings</h1>
    <!-- API Configuration -->
    <section class="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg mb-4">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg> API Configuration
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">OpenRouter API Key</label>
          <div class="relative">
            <input :type="showApiKey ? 'text' : 'password'" v-model="store.apiKey" placeholder="sk-or-..."
              class="w-full p-3 pr-10 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            <button @click="showApiKey = !showApiKey"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">Required for using OpenRouter models.</p>
        </div>
      </div>
    </section>
    <!-- Appearance & Behavior -->
    <section class="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg> Appearance & Behavior
      </h2>
      <div class="flex flex-col gap-4">
        <!-- Redraw Speed -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2"> Redraw Speed Factor <span
              class="text-gray-400 font-normal ml-2">({{ store.redrawSpeed }})</span>
          </label>
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-400">Faster</span>
            <input type="range" v-model.number="store.redrawSpeed" min="50" max="2000" step="50"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <span class="text-xs text-gray-400">Slower</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">Controls the delay between steps when redrawing a sprite. Higher values
            mean slower redrawing.</p>
        </div>
        <!-- Canvas Background -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Preview Background Color</label>
          <div class="flex flex-wrap gap-3 mb-3">
            <button v-for="color in presetColors" :key="color.value" @click="store.canvasBackgroundColor = color.value"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              :class="{ 'border-white scale-110': store.canvasBackgroundColor === color.value, 'border-transparent': store.canvasBackgroundColor !== color.value }"
              :style="{ backgroundColor: color.value }" :title="color.name"></button>
          </div>
          <div class="flex items-center gap-2">
            <input type="color" v-model="store.canvasBackgroundColor"
              class="h-10 w-20 bg-transparent border border-gray-600 rounded cursor-pointer" />
            <span class="text-sm text-gray-300 font-mono">{{ store.canvasBackgroundColor }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">Useful for chroma keying (green screen) or preference when using the
            View tab.</p>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const showApiKey = ref(false)

const presetColors = [
  { name: 'Dark Gray', value: '#1f2937' },
  { name: 'Green Screen', value: '#00ff00' },
  { name: 'Blue Screen', value: '#0000ff' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
]
</script>
