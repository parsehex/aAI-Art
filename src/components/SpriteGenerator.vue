<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto">
    <input
      v-model="prompt"
      placeholder="Describe your sprite..."
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      v-model="apiKey"
      placeholder="OpenRouter API Key"
      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      @click="generateSprite"
      class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
    >
      Generate Sprite
    </button>

    <div v-if="selectedTexture" class="bg-gray-700 p-2 rounded-md">
      <h3 class="text-lg font-bold mb-2">Selected Sprite Data</h3>
      <JsonViewer :data="selectedTexture" class="text-sm bg-gray-800 p-2 rounded-md max-h-[40vh] w-[20vw] overflow-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GenerateSpriteMessages } from '@/data/prompt'
import { useLocalStorage } from '@vueuse/core'
import JsonViewer from '@/components/JsonViewer/Viewer.vue'

const prompt = useLocalStorage('sprite-prompt', '')
const apiKey = useLocalStorage('openrouter-api-key', '')

const selectedTexture = ref<TextureDescription | null>(null)

async function generateSprite() {
  if (!prompt.value.trim() || !apiKey.value.trim()) return

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        messages: GenerateSpriteMessages(prompt.value),
        model: 'cohere/command-r',
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

    console.log('Received sprite data:', msg)

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
})
</script>

<style scoped>
.sprite-generator {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
}
</style>
