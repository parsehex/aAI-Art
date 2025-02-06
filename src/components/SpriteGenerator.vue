<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto">
    <!-- Prompt Input -->
    <input
      v-model="prompt"
      placeholder="Describe your sprite..."
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <!-- API Key Input -->
    <input
      v-model="apiKey"
      placeholder="OpenRouter API Key"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <!-- Model Selector (shadcn combobox) -->
    <div>
      <label class="block text-sm font-bold mb-1">Choose Model:</label>
      <Combobox
        :items="sortedModels"
        :selectedItem="selectedModel"
        v-on:update:selected-item="(id: string) => (selectedModel = id)"
      />
    </div>

    <!-- Generate Button -->
    <button
      @click="generateSprite"
      class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
    >
      Generate Sprite
    </button>

    <!-- Sprite JSON Preview -->
    <div :class="[selectedTexture ? '' : 'invisible', 'bg-gray-700', 'p-2', 'rounded-md']">
      <h3 class="text-lg font-bold mb-2">Selected Sprite Data</h3>
      <JsonViewer
        :data="selectedTexture || {}"
        class="text-sm bg-gray-800 p-2 rounded-md max-h-[40vh] w-[20vw] overflow-auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Combobox from '@/components/Combobox.vue'
import JsonViewer from '@/components/JsonViewer/Viewer.vue'
import FAVORITE_MODELS from '@/data/model-favorites'
import { GenerateSpriteMessages } from '@/data/prompt'

const prompt = useLocalStorage('sprite-prompt', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedTexture = ref<TextureDescription | null>(null)
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

async function fetchModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    const data = await response.json()
    models.value = data.data.map((m: any) => ({ id: m.id, name: m.name }))
  } catch (error) {
    console.error('Error fetching models:', error)
  }
}

async function generateSprite() {
  if (!prompt.value.trim() || !apiKey.value.trim() || !selectedModel.value) return

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        messages: GenerateSpriteMessages(prompt.value),
        model: selectedModel.value,
        temperature: 0.01,
      }),
    })

    if (!response.ok) {
      console.error('API error', response.statusText)
      return
    }

    const data = await response.json()
    let msg: string = data.choices[0].message.content.trim()

    const lines = msg.split('\n')
    if (lines[0].startsWith('```')) {
      msg = lines.slice(1).join('\n')
    }
    if (lines[lines.length - 1].startsWith('```')) {
      msg = lines.slice(0, lines.length - 1).join('\n')
    }

    const newTexture = JSON.parse(msg) as TextureDescription
    window.dispatchEvent(new CustomEvent('newTexture', { detail: newTexture }))
    prompt.value = ''
  } catch (error) {
    console.error('Error generating sprite:', error)
  }
}

onMounted(() => {
  window.addEventListener('spriteSelected', (event: Event) => {
    const customEvent = event as CustomEvent<TextureDescription>
    selectedTexture.value = customEvent.detail
  })
  window.addEventListener('spriteCleared', () => {
    selectedTexture.value = null
  })
  fetchModels()
})
</script>
