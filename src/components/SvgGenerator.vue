<template>
  <div class="flex items-center gap-4">
    <div class="max-w-sm">
      <GeneratorForm placeholder="Describe your SVG...">
        <template #button>
          <button
            @click="generateSvg"
            class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
          >
            Generate SVG
          </button>
        </template>
      </GeneratorForm>
      <p
        class="w-full px-2 whitespace-pre-line max-h-32 overflow-auto bg-gray-800 p-1 rounded-md shadow-md mt-2"
        v-if="viewingSvg"
      >
        Selected SVG
      </p>
      <p
        class="w-full px-2 whitespace-pre-line max-h-32 overflow-auto bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80 mx-auto"
        v-if="viewingSvg"
      >
        {{ viewingSvg }}
      </p>
      <button
        v-if="viewingSvg"
        @click="downloadSvg"
        class="w-full mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
      >
        Download SVG
      </button>
    </div>

    <div v-if="generatedSVGs.length || svgPresets.length">
      <h3 class="text-lg font-bold mb-2">SVG Gallery</h3>
      <div class="flex flex-wrap gap-4">
        <!-- Show presets -->
        <div
          v-for="(preset, i) in svgPresets"
          :key="'preset-' + i"
          class="border p-2 rounded overflow-hidden"
        >
          <div v-html="preset" class="w-64 h-64" @click="viewingSvg = preset"></div>
        </div>
        <!-- Show generated SVGs -->
        <div
          v-for="(svg, i) in generatedSVGs"
          :key="'generated-' + i"
          class="border p-2 rounded overflow-hidden"
        >
          <div v-html="svg" class="w-64 h-64" @click="viewingSvg = svg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import GeneratorForm from '@/components/GeneratorForm.vue'
import { presetSVGs } from '@/data/preset-svgs/registry'

const Form = ref<typeof GeneratorForm>()

// TODO use data structure with name
const generatedSVGs = ref<string[]>([])

const prompt = useLocalStorage('svg-prompt', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedModel = useLocalStorage('selected-model', 'cohere/command-r')
const viewingSvg = ref('')

const svgPresets = presetSVGs

function generateSvgPrompt(userPrompt: string) {
  return [
    {
      role: "system",
      content: `You are an SVG generator. Create SVG code based on text descriptions. Follow these rules:
  - Generate valid, working SVG code
  - Use viewBox instead of fixed width/height
  - Keep the SVG simple and clean
  - Use basic shapes (rect, circle, path, etc.)
  - Add comments to explain the main elements
  - Return ONLY the SVG code with no markdown or other text`
    },
    { role: "user", content: userPrompt }
  ]
}

async function generateSvg() {
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
        messages: generateSvgPrompt(p),
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
    // remove markdown ticks if present
    const lines = msg.split('\n')
    if (lines[0].startsWith('```')) {
      msg = lines.slice(1).join('\n')
    }
    if (lines[lines.length - 1].startsWith('```')) {
      msg = lines.slice(0, lines.length - 1).join('\n')
    }
    generatedSVGs.value.push(msg)
    prompt.value = ''
    viewingSvg.value = msg
  } catch (error) {
    console.error('Error generating SVG:', error)
  }
}

function downloadSvg() {
  // Create a blob of the current SVG text
  const blob = new Blob([viewingSvg.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'generated.svg'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
