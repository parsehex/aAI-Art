<template>
  <div class="flex flex-col xl:flex-row gap-6 h-full">
    <!-- Left Column: Generator Form -->
    <div class="flex-shrink-0 transition-all duration-300 ease-in-out"
      :class="[formCollapsed ? 'w-full xl:w-auto' : 'w-full xl:w-80']">
      <button @click="formCollapsed = !formCollapsed"
        class="w-full flex items-center justify-between gap-2 py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md transition mb-2 border border-gray-700">
        <span class="text-sm font-medium text-gray-300">Generate</span>
        <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': formCollapsed }"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="!formCollapsed">
        <GeneratorForm ref="Form" placeholder="Describe your sprite...">
          <template #button>
            <button v-if="!aiStore.isLoading" :disabled="!canSend" @click="generateSprite"
              class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50">
              Generate Sprite </button>
            <button v-else @click="aiStore.cancel"
              class="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <SquareIcon class="w-4 h-4 mr-2" /> Stop Generating
            </button>
          </template>
        </GeneratorForm>
      </div>
    </div>
    <!-- Right Column: Sprite Preview and Actions -->
    <div class="flex-1 min-w-0 space-y-4">
      <GameContainer v-show="currentSprite" />
      <!-- Preview and Save Area -->
      <div v-if="currentSprite" class="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-white">Sprite Preview</h3>
          <button @click="redrawSprite" :disabled="isRedrawing"
            class="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!isRedrawing">🎨 Draw Again</span>
            <span v-else class="flex items-center">
              <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              Redrawing...
            </span>
          </button>
        </div>
        <div class="flex items-center gap-4">
          <!-- Preview -->
          <div class="bg-gray-900 p-4 rounded-md border border-gray-600">
            <img v-if="currentPreview" :src="currentPreview" alt="Sprite preview" class="w-32 h-32 pixelated" />
          </div>
          <!-- Info and Actions -->
          <div class="flex-1 space-y-3">
            <div class="text-sm text-gray-300">
              <p v-if="currentSprite.prompt"><strong>Prompt:</strong> {{ currentSprite.prompt }}</p>
              <p v-if="currentSprite.name"><strong>Name:</strong> {{ currentSprite.name }}</p>
              <p><strong>Size:</strong> {{ currentSprite.size }}x{{ currentSprite.size }}px</p>
              <p><strong>Layers:</strong> {{ currentSprite.layers.length }}</p>
            </div>
            <div class="flex gap-2">
              <button v-if="isNewlyGenerated && !isSaved" @click="saveSprite"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"> Save </button>
              <button v-if="isNewlyGenerated && !isSaved" @click="discardSprite"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"> Discard </button>
              <button @click="downloadSprite"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"> Download </button>
            </div>
            <p v-if="justSaved" class="text-green-400 text-sm">✓ Sprite saved successfully!</p>
          </div>
        </div>
        <!-- JSON Viewer -->
        <div class="mt-4 pt-4 border-t border-gray-700 flex items-center">
          <CopyButton :data="jsonDisplayData" class="mr-4" />
          <button @click="jsonCollapsed = !jsonCollapsed"
            class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full">
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ '-rotate-90': jsonCollapsed }"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg> JSON Data </button>
        </div>
        <div v-if="jsonDisplayData !== undefined && jsonDisplayData !== null" v-show="!jsonCollapsed"
          class="mt-2 bg-gray-900 rounded-md overflow-hidden text-xs">
          <JsonViewer :data="jsonDisplayData" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { SquareIcon } from 'lucide-vue-next'
import { useLocalStorage } from '@vueuse/core'
import { v4 } from 'uuid'
import { JsonViewer } from '@parsehex/vuepak'
import CopyButton from '@/components/CopyButton.vue'
import GeneratorForm from '@/components/GeneratorForm.vue'
import { GenerateSpriteMessages } from '@/data/prompt'
import { useAIStore } from '@/stores/ai'
import { useTexturesStore } from '@/stores/textures'
import { TextureGenerator } from '@/utils/TextureGenerator'
import GameContainer from '@/components/GameContainer.vue'
import type { TextureDescription } from '@/types/Textures'

const Form = ref<typeof GeneratorForm>()

const aiStore = useAIStore()
const texturesStore = useTexturesStore()
const textureGenerator = new TextureGenerator()

const selectedTexture = ref<TextureDescription | null>(null)
const generatedSprite = ref<TextureDescription | null>(null)
const spritePreview = ref<string | null>(null)
const justSaved = ref(false)
const isSaved = ref(false)
const isRedrawing = ref(false)
const formCollapsed = useLocalStorage('formCollapsed', true)
const jsonCollapsed = useLocalStorage('jsonCollapsed', true)

// Computed property to get the current sprite (either newly generated or selected)
const currentSprite = computed(() => generatedSprite.value || selectedTexture.value)

// Computed property to check if it's a newly generated sprite
const isNewlyGenerated = computed(() => !!generatedSprite.value)

// Computed property for the preview image
const currentPreview = computed(() => {
  if (spritePreview.value) return spritePreview.value
  if (selectedTexture.value?.thumbnail) return selectedTexture.value.thumbnail
  return null
})

const jsonDisplayData = computed(() => {
  if (!currentSprite.value) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { thumbnail, ...rest } = currentSprite.value
  if (!rest) return null
  // remove any undefined properties
  Object.keys(rest).forEach((key: string) => {
    // @ts-ignore
    if (rest[key] === undefined) delete rest[key]
  })
  return rest
})

const canSend = computed(() => {
  if (aiStore.isLoading) return false;
  const form = Form.value
  if (!form) return false
  if (!form.prompt) return false;
  return true;
})

async function generateSprite() {
  const form = Form.value
  if (!form) return

  const p = form.prompt
  if (!p.trim() || !aiStore.selectedModel) return

  // Clear previous state immediately
  generatedSprite.value = null
  spritePreview.value = null
  selectedTexture.value = null
  justSaved.value = false
  isSaved.value = false

  // Clear GameContainer
  window.dispatchEvent(new Event('spriteCleared'))

  try {
    const { parse } = await import('partial-json')

    const result = await aiStore.generate(
      aiStore.selectedModel,
      GenerateSpriteMessages(p),
      {
        temperature: 0.01,
        onProgress: async (partialContent) => {
          try {
            // Strip markdown code blocks if present in partial content
            let cleanContent = partialContent
            const lines = cleanContent.split('\n')
            if (lines[0]?.startsWith('```')) lines.shift()
            // Don't remove the last line if it's just starting to type ```

            cleanContent = lines.join('\n')

            const partialData = parse(cleanContent)

            // Only update if we have a valid object structure
            if (partialData && typeof partialData === 'object') {
              // Ensure minimal structure for preview
              if (!partialData.size) partialData.size = 64
              if (!partialData.layers) partialData.layers = []

              generatedSprite.value = {
                ...partialData,
                prompt: p,
                id: generatedSprite.value?.id || v4()
              } as TextureDescription

              // Throttle preview generation to avoid performance issues
              // We could add a proper throttle function here if needed
              try {
                spritePreview.value = await textureGenerator.generateImage(generatedSprite.value)
              } catch (e) {
                // Ignore preview generation errors during streaming (incomplete data)
              }

              // Also dispatch event for GameContainer to update incrementally
              window.dispatchEvent(new CustomEvent('spriteSelected', { detail: generatedSprite.value }))
            }
          } catch (e) {
            // Ignore parsing errors for incomplete JSON
          }
        }
      }
    )
    console.log('Full (parsed) model response', result)

    // Final pass to ensure everything is consistent
    if (generatedSprite.value) {
      spritePreview.value = await textureGenerator.generateImage(generatedSprite.value)

      // Also dispatch event for GameContainer
      window.dispatchEvent(new CustomEvent('newTexture', { detail: generatedSprite.value }))
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: generatedSprite.value }))
    }

    form.prompt = ''
  } catch (error) {
    console.error('Error generating sprite:', error)
  }
}

function editSprite() {
  // ???
}

function saveSprite() {
  if (!currentSprite.value) return

  // Add thumbnail to the sprite data
  const spriteToSave = {
    ...currentSprite.value,
    thumbnail: currentPreview.value || undefined,
    id: currentSprite.value.id || v4() // Ensure it has an ID
  }

  texturesStore.addGeneratedTexture(spriteToSave)
  justSaved.value = true
  isSaved.value = true

  // Clear the "just saved" message after 3 seconds
  setTimeout(() => {
    justSaved.value = false
  }, 3000)
}

function discardSprite() {
  clearCurrent()
  window.dispatchEvent(new Event('spriteCleared'))
}

async function downloadSprite() {
  if (!currentSprite.value) return

  const dataUrl = currentPreview.value || await textureGenerator.generateImage(currentSprite.value)
  const filename = `${currentSprite.value.name || currentSprite.value.id || 'sprite'}.png`

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function redrawSprite() {
  if (!currentSprite.value || isRedrawing.value) return

  isRedrawing.value = true
  const sprite = currentSprite.value
  const { thumbnail, ...spriteData } = sprite
  const jsonString = JSON.stringify(spriteData, null, 2)

  try {
    const { parse } = await import('partial-json')

    // Simulate character-by-character reconstruction
    for (let i = 0; i < jsonString.length; i++) {
      const partialJson = jsonString.substring(0, i + 1)

      try {
        const partialData = parse(partialJson)

        if (partialData && typeof partialData === 'object') {
          // Ensure minimal structure
          if (!partialData.size) partialData.size = sprite.size || 64
          if (!partialData.layers) partialData.layers = []

          const tempSprite = {
            ...partialData,
            id: sprite.id,
            prompt: sprite.prompt
          } as TextureDescription

          // Update the current sprite (either generated or selected)
          if (generatedSprite.value) {
            generatedSprite.value = tempSprite
          } else {
            selectedTexture.value = tempSprite
          }

          // Update preview
          try {
            spritePreview.value = await textureGenerator.generateImage(tempSprite)
          } catch (e) {
            // Ignore preview errors during animation
          }

          // Dispatch event for GameContainer
          window.dispatchEvent(new CustomEvent('spriteSelected', { detail: tempSprite }))
        }
      } catch (e) {
        // Ignore parsing errors for incomplete JSON
      }

      // Add a small delay to make the animation visible
      // Adjust speed based on JSON length
      const delay = Math.max(1, Math.min(10, 1000 / jsonString.length))
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Final update to ensure everything is correct
    if (generatedSprite.value) {
      spritePreview.value = await textureGenerator.generateImage(generatedSprite.value)
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: generatedSprite.value }))
    } else if (selectedTexture.value) {
      spritePreview.value = await textureGenerator.generateImage(selectedTexture.value)
      window.dispatchEvent(new CustomEvent('spriteSelected', { detail: selectedTexture.value }))
    }
  } catch (error) {
    console.error('Error redrawing sprite:', error)
  } finally {
    isRedrawing.value = false
  }
}

function clearCurrent() {
  generatedSprite.value = null
  spritePreview.value = null
  selectedTexture.value = null
  justSaved.value = false
}

onMounted(() => {
  window.addEventListener('spriteSelected', async (event: Event) => {
    const customEvent = event as CustomEvent<TextureDescription>
    const selected = customEvent.detail

    // If the selected sprite is the one we just generated, don't clear it
    if (generatedSprite.value && generatedSprite.value.id === selected.id) {
      return
    }

    // Clear any generated sprite so we show the selected one
    generatedSprite.value = null
    spritePreview.value = null

    selectedTexture.value = selected

    // Generate preview if it doesn't have a thumbnail
    if (!selectedTexture.value.thumbnail) {
      selectedTexture.value.thumbnail = await textureGenerator.generateImage(selectedTexture.value)
    }

    if (!selectedTexture.value.prompt || !Form.value) return
    Form.value.prompt = selectedTexture.value.prompt
  })
  window.addEventListener('spriteCleared', () => {
    selectedTexture.value = null
  })
})
</script>
<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
