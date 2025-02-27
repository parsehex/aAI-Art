<template>
  <div>
    <GeneratorForm ref="Form" placeholder="Describe your sprite...">
      <template #button>
        <button
          @click="generateSprite"
          class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
        >
          Generate Sprite
        </button>
      </template>
    </GeneratorForm>

    <div :class="[selectedTexture ? '' : 'invisible', 'bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto']">
      <!-- Sprite JSON Preview -->
      <div class="bg-gray-700 p-2 rounded-md">
        <h3 class="text-lg font-bold mb-2">Selected Sprite Data</h3>
        <JsonViewer
          :data="selectedTexture || {}"
          class="text-sm bg-gray-800 p-2 rounded-md max-h-[40vh] w-[20vw] overflow-auto"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import JsonViewer from '@/components/JsonViewer/Viewer.vue'
import GeneratorForm from '@/components/GeneratorForm.vue'
import { GenerateSpriteMessages } from '@/data/prompt'

const Form = ref<typeof GeneratorForm>()

// legacy:
const prompt = useLocalStorage('sprite-prompt', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedTexture = ref<TextureDescription | null>(null)
const selectedModel = useLocalStorage('selected-model', 'cohere/command-r')

async function generateSprite() {
  const m: string = Form.value?.selectedModel || selectedModel.value
  const p: string = Form.value?.prompt || prompt.value
  const a: string = Form.value?.apiKey || apiKey.value
  if (!p.trim() || !a.trim() || !m) return

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${a}`,
      },
      body: JSON.stringify({
        messages: GenerateSpriteMessages(p),
        model: m,
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
})
</script>
