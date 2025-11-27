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
      <div v-if="!settingsStore.apiKey" class="text-sm text-yellow-400 mb-2"> API Key not set. <router-link
          to="/settings" class="underline hover:text-yellow-300">Go to Settings</router-link>
      </div>
      <div v-else class="text-xs text-green-400 mb-2 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg> API Key set
      </div>
    </div>
    <div v-if="store.provider === 'openrouter'" class="mb-2">
      <label class="block text-sm font-bold mb-1">Reasoning Effort (when applicable):</label>
      <select v-model="store.reasoningEffort"
        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
        <option value="minimal">Minimal</option>
        <option value="none">None</option>
      </select>
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
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{ placeholder: string }>()

const store = useAIStore()
const settingsStore = useSettingsStore()
const showApiKey = ref(false)

const prompt = useLocalStorage(props.placeholder === 'Describe your SVG...' ? 'svg-prompt' : 'sprite-prompt', '')

defineExpose({ prompt })
</script>
