<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto">
    <textarea v-model="prompt" :placeholder="placeholder"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="4" />
    <div class="mb-2">
      <label class="block text-sm font-bold mb-1">AI Provider:</label>
      <select v-model="store.provider"
        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="openrouter">OpenRouter</option>
        <option value="ollama">Ollama (Local)</option>
      </select>
    </div>
    <input v-if="store.provider === 'ollama'" v-model="store.ollamaHost"
      placeholder="Ollama Host (e.g., http://localhost:11434)"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    <div v-if="store.provider === 'openrouter'" class="relative">
      <input :type="showApiKey ? 'text' : 'password'" v-model="store.apiKey" placeholder="OpenRouter API Key"
        class="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button @click="showApiKey = !showApiKey"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
        <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
    <div>
      <label class="block text-sm font-bold mb-1">Choose Model:</label>
      <!-- Favorite Models as Buttons -->
      <ScrollArea v-if="store.favoriteModels.length > 0" class="flex flex-wrap gap-2 mb-2">
        <button v-for="fav in store.favoriteModels" :key="fav.id" @click="store.selectedModel = fav.id"
          class="px-3 py-1 text-sm rounded border border-gray-600 bg-gray-700 hover:bg-gray-600"
          :class="{ 'bg-blue-600 border-blue-500 text-white': store.selectedModel === fav.id }"> {{ fav.name }}
        </button>
      </ScrollArea>
      <!-- Dropdown for All Models -->
      <Combobox :items="store.models" :selectedItem="store.selectedModel"
        @update:selected-item="(id: string) => (store.selectedModel = id)" />
    </div>
    <slot name="button" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Combobox from '@/components/Combobox.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAIStore } from '@/stores/ai'

const props = defineProps<{ placeholder: string }>()

const store = useAIStore()
const showApiKey = ref(false)

const prompt = useLocalStorage(props.placeholder === 'Describe your SVG...' ? 'svg-prompt' : 'sprite-prompt', '')

defineExpose({ prompt })
</script>
