<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto">
    <input
      v-model="prompt"
      :placeholder="placeholder"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      v-model="apiKey"
      placeholder="OpenRouter API Key"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <div>
      <label class="block text-sm font-bold mb-1">Choose Model:</label>

      <!-- Favorite Models as Buttons -->
      <ScrollArea v-if="favoriteModels.length" class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="fav in favoriteModels"
          :key="fav.id"
          @click="selectedModel = fav.id"
          class="px-3 py-1 text-sm rounded border border-gray-600 bg-gray-700 hover:bg-gray-600"
          :class="{ 'bg-blue-600 border-blue-500 text-white': selectedModel === fav.id }"
        >
          {{ fav.name.split(':')[1]?.trim() }}
        </button>
      </ScrollArea>

      <!-- Dropdown for All Models -->
      <Combobox
        :items="sortedModels"
        :selectedItem="selectedModel"
        @update:selected-item="(id: string) => (selectedModel = id)"
      />
    </div>

    <slot name="button" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Combobox from '@/components/Combobox.vue'
import FAVORITE_MODELS from '@/data/model-favorites'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps<{ placeholder: string }>()

const prompt = useLocalStorage(props.placeholder === 'Describe your SVG...' ? 'svg-prompt' : 'sprite-prompt', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const models = ref<{ id: string; name: string }[]>([])
const selectedModel = useLocalStorage('selected-model', 'cohere/command-r')

const isFavorite = (id: string) => FAVORITE_MODELS.includes(id)
const sortedModels = computed(() =>
  [...models.value].sort((a, b) => {
    const aFav = isFavorite(a.id)
    const bFav = isFavorite(b.id)
    return aFav === bFav ? 0 : aFav ? -1 : 1
  }),
)

// Extract only favorited models for the buttons
const favoriteModels = computed(() => models.value.filter((m) => isFavorite(m.id)))

async function fetchModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    const data = await response.json()
    models.value = data.data.map((m: any) => ({
      id: m.id,
      name: m.name,
    }))
  } catch (error) {
    console.error('Error fetching models:', error)
  }
}

onMounted(() => fetchModels())

defineExpose({ prompt, apiKey, selectedModel, models, sortedModels, favoriteModels })
</script>
