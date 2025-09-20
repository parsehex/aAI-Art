<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto">
    <input v-model="prompt" :placeholder="placeholder"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    <div class="mb-2">
      <label class="block text-sm font-bold mb-1">AI Provider:</label>
      <select v-model="store.provider"
        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="openrouter">OpenRouter</option>
        <option value="ollama">Ollama (Local)</option>
      </select>
    </div>
    <input v-if="store.provider === 'openrouter'" v-model="store.apiKey" placeholder="OpenRouter API Key"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Combobox from '@/components/Combobox.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAIStore } from '@/stores/ai'

const props = defineProps<{ placeholder: string }>()

const store = useAIStore()

const prompt = useLocalStorage(props.placeholder === 'Describe your SVG...' ? 'svg-prompt' : 'sprite-prompt', '')

defineExpose({ prompt })
</script>
